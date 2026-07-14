import type { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient } from 'lib/cache/redis';
import { getAscensionSites } from 'lib/sitecore-search/server';
import { log } from 'src/util/helpers/log-helper';

const COMPONENT = 'api:ascension-sites';
const CACHE_KEY = 'search:ascension-sites';
const CACHE_TTL_SECONDS = process.env.NEXT_PUBLIC_ENV === 'LOCAL' ? 10 : 60 * 60;

export interface AscensionSiteSlim {
  id: string;
  name: string;
  url: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const redis = await getRedisClient();
    const cached = await redis.get(CACHE_KEY);

    if (cached) {
      log('INFO', COMPONENT, 'Cache hit', undefined, true);
      return res.status(200).json(JSON.parse(cached));
    }

    log('INFO', COMPONENT, 'Cache miss, fetching from Discover API', undefined, true);

    const response = await getAscensionSites();
    const sites = response.widgets?.[0]?.content ?? [];

    const slimSites: AscensionSiteSlim[] = sites.map((site) => ({
      id: site.item_id,
      name: site.name,
      url: site.url,
    }));

    await redis.setex(CACHE_KEY, CACHE_TTL_SECONDS, JSON.stringify(slimSites));
    log('INFO', COMPONENT, `Cached ${slimSites.length} ascension sites`, undefined, true);

    return res.status(200).json(slimSites);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    log('ERROR', COMPONENT, 'Failed to fetch ascension sites', { error: msg });
    if (msg.includes('config missing')) return res.status(503).json({ error: msg });
    return res.status(500).json({ error: msg });
  }
}
