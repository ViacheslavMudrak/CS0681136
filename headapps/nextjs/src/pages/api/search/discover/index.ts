import type { NextApiRequest, NextApiResponse } from 'next';
import { post } from 'lib/sitecore-search/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    if (!body?.widget?.items?.length) {
      return res.status(400).json({ error: 'Body must include widget.items' });
    }
    const result = await post(body);
    return res.status(200).json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('config missing')) return res.status(503).json({ error: msg });
    return res.status(500).json({ error: msg });
  }
}
