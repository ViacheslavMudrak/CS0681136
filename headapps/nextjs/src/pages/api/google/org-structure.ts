import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import type { GoogleErrorResponse, OrgTreeResponse } from 'ts/google';
import { googleProfileService } from 'lib/google/server';
import { getRedisClient } from 'lib/cache/redis';

const CACHE_TTL_SECONDS = 15 * 60; // 15 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OrgTreeResponse | GoogleErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const sessionEmail = session?.user?.email;

    if (!sessionEmail) {
      return res.status(401).json({ error: 'No authenticated user session available.' });
    }

    // Allow querying a specific root email, default to session user
    const rootEmail = (req.query.email as string) || sessionEmail;
    const mode = (req.query.mode as string) || 'root';

    // Check Redis cache
    const cacheKey = `google:org-tree:${mode}:${rootEmail.toLowerCase()}`;
    const redis = await getRedisClient();

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
    } catch {
      // Redis failure degrades to cache miss
    }

    // Build the tree
    let tree: OrgTreeResponse['tree'];
    if (mode === 'full-tree') {
      tree = await googleProfileService.buildFullOrgTreeUpward(rootEmail);
    } else {
      tree = await googleProfileService.buildOrgTree(rootEmail);
    }
    const totalNodes = googleProfileService.countNodes(tree);
    const responseData: OrgTreeResponse = {
      tree,
      totalNodes,
      ...(mode === 'full-tree' ? { highlightEmail: rootEmail.toLowerCase() } : {}),
    };

    // Cache in Redis
    try {
      await redis.set(cacheKey, JSON.stringify(responseData), 'EX', CACHE_TTL_SECONDS);
    } catch {
      // Redis failure is non-fatal
    }

    return res.status(200).json(responseData);
  } catch (error: unknown) {
    console.error('Error building org tree:', error);

    const apiError = error as { code?: number; message?: string };

    if (apiError.code === 403) {
      return res.status(403).json({
        error: `Access denied. ${apiError.message || ''}`,
      });
    }

    if (apiError.code === 401) {
      return res.status(401).json({
        error: 'Authentication failed. Please sign in again.',
      });
    }

    return res.status(500).json({
      error: apiError.message || 'Failed to build org structure',
    });
  }
}
