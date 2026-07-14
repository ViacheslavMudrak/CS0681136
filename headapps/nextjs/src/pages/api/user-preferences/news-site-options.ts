import { getNewsSiteOptions } from 'lib/news-preferences/news-site-options-service';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { log } from 'src/util/helpers/log-helper';

import { authOptions } from '../auth/[...nextauth]';

const COMPONENT = 'api:user-preferences/news-site-options';

/**
 * GET /api/user-preferences/news-site-options
 * Returns the news Home Site and Supplemental site options the authenticated
 * user is allowed to see. Visibility is filtered server-side so gated site
 * metadata never reaches the browser.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized - Please sign in' });
  }

  try {
    const options = await getNewsSiteOptions(session.googleGroups);
    return res.status(200).json(options);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('ERROR', COMPONENT, 'Failed to fetch news site options', { error: message });
    return res.status(500).json({ error: message });
  }
}
