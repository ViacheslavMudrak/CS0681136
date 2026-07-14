/**
 * Home site identification service.
 * Resolves authenticated user's home site from site mapping rules and caches results.
 *
 * Flow: Redis user cache (SWR) -> Firestore preference -> mapping rules -> GraphQL fetch
 */

import {
  getCachedAscensionSite,
  getCachedSiteMappings,
  getCachedUserHomeSite,
  setCachedAscensionSite,
  setCachedSiteMappings,
  setCachedUserHomeSite,
} from './internal/home-site-cache';
import { userPreferencesService } from 'lib/firebase/server';
import { getSiteMappings } from 'lib/sitecore-search/services/site-mapping-service';
import { fetchUserSettings } from 'lib/user-settings/user-settings-service';
import { log } from 'src/util/helpers/log-helper';
import type { GoogleProfileData } from 'ts/google';
import { SiteChoiceModel, UserDefaultSettings } from 'ts/user-default-settings';

import { fetchAscensionSiteById } from './internal/site-builder';
import { resolveHomeSiteIdFromMapping } from './internal/site-mapping-helper';
import { ASCENSION_SITE_NONE, ASCENSION_SITE_UNKNOWN, type AscensionSite } from './types';

const COMPONENT = 'home-site:service';

async function loadSiteMappings() {
  const cached = await getCachedSiteMappings();
  if (cached) return cached;

  const mappingRes = await getSiteMappings();
  const mappings = mappingRes.widgets?.[0]?.content ?? [];
  await setCachedSiteMappings(mappings);
  return mappings;
}

/**
 * Resolve an AscensionSite by its Sitecore item ID.
 * Checks per-site Redis cache (1h TTL) first, then falls back to Edge GraphQL.
 */
export async function loadAscensionSiteById(itemId: string): Promise<AscensionSite> {
  const cached = await getCachedAscensionSite(itemId);
  if (cached) return cached;

  const site = await fetchAscensionSiteById(itemId);
  if (!site) {
    log('WARNING', COMPONENT, 'Could not fetch site from Edge, returning NONE', { itemId });
    return ASCENSION_SITE_NONE;
  }
  await setCachedAscensionSite(itemId, site);
  return site;
}

function isSentinel(itemId: string): boolean {
  return itemId === ASCENSION_SITE_UNKNOWN.itemId || itemId === ASCENSION_SITE_NONE.itemId;
}

function findSiteNameInChoices(siteId: string, choices?: SiteChoiceModel | null): string | null {
  const matchingSite = (choices?.targetItems ?? []).find((site) => site.id === siteId);
  return matchingSite?.name ?? null;
}

export async function validateHomeSiteInNewsSiteChoices(
  homeSiteId: string | null,
  userDefaultSettings?: UserDefaultSettings | null
): Promise<string> {
  if (!homeSiteId) {
    return 'Unknown';
  }
  if (!userDefaultSettings) {
    userDefaultSettings = await fetchUserSettings();
  }
  return (
    findSiteNameInChoices(homeSiteId, userDefaultSettings?.targetItem?.newsSiteChoiceSelection) ??
    'Unknown'
  );
}

export async function validateSupplementalSiteInNewsSiteChoices(
  siteId: string | null,
  userDefaultSettings?: UserDefaultSettings | null
): Promise<string> {
  if (!siteId) {
    return 'Unknown';
  }
  if (!userDefaultSettings) {
    userDefaultSettings = await fetchUserSettings();
  }
  const targetItem = userDefaultSettings?.targetItem;
  return (
    findSiteNameInChoices(siteId, targetItem?.supplementalSiteChoiceSelection) ??
    findSiteNameInChoices(siteId, targetItem?.newsSiteChoiceSelection) ??
    'Unknown'
  );
}

/**
 * Full resolution: Firestore preference -> mapping rules -> GraphQL fetch.
 * Writes result to user Redis cache.
 */
