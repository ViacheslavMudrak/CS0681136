/**
 * DEV-ONLY endpoint — adds the authenticated user back to a Google Group.
 *
 * Usage: GET /api/collab-sites/rejoin-dev?group=ourascension_collabsite_thepitt@ascension-dev.org
 *
 * DO NOT deploy to production.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { admin } from '@googleapis/admin';

import { validateApiKey } from 'lib/auth/api-key-middleware';
import { getServiceAccountClient } from 'lib/auth/google-client';
import { getRedisClient } from 'lib/cache/redis';
import { authOptions } from '../auth/[...nextauth]';

const DIRECTORY_GROUP_SCOPE = 'https://www.googleapis.com/auth/admin.directory.group';

async function deleteKeysByPattern(
  redis: Awaited<ReturnType<typeof getRedisClient>>,
  pattern: string
): Promise<void> {
  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== '0');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!validateApiKey(req, res)) return;

  const session = await getServerSession(req, res, authOptions);
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const groupEmail =
    (req.query.group as string) || 'ourascension_collabsite_thepitt@ascension-dev.org';

  try {
    const jwtClient = getServiceAccountClient({ scopes: [DIRECTORY_GROUP_SCOPE] });
    const directoryClient = admin({ version: 'directory_v1', auth: jwtClient });

    await directoryClient.members.insert({
      groupKey: groupEmail,
      requestBody: {
        email: userEmail,
        role: 'MEMBER',
      },
    });

    // Invalidate caches so next list fetch picks up the change
    try {
      const redis = await getRedisClient();
      const emailKey = userEmail.toLowerCase().trim();
      await deleteKeysByPattern(redis, `collab-sites:list:${emailKey}:*`);
      await redis.del(`google:groups:${emailKey}`);
    } catch {
      // non-fatal
    }

    return res.status(200).json({ success: true, added: userEmail, group: groupEmail });
  } catch (error: unknown) {
    const apiError = error as { code?: number; message?: string };
    if (apiError.code === 409) {
      return res
        .status(200)
        .json({ success: true, message: 'Already a member', group: groupEmail });
    }
    return res.status(500).json({
      success: false,
      error: apiError.message || String(error),
      code: apiError.code,
    });
  }
}
