import { getRedisClient } from 'lib/cache/redis';
import { userPreferencesService } from 'lib/firebase/server';
import { getErrorMessage } from 'lib/firebase/types';
import { loadAscensionSiteById } from 'lib/home-site';
import { setCachedUserHomeSite } from 'lib/home-site/internal/home-site-cache';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { log } from 'src/util/helpers/log-helper';

import { authOptions } from '../auth/[...nextauth]';

const COMPONENT = 'api:user-settings';
const CACHE_TTL_SECONDS = 60 * 60; // 1 hour

/**
 * API route for user settings - homepage site
 * GET /api/user-settings - Get current user's preferred home site
 * POST /api/user-settings - Save current user's preferred home site
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
    const cacheKey = `user-settings:${userId}`;

    switch (req.method) {
      case 'GET': {
        try {
          const redis = await getRedisClient();
          const cached = await redis.get(cacheKey);

          if (cached) {
            log('INFO', COMPONENT, 'Cache hit', { userId }, true);
            return res.status(200).json(JSON.parse(cached));
          }
        } catch (cacheError) {
          // Log cache error but continue without cache
          log('WARNING', COMPONENT, 'Cache read failed, proceeding without cache', {
            error: cacheError instanceof Error ? cacheError.message : String(cacheError),
          });
        }

        log('INFO', COMPONENT, 'Cache miss, fetching user settings', { userId }, true);

        const preferredNewsHomeSiteId =
          await userPreferencesService.getPreferredNewsHomeSite(userId);
        const responseData = {
          preferredNewsHomeSite: preferredNewsHomeSiteId
            ? {
                id: preferredNewsHomeSiteId,
              }
            : null,
        };

        // Cache the response
        try {
          const redis = await getRedisClient();
          await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(responseData));
          log('INFO', COMPONENT, 'Cached user settings', { userId });
        } catch (cacheError) {
          // Log cache write error but still return the response
          log('WARNING', COMPONENT, 'Cache write failed', {
            error: cacheError instanceof Error ? cacheError.message : String(cacheError),
          });
        }

        return res.status(200).json(responseData);
      }

      case 'POST': {
        const { preferredNewsHomeSite } = req.body;

        if (preferredNewsHomeSite !== undefined) {
          // Handle both string ID and object with { id, name }
          const siteId =
            typeof preferredNewsHomeSite === 'string'
              ? preferredNewsHomeSite
              : preferredNewsHomeSite.id;

          if (typeof siteId !== 'string') {
            return res.status(400).json({ error: 'preferredNewsHomeSite id must be a string' });
          }
          await userPreferencesService.setPreferredNewsHomeSite(userId, siteId);
          const site = await loadAscensionSiteById(siteId.trim());
          await setCachedUserHomeSite(userId, site);

          // Invalidate cache after saving
          try {
            const redis = await getRedisClient();
            await redis.del(cacheKey);
            log('INFO', COMPONENT, 'Invalidated cache after save', { userId });
          } catch (cacheError) {
            // Log cache invalidation error but still return success
            log('WARNING', COMPONENT, 'Cache invalidation failed', {
              error: cacheError instanceof Error ? cacheError.message : String(cacheError),
            });
          }
        }

        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
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
