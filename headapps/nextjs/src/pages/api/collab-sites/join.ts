import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

import { getRedisClient } from 'lib/cache/redis';
import { joinRequestService } from 'lib/firebase/services/collab-join-request-service';
import { sendJoinRequestEmail } from 'lib/email/email-service';
import { fetchAllCollabSites } from 'lib/collab-sites/services/collab-site.service';
import { log } from 'src/util/helpers/log-helper';
import { authOptions } from '../auth/[...nextauth]';
import type { RequestToJoinResponse } from 'lib/collab-sites/collab-site.types';

const COMPONENT = 'api:collab-sites:join';

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RequestToJoinResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Only collabSiteId and parentId are trusted from the client; all email
    // config is loaded from Sitecore server-side.
    const { collabSiteId, parentId } = req.body as {
      collabSiteId?: unknown;
      parentId?: unknown;
    };

    if (!collabSiteId || typeof collabSiteId !== 'string') {
      return res.status(400).json({ success: false, error: 'collabSiteId is required' });
    }

    if (!parentId || typeof parentId !== 'string') {
      return res.status(400).json({ success: false, error: 'parentId is required' });
    }

    // Resolve the collab site server-side so recipient list and email templates
    // cannot be tampered with by the caller.
    const allSites = await fetchAllCollabSites(parentId);
    const collabSite = allSites.find((s) => s.id === collabSiteId);

    if (!collabSite) {
      return res.status(404).json({ success: false, error: 'Collab site not found' });
    }

    const { name: collabSiteName, joinRequestEmails } = collabSite;

    if (!joinRequestEmails.length) {
      return res.status(400).json({
        success: false,
        error: 'No join request email recipients configured for this collab site',
      });
    }

    const alreadyPending = await joinRequestService.hasPendingRequest(userEmail, collabSiteId);
    if (alreadyPending) {
      return res.status(409).json({
        success: false,
        error: 'A join request is already pending for this collab site',
      });
    }

    log('INFO', COMPONENT, 'Join request initiated', {
      userEmail,
      collabSiteId,
      collabSiteName,
      recipientCount: joinRequestEmails.length,
    });

    // Templates are fetched from the Sitecore dictionary inside sendJoinRequestEmail.
    await sendJoinRequestEmail({
      senderEmail: userEmail,
      recipientEmails: joinRequestEmails,
      collabSiteName,
      requesterName: session?.user?.name ?? undefined,
    });

    // Persist the pending request in Firestore
    await joinRequestService.createRequest(userEmail, collabSiteId, collabSiteName);

    // Set Redis cache key for fast UI lookup and invalidate the list cache
    try {
      const redis = await getRedisClient();
      const emailKey = userEmail.toLowerCase().trim();
      await redis.set(
        `joinrequest:${emailKey}:${collabSiteId}`,
        'pending',
        'EX',
        60 * 60 * 24 * 30 // 30 days
      );
      // Invalidate all parent-scoped list cache entries for this user
      await deleteKeysByPattern(redis, `collab-sites:list:${emailKey}:*`);
    } catch {
      // Redis failure is non-fatal — Firestore is the source of truth
    }

    log('INFO', COMPONENT, 'Join request completed', { userEmail, collabSiteId });

    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    log('ERROR', COMPONENT, 'Failed to process join request', { error: String(error) });
    const message = error instanceof Error ? error.message : 'Failed to send join request';
    return res.status(500).json({ success: false, error: message });
  }
}
