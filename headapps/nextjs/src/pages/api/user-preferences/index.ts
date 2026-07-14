import { userPreferencesService } from 'lib/firebase/server';
import { getErrorMessage } from 'lib/firebase/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

import { authOptions } from '../auth/[...nextauth]';

/**
 * API route for user preferences
 * GET /api/user-preferences - Get current user's news feed tags
 * POST /api/user-preferences - Save current user's news feed tags
 * DELETE /api/user-preferences - Delete current user's news feed tags
 *
 * Note: User ID is derived from the authenticated NextAuth session
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get authenticated user from NextAuth session
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized - Please sign in' });
  } else if (!session.user.id) {
    return res.status(400).json({ error: 'User ID not found in session' });
  }

  // Use email as user ID (or customize based on your NextAuth config)
  const userId = session.user.id;

  if (!userId) {
    return res.status(400).json({ error: 'User ID not found in session' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const [newsFeedTags, preferredNewsHomeSite, preferredNewsSupplementalSites] =
          await Promise.all([
            userPreferencesService.getNewsFeedTags(userId),
            userPreferencesService.getPreferredNewsHomeSite(userId),
            userPreferencesService.getPreferredNewsSupplementalSites(userId),
          ]);
        return res
          .status(200)
          .json({ newsFeedTags, preferredNewsHomeSite, preferredNewsSupplementalSites });
      }

      case 'POST': {
        const { newsFeedTags, preferredNewsHomeSite, preferredNewsSupplementalSites } = req.body;

        if (newsFeedTags !== undefined) {
          if (!Array.isArray(newsFeedTags)) {
            return res.status(400).json({ error: 'newsFeedTags must be an array' });
          }
          await userPreferencesService.saveNewsFeedTags(userId, newsFeedTags);
        }

        if (preferredNewsHomeSite !== undefined) {
          if (typeof preferredNewsHomeSite !== 'string') {
            return res.status(400).json({ error: 'preferredNewsHomeSite must be a string' });
          }
          await userPreferencesService.setPreferredNewsHomeSite(userId, preferredNewsHomeSite);
        }

        if (preferredNewsSupplementalSites !== undefined) {
          if (!Array.isArray(preferredNewsSupplementalSites)) {
            return res
              .status(400)
              .json({ error: 'preferredNewsSupplementalSites must be an array' });
          }
          await userPreferencesService.savePreferredNewsSupplementalSites(
            userId,
            preferredNewsSupplementalSites
          );
        }

        return res.status(200).json({ success: true });
      }

      case 'DELETE': {
        await userPreferencesService.deleteNewsFeedTags(userId);
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    const message = getErrorMessage(error);
    // Include error details in development for debugging
    const errorDetails =
      process.env.NODE_ENV === 'development'
        ? {
            message,
            stack: error instanceof Error ? error.stack : undefined,
            error: error instanceof Error ? error.toString() : String(error),
          }
        : {
            message,
            stack: error instanceof Error ? error.stack : undefined,
            error: error instanceof Error ? error.toString() : String(error),
          };
    return res.status(500).json({ error: errorDetails });
  }
}