async function resolveAndCache(
  userId: string,
  googleProfile: GoogleProfileData
): Promise<AscensionSite> {
  const preferredHomeSiteId = await userPreferencesService.getPreferredNewsHomeSite(userId);
  if (preferredHomeSiteId && preferredHomeSiteId.trim() !== '') {
    log(
      'INFO',
      COMPONENT,
      'Using Firestore preferred home site',
      { userId, preferredHomeSiteId },
      true
    );
    const siteName = await validateHomeSiteInNewsSiteChoices(preferredHomeSiteId);
    if (siteName === 'Unknown') {
      return ASCENSION_SITE_UNKNOWN;
    } else {
      const site = await loadAscensionSiteById(preferredHomeSiteId.trim());
      await setCachedUserHomeSite(userId, site);
      return site;
    }
  }

  const mappings = await loadSiteMappings();
  const resolvedId = resolveHomeSiteIdFromMapping(mappings, googleProfile);

  if (isSentinel(resolvedId)) {
    const sentinel =
      resolvedId === ASCENSION_SITE_UNKNOWN.itemId ? ASCENSION_SITE_UNKNOWN : ASCENSION_SITE_NONE;
    await setCachedUserHomeSite(userId, sentinel);
    return sentinel;
  }

  const site = await loadAscensionSiteById(resolvedId);
  await setCachedUserHomeSite(userId, site);
  return site;
}

/**
 * Resolve home site for a user.
 * 1. Redis user cache (stale-while-revalidate: fresh = return, stale = return + background refresh)
 * 2. On miss: full resolution via {@link resolveAndCache}
 */
export async function getNewsHomeSite(
  userId: string,
  googleProfile: GoogleProfileData
): Promise<AscensionSite> {
  const cached = await getCachedUserHomeSite(userId);

  if (cached && !cached.isStale) {
    log(
      'INFO',
      COMPONENT,
      'User home site cache hit (fresh)',
      { userId, siteName: cached.site.siteName },
      true
    );
    return cached.site;
  }

  if (cached && cached.isStale) {
    log(
      'INFO',
      COMPONENT,
      'User home site cache hit (stale), revalidating in background',
      { userId, siteName: cached.site.siteName },
      true
    );
    resolveAndCache(userId, googleProfile).catch((error) => {
      log('WARNING', COMPONENT, 'Background revalidation failed', {
        userId,
        error: String(error),
      });
    });
    return cached.site;
  }

  log('INFO', COMPONENT, 'User home site cache miss, resolving', { userId }, true);
  return resolveAndCache(userId, googleProfile);
}

export async function getNewsSupplementalSites(
  userId: string
): Promise<AscensionSite[] | undefined> {
  const preferredNewsSites = await userPreferencesService.getPreferredNewsSupplementalSites(userId);
  if (preferredNewsSites && preferredNewsSites.length > 0) {
    const userDefaultSettings = await fetchUserSettings();
    const newsSites: AscensionSite[] = [];
    const validSiteIds: string[] = [];
    for (const siteId of preferredNewsSites) {
      const siteName = await validateSupplementalSiteInNewsSiteChoices(siteId, userDefaultSettings);
      if (siteName !== 'Unknown') {
        const site = await loadAscensionSiteById(siteId);
        newsSites.push(site);
        validSiteIds.push(siteId);
      }
    }
    if (newsSites.length !== preferredNewsSites.length) {
      await userPreferencesService.savePreferredNewsSupplementalSites(userId, validSiteIds);
      log(
        'WARNING',
        COMPONENT,
        'Some preferred news sites were not valid. Updating firebase data.'
      );
    }
    return newsSites;
  }
  return undefined;
}

export async function hasNewsSupplementalSites(userId: string): Promise<boolean> {
  const preferredNewsSites = await userPreferencesService.getPreferredNewsSupplementalSites(userId);
  return !!preferredNewsSites && preferredNewsSites.length > 0;
}

export async function hasNewsHomeSite(userId: string): Promise<boolean> {
  const preferredNewsHomeSite = await userPreferencesService.getPreferredNewsHomeSite(userId);
  return !!preferredNewsHomeSite;
}
