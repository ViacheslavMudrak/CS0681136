import {
  MarketNewsHeroPersonalizedSearch_GQL,
  SiteAreaTagMeta_GQL,
} from 'src/components/IntranetComponents/MarketNewsHero/MarketNewsHeroSearch.graphql';
import { getRedisClient } from 'lib/cache/redis';
import { buildUserGroupSet, filterVisibleItems } from 'lib/auth/visibility-filter';
import { ASCENSION_SITE_NONE, ASCENSION_SITE_UNKNOWN } from 'lib/home-site/types';
import { clientFactory } from 'lib/sitecore-client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import type { QueryData } from 'src/components/IntranetComponents/MarketNewsHero/MarketNewsHero.types';
import { TAG_CONSTANTS } from 'src/constants/tag-constants';
import { TEMPLATE_ID_CONSTANTS } from 'src/constants/template-ids';
import { buildOrPredicateString } from 'src/util/graphql/helpers/buildGraphqlOrPredicateString';
import { applyEmbargoCutoff } from 'src/util/helpers/embargo-helper';
import { log } from 'src/util/helpers/log-helper';

import { authOptions } from '../../auth/[...nextauth]';

const COMPONENT = 'api:market-news-hero';
const CACHE_TTL_SECONDS = 15 * 60;
const CACHE_TTL_JITTER_SECONDS = 60;
const TAG_META_CACHE_TTL_SECONDS = 60 * 60;

/**
 * Spread cache-entry expirations across a 60s window so that adjacent entries
 * written during a cold-start burst do not all expire on the same wall-clock
 * second — which would otherwise produce a synchronised refresh wave against
 * Sitecore Edge.
 */
function cacheTtlSeconds(): number {
  return CACHE_TTL_SECONDS + Math.floor(Math.random() * CACHE_TTL_JITTER_SECONDS);
}

/**
 * Per-pod request coalescing for the Sitecore Edge fetch. When the Redis
 * entry for a given cacheKey is cold, the first request to miss kicks off the
 * Edge fetch and stores the promise here; concurrent requests for the same
 * key await the same promise instead of each firing their own Edge request.
 * This caps Sitecore Edge concurrency at one per pod per key, protecting the
 * 80 req/s ceiling during cache-expiry thundering-herd moments.
 */
const inFlight = new Map<string, Promise<MarketNewsHeroApiResponse>>();

/**
 * Display caps the hero component renders. The query over-fetches beyond these
 * so per-user visibility filtering can drop gated articles without starving
 * the component (see applyVisibilityFilter).
 */
const FEATURED_DISPLAY_COUNT = 1;
const NON_FEATURED_DISPLAY_COUNT = 3;

interface SiteAreaTagMetaResponse {
  item: {
    id: string;
    title: { value: string } | null;
    facetCategory: { value: string } | null;
  } | null;
}

export type MarketNewsHeroApiResponse = QueryData & {
  seeMoreFilterParams: string;
};

