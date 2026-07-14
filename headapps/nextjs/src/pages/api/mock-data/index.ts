import { mockDataService } from 'lib/firebase/services/mock-data-service';
import { getErrorMessage } from 'lib/firebase/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { VoyagerMockData } from 'ts/voyager-mock-data';

import { authOptions } from '../auth/[...nextauth]';

/**
 * Unified API route for UKG + Oracle mock data overrides
 * GET  /api/mock-data - Retrieve current user's mock data (all fields)
 * POST /api/mock-data - Save mock data for the current user
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized - Please sign in' });
  } else if (!session.user.id) {
    return res.status(400).json({ error: 'User ID not found in session' });
  }

  const userId = session.user.id;

  try {
    switch (req.method) {
      case 'GET': {
        const data = await mockDataService.get(userId);
        return res.status(200).json(data ?? {});
      }

      case 'POST': {
        const body = req.body as VoyagerMockData;

        if (!body || typeof body !== 'object') {
          return res.status(400).json({ error: 'Request body must be a JSON object' });
        }

        await mockDataService.save(userId, body);
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    const message = getErrorMessage(error);
    return res.status(500).json({ error: message });
  }
}
