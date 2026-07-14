import type { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient } from 'lib/cache/redis';
import { getGoogleGroupEmailsByIds } from 'src/util/graphql/queries/getGoogleGroupsByIds.graphql';
import { log } from 'src/util/helpers/log-helper';

const CACHE_TTL_SECONDS = 30 * 60;
const COMPONENT = 'get-sitecore-groups-by-ids';

function stripBraces(id: string): string {
  return id.replace(/[{}]/g, '').trim();
}

function buildCacheKey(ids: string[]): string {
  return `gated:group-emails:${ids.slice().sort().join('|')}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  log('INFO', COMPONENT, 'start', { method: req.method });

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = (req.body ?? {}) as { ids?: unknown; renderingName?: unknown };

    const idsRaw = Array.isArray(body.ids) ? (body.ids as string[]) : [];
    const ids = idsRaw
      .map((value) => (typeof value === 'string' ? value : ''))
      .map(stripBraces)
      .filter(Boolean);

    const renderingName = typeof body.renderingName === 'string' ? body.renderingName : undefined;

    log('INFO', COMPONENT, 'request', { ids, renderingName });

    if (ids.length === 0) {
      return res.status(200).json({ emails: [] });
    }

    const cacheKey = buildCacheKey(ids);
    const redis = await getRedisClient();

    // Check Redis cache
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const emails = JSON.parse(cached) as string[];
        log('INFO', COMPONENT, 'cache hit', { cacheKey, count: emails.length, renderingName });
        return res.status(200).json({ emails });
      }
    } catch (cacheErr) {
      // Non-fatal — fall through to live fetch
      log('ERROR', COMPONENT, 'Redis read failed, fetching live', { error: String(cacheErr) });
    }

    const DEFAULT_LANGUAGE = 'en';
    const emails = await getGoogleGroupEmailsByIds(ids, DEFAULT_LANGUAGE);

    log('INFO', COMPONENT, 'resolved', { count: emails.length, renderingName });

    // Write to Redis cache — only cache non-empty results
    if (emails.length > 0) {
      try {
        await redis.set(cacheKey, JSON.stringify(emails), 'EX', CACHE_TTL_SECONDS);
        log('INFO', COMPONENT, 'cached', { cacheKey, ttl: CACHE_TTL_SECONDS });
      } catch (cacheErr) {
        // Non-fatal — response still succeeds
        log('ERROR', COMPONENT, 'Redis write failed', { error: String(cacheErr) });
      }
    }

    return res.status(200).json({ emails });
  } catch (e) {
    log('ERROR', COMPONENT, 'failed', { error: String(e) });
    return res.status(200).json({ emails: [] });
  }
}
