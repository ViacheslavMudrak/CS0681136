import type { NextApiRequest, NextApiResponse } from 'next';
import { loadAscensionSiteById } from 'lib/home-site';
import { log } from 'src/util/helpers/log-helper';
import type { AscensionSite } from 'lib/home-site/types';

const COMPONENT = 'api:ascension-site-by-id';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AscensionSite | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing site id' });
  }

  try {
    const site = await loadAscensionSiteById(id);
    return res.status(200).json(site);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    log('ERROR', COMPONENT, 'Failed to fetch ascension site by id', { id, error: msg });
    return res.status(500).json({ error: msg });
  }
}
