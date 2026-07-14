import type { NextApiRequest, NextApiResponse } from 'next';
import { getFacetValues } from 'lib/sitecore-search/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rfkId = req.query.rfkId as string;
  const facetName = req.query.facetName as string;
  const max = req.query.max ? Number(req.query.max) : 5;

  if (!rfkId || !facetName) {
    return res.status(400).json({ error: 'rfkId and facetName query params are required' });
  }

  try {
    const result = await getFacetValues(rfkId, facetName, max);
    return res.status(200).json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('config missing')) return res.status(503).json({ error: msg });
    return res.status(500).json({ error: msg });
  }
}
