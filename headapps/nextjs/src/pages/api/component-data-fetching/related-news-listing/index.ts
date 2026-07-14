import { RelatedNewsListingSearch_GQL } from 'components/IntranetComponents/RelatedNewsListing/RelatedNewsListingSearch.graphql';
import type { QueryData } from 'components/IntranetComponents/RelatedNewsListing/RelatedNewsListing.types';
import { buildUserGroupSet, filterVisibleItems } from 'lib/auth/visibility-filter';
import { getRedisClient } from 'lib/cache/redis';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import scConfig from 'sitecore.config';
import { TEMPLATE_ID_CONSTANTS } from 'src/constants/template-ids';
import { buildMultiFieldOrPredicateString } from 'src/util/graphql/helpers/buildMultiFieldOrPredicateString';
import { applyEmbargoCutoff } from 'src/util/helpers/embargo-helper';
import { log } from 'src/util/helpers/log-helper';

import { createGraphQLClientFactory } from '@sitecore-content-sdk/nextjs/client';

import { authOptions } from '../../auth/[...nextauth]';

const COMPONENT = 'api:related-news-listing';
const CACHE_TTL_SECONDS = 15 * 60;

/**
 * Returns news articles matching the supplied tag ids that the current user
 * is allowed to see. Filters by visibleBy server-side so unauthorized
 * articles never reach the browser.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  const { homePageId, language = 'en', tagIds } = req.query;
  const siteHomeItemId = Array.isArray(homePageId) ? homePageId[0] : (homePageId as string);
  const siteLanguage = Array.isArray(language) ? language[0] : (language as string);
  const rawTagIds = Array.isArray(tagIds) ? tagIds[0] : (tagIds as string);

  if (!siteHomeItemId) {
    return res.status(400).json({ error: 'homePageId is required' });
  }

  const parsedTagIds = (rawTagIds ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  if (parsedTagIds.length === 0) {
    return res.status(200).json({ search: { results: [] } });
  }

  /**
   * Cache key includes the sorted tag set so different tag combinations get
   * isolated entries; visibleBy filtering is applied per-request below.
   */
  const sortedTagIds = [...parsedTagIds].sort().join(',');
  const cacheKey = `related-news-listing:${siteHomeItemId}:${siteLanguage}:${sortedTagIds}`;

  let allResults: QueryData['search']['results'] | null = null;
  try {
    const redis = await getRedisClient();
    const cached = await redis.get(cacheKey);
    if (cached) {
      allResults = (JSON.parse(cached) as { results: QueryData['search']['results'] }).results;
    }
  } catch (cacheError) {
    log('WARNING', COMPONENT, 'Cache read failed', { error: String(cacheError) });
  }

  if (allResults === null) {
    try {
      const tagPredicate = buildMultiFieldOrPredicateString(parsedTagIds, [
        'topicTags',
        'areaTags',
      ]);

      const graphQLClient = createGraphQLClientFactory({ api: scConfig.api })();

      let query = RelatedNewsListingSearch_GQL;
      query = query.replace('__TAG_PREDICATES__', tagPredicate);
      query = query.replace('__ANCESTOR_ID__', siteHomeItemId);
      query = query.replace('__TEMPLATE_ID__', TEMPLATE_ID_CONSTANTS.NEWS_DETAIL_PAGE);
      query = query.replace('__LANGUAGE__', siteLanguage);
      query = applyEmbargoCutoff(query);

      const response = await graphQLClient.request<QueryData>(query);
      allResults = response.search?.results ?? [];

      try {
        const redis = await getRedisClient();
        await redis.set(cacheKey, JSON.stringify({ results: allResults }), 'EX', CACHE_TTL_SECONDS);
      } catch (cacheError) {
        log('WARNING', COMPONENT, 'Cache write failed', { error: String(cacheError) });
      }
    } catch (error) {
      log('ERROR', COMPONENT, 'Failed to fetch related news', { error: String(error) });
      return res.status(500).json({ error: 'Failed to fetch related news' });
    }
  }

  const userGroupEmails = buildUserGroupSet(session?.googleGroups);
  const results = filterVisibleItems(allResults, userGroupEmails);

  log('INFO', COMPONENT, 'Filtered related news by visibleBy', {
    total: allResults.length,
    visible: results.length,
    userGroupCount: userGroupEmails.size,
  });

  return res.status(200).json({ search: { results } });
}