async function fetchTagMeta(
  itemId: string,
  language: string
): Promise<{ title: string; facetCategory: string } | null> {
  const redis = await getRedisClient();
  const cacheKey = `market-news-hero:tag-meta:${itemId}:${language}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // cache miss, continue
  }

  try {
    const client = clientFactory();
    const data = await client.request<SiteAreaTagMetaResponse>(SiteAreaTagMeta_GQL, {
      itemId,
      language,
    });
    if (!data.item) return null;

    const result = {
      title: data.item.title?.value ?? '',
      facetCategory: data.item.facetCategory?.value ?? '',
    };

    try {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', TAG_META_CACHE_TTL_SECONDS);
    } catch {
      // non-fatal
    }

    return result;
  } catch (error) {
    log('WARNING', COMPONENT, 'Failed to fetch tag meta', { itemId, error: String(error) });
    return null;
  }
}

function buildSeeMoreFilterParams(tags: Array<{ title: string; facetCategory: string }>): string {
  if (!tags.length) return '';
  const params = new URLSearchParams();
  for (const tag of tags) {
    if (tag.facetCategory && tag.title) {
      params.append(`f.${tag.facetCategory}`, tag.title);
    }
  }
  return params.toString();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const session = await getServerSession(req, res, authOptions);

  const { nonMarketSiteAreaItemId, language = 'en' } = req.query;
  if (!nonMarketSiteAreaItemId || typeof nonMarketSiteAreaItemId !== 'string') {
    return res.status(400).json({ error: 'nonMarketSiteAreaItemId is required' });
  }
  if (typeof language !== 'string') {
    return res.status(400).json({ error: 'Invalid language parameter' });
  }

  const userId = session?.user?.id ?? 'anonymous';
  const homeSite = session?.newsHomeSite ?? ASCENSION_SITE_UNKNOWN;
  const isSentinel =
    homeSite.itemId === ASCENSION_SITE_UNKNOWN.itemId ||
    homeSite.itemId === ASCENSION_SITE_NONE.itemId;
  const isMarket = homeSite.isMarket && !isSentinel && homeSite.siteLevelAssociationTags.length > 0;

  /**
   * Cache key is intentionally NOT scoped by user groups. The Edge GraphQL
   * response doesn't vary by user (no per-user predicates) so the expensive
   * roundtrip is shareable; the cheap visibleBy filter runs per request below.
   */
  const cacheKey = `market-news-hero:${homeSite.itemId}:${nonMarketSiteAreaItemId}:${language}`;
  const userGroupEmails = buildUserGroupSet(session?.googleGroups);

  const redis = await getRedisClient();

  let cachedResponse: MarketNewsHeroApiResponse | null = null;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      cachedResponse = JSON.parse(cached) as MarketNewsHeroApiResponse;
    }
  } catch {
    // cache miss, continue
  }

  if (cachedResponse) {
    return res.status(200).json(applyVisibilityFilter(cachedResponse, userGroupEmails));
  }

  let fetchPromise = inFlight.get(cacheKey);
  if (!fetchPromise) {
    fetchPromise = (async () => {
      let areaTagIds: string[];
      let seeMoreTags: Array<{ title: string; facetCategory: string }>;

      if (isMarket) {
        areaTagIds = homeSite.siteLevelAssociationTags.map((t) => t.id);
        seeMoreTags = homeSite.siteLevelAssociationTags.map((t) => ({
          title: t.title?.value ?? '',
          facetCategory: t.facetCategory?.value ?? '',
        }));
      } else {
        areaTagIds = [nonMarketSiteAreaItemId];
        const tagMeta = await fetchTagMeta(nonMarketSiteAreaItemId, language);
        seeMoreTags = tagMeta ? [tagMeta] : [];
      }

      if (!areaTagIds.length) {
        log('WARNING', COMPONENT, 'No area tag IDs resolved, returning empty results', { userId });
        return {
          featured: { results: [] },
          nonFeatured: { results: [] },
          seeMoreFilterParams: '',
        };
      }

      const areaTagsPredicate = buildOrPredicateString(areaTagIds, 'areaTags');

      let query = MarketNewsHeroPersonalizedSearch_GQL;
      query = query.replace('__DFD_FEATURED_TAG_ID__', TAG_CONSTANTS.DFD_FEATURED_TAG_ID);
      query = query.replace('__DFD_NON_FEATURED_TAG_ID__', TAG_CONSTANTS.DFD_NON_FEATURED_TAG_ID);
      query = query.replaceAll('__TEMPLATE_ID__', TEMPLATE_ID_CONSTANTS.NEWS_DETAIL_PAGE);
      query = query.replaceAll('__LANGUAGE__', language);
      query = query.replaceAll('__AREA_TAGS_PREDICATE__', areaTagsPredicate);
      query = applyEmbargoCutoff(query);

      const client = clientFactory();
      const rawNewsData = await client.request<QueryData>(query);

      // Cache the UNFILTERED response so subsequent users can reuse it.
      const unfilteredResponse: MarketNewsHeroApiResponse = {
        featured: { results: rawNewsData.featured?.results ?? [] },
        nonFeatured: { results: rawNewsData.nonFeatured?.results ?? [] },
        seeMoreFilterParams: buildSeeMoreFilterParams(seeMoreTags),
      };

      try {
        await redis.set(cacheKey, JSON.stringify(unfilteredResponse), 'EX', cacheTtlSeconds());
      } catch {
        // non-fatal
      }

      return unfilteredResponse;
    })().finally(() => {
      inFlight.delete(cacheKey);
    });
    inFlight.set(cacheKey, fetchPromise);
  }

  try {
    const unfilteredResponse = await fetchPromise;
    return res.status(200).json(applyVisibilityFilter(unfilteredResponse, userGroupEmails));
  } catch (error) {
    log('ERROR', COMPONENT, 'Failed to fetch market news hero data', {
      userId,
      error: String(error),
    });
    return res.status(500).json({ error: 'Failed to fetch market news' });
  }
}

/**
 * Apply the per-request visibleBy filter to a cached or freshly-fetched
 * response. Mirrors the GatekeeperProxy's page + ancestor checks so the hero
 * never surfaces articles the current user would be 403'd from on click. The
 * ListingVisibilityFields fragment baked into the query provides the
 * visibleBy/ancestors projection this expects.
 */
function applyVisibilityFilter(
  response: MarketNewsHeroApiResponse,
  userGroupEmails: Set<string>
): MarketNewsHeroApiResponse {
  const featuredVisible = filterVisibleItems(response.featured?.results ?? [], userGroupEmails);
  const nonFeaturedVisible = filterVisibleItems(
    response.nonFeatured?.results ?? [],
    userGroupEmails
  );

  const featured = featuredVisible.slice(0, FEATURED_DISPLAY_COUNT);
  const nonFeatured = nonFeaturedVisible.slice(0, NON_FEATURED_DISPLAY_COUNT);

  log('INFO', COMPONENT, 'Filtered market-news-hero by visibleBy', {
    featuredTotal: response.featured?.results?.length ?? 0,
    featuredVisible: featuredVisible.length,
    featuredReturned: featured.length,
    nonFeaturedTotal: response.nonFeatured?.results?.length ?? 0,
    nonFeaturedVisible: nonFeaturedVisible.length,
    nonFeaturedReturned: nonFeatured.length,
    userGroupCount: userGroupEmails.size,
  });

  return {
    featured: { results: featured },
    nonFeatured: { results: nonFeatured },
    seeMoreFilterParams: response.seeMoreFilterParams,
  };
}
