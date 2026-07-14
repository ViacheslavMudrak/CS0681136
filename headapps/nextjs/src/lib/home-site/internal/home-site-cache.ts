/**
 * Redis cache for home site data.
 * - Individual Ascension site: 24h TTL (sites re-index daily)
 * - Site mapping rules: 1h TTL (separate source, re-indexes quickly)
 * - User home site: 2h hard TTL with 1h soft TTL for stale-while-revalidate
 */

import { getRedisClient } from 'lib/cache/redis';
import type { SiteMappingItem } from 'lib/sitecore-search/types/discover';

import { ASCENSION_SITE_NONE, ASCENSION_SITE_UNKNOWN, type AscensionSite } from '../types';

const SITE_PREFIX = 'ascension:site:';
const SITE_TTL_SECONDS = process.env.NEXT_PUBLIC_ENV === 'LOCAL' ? 10 : 60 * 60; // local: 10s TTL, prod: 1 hour

const SITE_MAPPINGS_CACHE_KEY = 'home-site:site-mappings';
const SITE_MAPPINGS_TTL_SECONDS = process.env.NEXT_PUBLIC_ENV === 'LOCAL' ? 10 : 60 * 60; // local: 10s TTL, prod: 1 hour

const USER_HOME_SITE_PREFIX = 'home-site:user:';
const USER_SOFT_TTL_MS = process.env.NEXT_PUBLIC_ENV === 'LOCAL' ? 10 : 60 * 60 * 1000; // local: 10s TTL, prod: 1 hour (for staleness check)
const USER_HARD_TTL_SECONDS = process.env.NEXT_PUBLIC_ENV === 'LOCAL' ? 20 : 2 * 60 * 60; // local: 20s TTL, prod: 2 hours (Redis expiry)

export interface CachedUserHomeSite {
  site: AscensionSite;
  isStale: boolean;
}

interface UserHomeSiteCacheEntry {
  site: AscensionSite;
  cachedAt: number;
}

// -- Individual Ascension site cache (24h) --

export async function getCachedAscensionSite(itemId: string): Promise<AscensionSite | null> {
  const redis = await getRedisClient();
  const raw = await redis.get(`${SITE_PREFIX}${itemId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AscensionSite;
  } catch {
    return null;
  }
}

export async function setCachedAscensionSite(itemId: string, site: AscensionSite): Promise<void> {
  const redis = await getRedisClient();
  await redis.setex(`${SITE_PREFIX}${itemId}`, SITE_TTL_SECONDS, JSON.stringify(site));
}

// -- Site mappings cache (1h) --

export async function getCachedSiteMappings(): Promise<SiteMappingItem[] | null> {
  const redis = await getRedisClient();
  const raw = await redis.get(SITE_MAPPINGS_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SiteMappingItem[];
  } catch {
    return null;
  }
}

export async function setCachedSiteMappings(mappings: SiteMappingItem[]): Promise<void> {
  const redis = await getRedisClient();
  await redis.setex(SITE_MAPPINGS_CACHE_KEY, SITE_MAPPINGS_TTL_SECONDS, JSON.stringify(mappings));
}

// -- User home site cache (1h soft / 2h hard, stale-while-revalidate) --

export async function getCachedUserHomeSite(userId: string): Promise<CachedUserHomeSite | null> {
  const redis = await getRedisClient();
  const raw = await redis.get(`${USER_HOME_SITE_PREFIX}${userId}`);
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw) as UserHomeSiteCacheEntry;
    let site = entry.site;
    if (site.itemId === ASCENSION_SITE_UNKNOWN.itemId) site = ASCENSION_SITE_UNKNOWN;
    if (site.itemId === ASCENSION_SITE_NONE.itemId) site = ASCENSION_SITE_NONE;
    const age = Date.now() - entry.cachedAt;
    return { site, isStale: age > USER_SOFT_TTL_MS };
  } catch {
    return null;
  }
}

export async function setCachedUserHomeSite(userId: string, site: AscensionSite): Promise<void> {
  const redis = await getRedisClient();
  const entry: UserHomeSiteCacheEntry = { site, cachedAt: Date.now() };
  await redis.setex(
    `${USER_HOME_SITE_PREFIX}${userId}`,
    USER_HARD_TTL_SECONDS,
    JSON.stringify(entry)
  );
}
