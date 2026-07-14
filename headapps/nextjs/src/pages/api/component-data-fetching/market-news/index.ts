import { MarketNewsSearch_GQL } from 'components/IntranetComponents/MarketNews/MarketNewsSearch.graphql';
import type { QueryData } from 'components/IntranetComponents/MarketNews/MarketNews.types';
import { buildUserGroupSet, filterVisibleItems } from 'lib/auth/visibility-filter';
import { getRedisClient } from 'lib/cache/redis';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import scConfig from 'sitecore.config';
import { TAG_CONSTANTS } from 'src/constants/tag-constants';
import { TEMPLATE_ID_CONSTANTS } from 'src/constants/template-ids';
import { buildMultiFieldOrPredicateString } from 'src/util/graphql/helpers/buildMultiFieldOrPredicateString';
import { applyEmbargoCutoff } from 'src/util/helpers/embargo-helper';
import { log } from 'src/util/helpers/log-helper';

import { createGraphQLClientFactory } from '@sitecore-content-sdk/nextjs/client';

import { authOptions } from '../../auth/[...nextauth]';

const COMPONENT = 'api:market-news';
const CACHE_TTL_SECONDS = 15 * 60;
const CACHE_TTL_JITTER_SECONDS = 60;

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
const inFlight = new Map<string, Promise<QueryData>>();

/**
 * Returns featured + non-featured market news articles matching the supplied
 * tag sets that the current user is allowed to see. Filters by visibleBy
 * server-side so unauthorized articles never reach the browser.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  const { homePageId, language = 'en', featuredTagIds, nonFeaturedTagIds } = req.query;
  const siteHomeItemId = Array.isArray(homePageId) ? homePageId[0] : (homePageId as string);
  const siteLanguage = Array.isArray(language) ? language[0] : (language as string);
  const rawFeatured = Array.isArray(featuredTagIds)
    ? featuredTagIds[0]
    : (featuredTagIds as string);
  const rawNonFeatured = Array.isArray(nonFeaturedTagIds)
    ? nonFeaturedTagIds[0]
    : (nonFeaturedTagIds as string);

  if (!siteHomeItemId) {
    return res.status(400).json({ error: 'homePageId is required' });
  }

  const featuredIds = (rawFeatured ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const nonFeaturedIds = (rawNonFeatured ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  if (featuredIds.length === 0 && nonFeaturedIds.length === 0) {
    return res.status(200).json({ featured: { results: [] }, nonFeatured: { results: [] } });
  }

  const sortedFeatured = [...featuredIds].sort().join(',');
  const sortedNonFeatured = [...nonFeaturedIds].sort().join(',');
  const cacheKey = `market-news:${siteHomeItemId}:${siteLanguage}:${sortedFeatured}:${sortedNonFeatured}`;

  let allData: QueryData | null = null;
  try {
    const redis = await getRedisClient();
    const cached = await redis.get(cacheKey);
    if (cached) {
      allData = JSON.parse(cached) as QueryData;
    }
  } catch (cacheError) {
    log('WARNING', COMPONENT, 'Cache read failed', { error: String(cacheError) });
  }

  if (allData === null) {
    let fetchPromise = inFlight.get(cacheKey);
    if (!fetchPromise) {
      fetchPromise = (async () => {
        const tagPredicateFeatured = buildMultiFieldOrPredicateString(featuredIds, [
          'topicTags',
          'areaTags',
          'contentTags',
        ]);
        const tagPredicateNonFeatured = buildMultiFieldOrPredicateString(nonFeaturedIds, [
          'topicTags',
          'areaTags',
          'contentTags',
        ]);

        const graphQLClient = createGraphQLClientFactory({ api: scConfig.api })();

        let query = MarketNewsSearch_GQL;
        query = query.replace(
          '__MARKET_NEWS_FEATURED_TAG_ID__',
          TAG_CONSTANTS.MARKET_NEWS_FEATURED_TAG_ID
        );
        query = query.replace(
          '__MARKET_NEWS_NON_FEATURED_TAG_ID__',
          TAG_CONSTANTS.MARKET_NEWS_NON_FEATURED_TAG_ID
        );
        query = query.replace('__TAG_PREDICATES_FEATURED__', tagPredicateFeatured);
        query = query.replace('__TAG_PREDICATES_NONFEATURED__', tagPredicateNonFeatured);
        query = query.replaceAll('__ANCESTOR_ID__', siteHomeItemId);
        query = query.replaceAll('__TEMPLATE_ID__', TEMPLATE_ID_CONSTANTS.NEWS_DETAIL_PAGE);
        query = query.replaceAll('__LANGUAGE__', siteLanguage);
        query = applyEmbargoCutoff(query);

        const response = await graphQLClient.request<QueryData>(query);
        const fetched: QueryData = {
          featured: { results: featuredIds.length === 0 ? [] : (response.featured?.results ?? []) },
          nonFeatured: {
            results: nonFeaturedIds.length === 0 ? [] : (response.nonFeatured?.results ?? []),
          },
        };

        try {
          const redis = await getRedisClient();
          await redis.set(cacheKey, JSON.stringify(fetched), 'EX', cacheTtlSeconds());
        } catch (cacheError) {
          log('WARNING', COMPONENT, 'Cache write failed', { error: String(cacheError) });
        }

        return fetched;
      })().finally(() => {
        inFlight.delete(cacheKey);
      });
      inFlight.set(cacheKey, fetchPromise);
    }

    try {
      allData = await fetchPromise;
    } catch (error) {
      log('ERROR', COMPONENT, 'Failed to fetch market news', { error: String(error) });
      return res.status(500).json({ error: 'Failed to fetch market news' });
    }
  }

  const userGroupEmails = buildUserGroupSet(session?.googleGroups);
  const featuredItems = allData.featured?.results ?? [];
  const nonFeaturedItems = allData.nonFeatured?.results ?? [];
  const filtered: QueryData = {
    featured: {
      results: filterVisibleItems(featuredItems, userGroupEmails),
    },
    nonFeatured: {
      results: filterVisibleItems(nonFeaturedItems, userGroupEmails),
    },
  };

  log('INFO', COMPONENT, 'Filtered market news by visibleBy', {
    featuredTotal: allData.featured?.results?.length ?? 0,
    featuredVisible: filtered.featured.results.length,
    nonFeaturedTotal: allData.nonFeatured?.results?.length ?? 0,
    nonFeaturedVisible: filtered.nonFeatured.results.length,
    userGroupCount: userGroupEmails.size,
  });

  return res.status(200).json(filtered);
}
