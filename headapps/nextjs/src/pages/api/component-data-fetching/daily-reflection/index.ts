import { DailyReflectionSearch_GQL } from 'components/IntranetComponents/DailyReflection/DailyReflectionSearch.graphql';
import type { QueryData } from 'components/IntranetComponents/DailyReflection/DailyReflection.types';
import { buildUserGroupSet, filterVisibleItems } from 'lib/auth/visibility-filter';
import { getRedisClient } from 'lib/cache/redis';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import scConfig from 'sitecore.config';
import { TEMPLATE_ID_CONSTANTS } from 'src/constants/template-ids';
import { log } from 'src/util/helpers/log-helper';

import { createGraphQLClientFactory } from '@sitecore-content-sdk/nextjs/client';

import { authOptions } from '../../auth/[...nextauth]';

const COMPONENT = 'api:daily-reflection';
const CACHE_TTL_SECONDS = 15 * 60;
const CACHE_TTL_JITTER_SECONDS = 60;

type ReflectionResults = QueryData['reflections']['results'];

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
const inFlight = new Map<string, Promise<ReflectionResults>>();

/**
 * Returns the most recent reflection published before tomorrow (used to surface
 * the "latest" daily reflection for the current user). Filters by visibleBy
 * server-side so unauthorized reflections never reach the browser.
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

  const tomorrow = new Date();
  tomorrow.setUTCHours(0, 0, 0, 0);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowStart = tomorrow.toISOString();

  const cacheKey = `daily-reflection:${siteHomeItemId}:${siteLanguage}:${tomorrowStart.slice(0, 10)}`;

  let allReflections: ReflectionResults | null = null;
  try {
    const redis = await getRedisClient();
    const cached = await redis.get(cacheKey);
    if (cached) {
      allReflections = (JSON.parse(cached) as { results: ReflectionResults }).results;
    }
  } catch (cacheError) {
    log('WARNING', COMPONENT, 'Cache read failed', { error: String(cacheError) });
  }

  if (allReflections === null) {
    let fetchPromise = inFlight.get(cacheKey);
    if (!fetchPromise) {
      fetchPromise = (async () => {
        const graphQLClient = createGraphQLClientFactory({ api: scConfig.api })();

        let query = DailyReflectionSearch_GQL;
        query = query.replaceAll('__ANCESTOR_ID__', siteHomeItemId);
        query = query.replaceAll('__TEMPLATE_ID__', TEMPLATE_ID_CONSTANTS.REFLECTION_DETAIL_PAGE);
        query = query.replaceAll('__LANGUAGE__', siteLanguage);
        query = query.replaceAll('__TOMORROW_START__', tomorrowStart);

        const response = await graphQLClient.request<QueryData>(query);
        const fetched: ReflectionResults = response.reflections?.results ?? [];

        try {
          const redis = await getRedisClient();
          await redis.set(cacheKey, JSON.stringify({ results: fetched }), 'EX', cacheTtlSeconds());
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
      allReflections = await fetchPromise;
    } catch (error) {
      log('ERROR', COMPONENT, 'Failed to fetch reflections', { error: String(error) });
      return res.status(500).json({ error: 'Failed to fetch reflections' });
    }
  }

  const userGroupEmails = buildUserGroupSet(session?.googleGroups);
  const reflections = filterVisibleItems(allReflections, userGroupEmails);

  log('INFO', COMPONENT, 'Filtered daily reflection by visibleBy', {
    total: allReflections.length,
    visible: reflections.length,
    userGroupCount: userGroupEmails.size,
  });

  return res.status(200).json({ reflections: { results: reflections } });
}
