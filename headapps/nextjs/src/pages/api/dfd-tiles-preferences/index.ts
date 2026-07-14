import { getErrorMessage } from 'lib/firebase/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { userDfdTilesService } from 'lib/firebase/server';

type TilePreference = {
  id?: string;
  isVisible: boolean;
  order: number;
};

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
        const { pageId } = req.query;

        if (!pageId || typeof pageId !== 'string') {
          return res.status(400).json({ error: 'pageId query parameter is required' });
        }

        const preferences = await userDfdTilesService.getTilePreferences(userId as string, pageId);
        return res.status(200).json({ tilePreferences: preferences });
      }

      case 'POST': {
        const { pageId, tilePreferences } = req.body;

        if (!pageId || typeof pageId !== 'string') {
          return res.status(400).json({ error: 'pageId is required' });
        }

        if (!Array.isArray(tilePreferences)) {
          return res.status(400).json({ error: 'tilePreferences must be an array' });
        }

        const isValid = tilePreferences.every(
          (pref): pref is TilePreference =>
            typeof pref === 'object' &&
            pref !== null &&
            typeof pref.id === 'string' &&
            typeof pref.isVisible === 'boolean' &&
            typeof pref.order === 'number'
        );

        if (!isValid) {
          return res.status(400).json({
            error:
              'Each tile preference must have { id: string, isVisible: boolean, order: number }',
          });
        }

        await userDfdTilesService.saveTilePreferences(userId as string, pageId, tilePreferences);
        return res.status(200).json({ success: true });
      }

      case 'DELETE': {
        const { pageId } = req.query;

        if (!pageId || typeof pageId !== 'string') {
          return res.status(400).json({ error: 'pageId query parameter is required' });
        }

        await userDfdTilesService.deleteTilePreferences(userId as string, pageId);
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    const message = getErrorMessage(error);
    const errorDetails =
      process.env.NODE_ENV === 'development'
        ? {
            message,
            stack: error instanceof Error ? error.stack : undefined,
            error: error instanceof Error ? error.toString() : String(error),
          }
        : { message };
    return res.status(500).json({ error: errorDetails });
  }
}
