import { FeaturedDailyReflectionSearch_GQL } from 'components/IntranetComponents/FeaturedDailyReflection/FeaturedDailyReflectionSearch.graphql';
import type { QueryData } from 'components/IntranetComponents/FeaturedDailyReflection/FeaturedDailyReflection.types';
import { buildUserGroupSet, filterVisibleItems } from 'lib/auth/visibility-filter';
import { getRedisClient } from 'lib/cache/redis';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import scConfig from 'sitecore.config';
import { TEMPLATE_ID_CONSTANTS } from 'src/constants/template-ids';
import { log } from 'src/util/helpers/log-helper';

import { createGraphQLClientFactory } from '@sitecore-content-sdk/nextjs/client';

import { authOptions } from '../../auth/[...nextauth]';

const COMPONENT = 'api:featured-daily-reflection';
const CACHE_TTL_SECONDS = 15 * 60;

/**
 * Returns the most recent reflection (LTE today) the current user is allowed
 * to see. Gates are enforced server-side via filterVisibleItems before the
 * response is sent, so unauthorized reflections never reach the browser.
 *
 * Cache stores the UNFILTERED candidate list keyed by query parameters so
 * the Edge GraphQL roundtrip is shareable across users; the cheap visibleBy
 * filter runs per request below.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  const { homePageId, language = 'en' } = req.query;
  const siteHomeItemId = Array.isArray(homePageId) ? homePageId[0] : (homePageId as string);
  const siteLanguage = Array.isArray(language) ? language[0] : (language as string);

  if (!siteHomeItemId) {
    return res.status(400).json({ error: 'homePageId is required' });
  }

  const today = new Date();
  today.setUTCHours(23, 59, 59, 999);
  const todayFormatted = today.toISOString();

  const cacheKey = `featured-daily-reflection:${siteHomeItemId}:${siteLanguage}:${todayFormatted.slice(0, 10)}`;

  let allReflections: QueryData['reflections']['results'] | null = null;
  try {
    const redis = await getRedisClient();
    const cached = await redis.get(cacheKey);
    if (cached) {
      allReflections = (JSON.parse(cached) as { results: QueryData['reflections']['results'] })
        .results;
    }
  } catch (cacheError) {
    log('WARNING', COMPONENT, 'Cache read failed', { error: String(cacheError) });
  }

  if (allReflections === null) {
    try {
      const graphQLClient = createGraphQLClientFactory({ api: scConfig.api })();

      let query = FeaturedDailyReflectionSearch_GQL;
      query = query.replaceAll('__ANCESTOR_ID__', siteHomeItemId);
      query = query.replaceAll('__TEMPLATE_ID__', TEMPLATE_ID_CONSTANTS.REFLECTION_DETAIL_PAGE);
      query = query.replaceAll('__LANGUAGE__', siteLanguage);
      query = query.replaceAll('__TODAY_DATE__', todayFormatted);

      const response = await graphQLClient.request<QueryData>(query);
      allReflections = response.reflections?.results ?? [];

      try {
        const redis = await getRedisClient();
        await redis.set(
          cacheKey,
          JSON.stringify({ results: allReflections }),
          'EX',
          CACHE_TTL_SECONDS
        );
      } catch (cacheError) {
        log('WARNING', COMPONENT, 'Cache write failed', { error: String(cacheError) });
      }
    } catch (error) {
      log('ERROR', COMPONENT, 'Failed to fetch reflections', { error: String(error) });
      return res.status(500).json({ error: 'Failed to fetch reflections' });
    }
  }

  const userGroupEmails = buildUserGroupSet(session?.googleGroups);
  const reflections = filterVisibleItems(allReflections, userGroupEmails);

  log('INFO', COMPONENT, 'Filtered featured daily reflection by visibleBy', {
    total: allReflections.length,
    visible: reflections.length,
    userGroupCount: userGroupEmails.size,
  });

  return res.status(200).json({ reflections: { results: reflections } });
}
