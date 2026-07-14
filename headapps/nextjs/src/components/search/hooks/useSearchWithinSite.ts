import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSwr } from 'lib/swr/use-swr-hook';
import { log } from 'src/util/helpers/log-helper';
import type { AscensionSite, AscensionSiteTag } from 'lib/home-site/types';
import type { AscensionSiteSlim } from 'src/pages/api/search/ascension-sites';

const COMPONENT_LOG_NAME = 'hook:search-within-site';

export interface SearchWithinSite {
  id: string;
  name: string;
  url: string;
  site_level_association_tags: AscensionSiteTag[];
}

/** Normalize a path for comparison: decode URI, lowercase, replace spaces with hyphens. Should match sitecore URL generation. */
const normalizePath = (path: string): string =>
  decodeURIComponent(path).toLowerCase().replaceAll(' ', '-');

/**
 * Matches the current page URL against Ascension site definitions to determine
 * which site the user is browsing. Uses longest-prefix matching on the URL path.
 *
 * Fetches fresh site data (including siteLevelAssociationTags) via a second API
 * call once a matching slim site is found. Only returns a matched site when the
 * full site data has at least one association tag.
 *
 * Also returns a `searchWithinQueryString` built from the tags, formatted as
 * `f.[facetCategory]=[tagTitle]` params for use on the search results page.
 */
export function useSearchWithinSite(enabled = true) {
  const router = useRouter();

  // Phase 1: fetch slim site list for URL matching
  const { data: sites, isLoading: isSitesLoading } = useSwr<AscensionSiteSlim[]>({
    key: enabled ? '/api/search/ascension-sites' : null,
  });

  // Find the longest URL-prefix match for the current page
  const matchedSlimSite = useMemo<AscensionSiteSlim | null>(() => {
    if (!enabled || !sites?.length) return null;

    const currentPath = normalizePath(router.asPath.split('?')[0]);

    log(
      'INFO',
      COMPONENT_LOG_NAME,
      'Matching current path against sites',
      {
        currentPath,
        sitesLoaded: sites.length,
        sites: sites.map((s) => {
          try {
            return { name: s.name, path: normalizePath(new URL(s.url).pathname) };
          } catch {
            return { name: s.name, path: s.url };
          }
        }),
      },
      true
    );

    let bestMatch: AscensionSiteSlim | null = null;
    let bestMatchLength = 0;

    for (const site of sites) {
      try {
        const sitePath = normalizePath(new URL(site.url).pathname);
        if (sitePath === '/' || sitePath.length === 0) continue;

        if (currentPath.startsWith(sitePath) && sitePath.length > bestMatchLength) {
          bestMatch = site;
          bestMatchLength = sitePath.length;
        }
      } catch {
        continue;
      }
    }

    if (bestMatch) {
      log(
        'INFO',
        COMPONENT_LOG_NAME,
        'Matched slim site, fetching full site data',
        { name: bestMatch.name, id: bestMatch.id },
        true
      );
    } else {
      log('INFO', COMPONENT_LOG_NAME, 'No site matched path', { currentPath }, true);
    }

    return bestMatch;
  }, [enabled, sites, router.asPath]);

  // Phase 2: fetch latest siteLevelAssociationTags for the matched site
  const { data: fullSite, isLoading: isFullSiteLoading } = useSwr<AscensionSite>({
    key: enabled && matchedSlimSite?.id ? `/api/search/ascension-site/${matchedSlimSite.id}` : null,
  });

  const matchedSite = useMemo<SearchWithinSite | null>(() => {
    if (!matchedSlimSite || !fullSite?.siteLevelAssociationTags?.length) return null;

    log(
      'INFO',
      COMPONENT_LOG_NAME,
      'Full site data loaded',
      {
        name: matchedSlimSite.name,
        tagCount: fullSite.siteLevelAssociationTags.length,
      },
      true
    );

    return {
      id: matchedSlimSite.id,
      name: matchedSlimSite.name,
      url: matchedSlimSite.url,
      site_level_association_tags: fullSite.siteLevelAssociationTags,
    };
  }, [matchedSlimSite, fullSite]);

  // Build f.[facetCategory]=[tagTitle] params for the search results page
  const searchWithinQueryString = useMemo<string>(() => {
    if (!matchedSite?.site_level_association_tags?.length) return '';

    const params = new URLSearchParams();
    for (const tag of matchedSite.site_level_association_tags) {
      const category = tag.facetCategory?.value as string | undefined;
      const title = tag.title?.value as string | undefined;
      if (category && title) {
        params.append(`f.${category}`, title);
      }
    }
    return params.toString();
  }, [matchedSite]);

  const isLoading = isSitesLoading || (!!matchedSlimSite && isFullSiteLoading);

  return { matchedSite, isLoading, searchWithinQueryString };
}
