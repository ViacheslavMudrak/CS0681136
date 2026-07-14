import { userFavoritesService } from 'lib/firebase/server';
import { FavoriteFolderInput, getErrorMessage } from 'lib/firebase/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized - Please sign in' });
  } else if (!session.user.id) {
    return res.status(400).json({ error: 'User ID not found in session' });
  }

  const userId = session.user.id;
  const rawId = req.query.id;
  const folderId = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!folderId) {
    return res.status(400).json({ error: 'Folder id is required.' });
  }

  try {
    switch (req.method) {
      case 'PATCH': {
        const body = req.body as Partial<FavoriteFolderInput> | undefined;
        if (!body || typeof body !== 'object') {
          return res.status(400).json({ error: 'Payload is missing required data.' });
        }
        await userFavoritesService.updateFavoriteFolder(userId as string, folderId, body);
        return res.status(200).json({ success: true });
      }
      case 'DELETE': {
        const body = (req.body ?? {}) as { favoriteIds?: string[] };
        const favoriteIds = Array.isArray(body.favoriteIds) ? body.favoriteIds : [];
        await userFavoritesService.deleteFavoriteFolder(userId as string, folderId, favoriteIds);
        return res.status(200).json({ success: true });
      }
      default:
        res.setHeader('Allow', ['PATCH', 'DELETE']);
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
