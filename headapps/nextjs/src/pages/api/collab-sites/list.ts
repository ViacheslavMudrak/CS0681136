import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

import { getRedisClient } from 'lib/cache/redis';
import { fetchGroupsForUser } from 'lib/google/services/google-groups-service';
import {
  fetchAllCollabSites,
  splitCollabSitesByMembership,
} from 'lib/collab-sites/services/collab-site.service';
import { joinRequestService } from 'lib/firebase/services/collab-join-request-service';
import { log } from 'src/util/helpers/log-helper';
import { authOptions } from '../auth/[...nextauth]';
import type { CollabSitesListResponse } from 'lib/collab-sites/collab-site.types';

const COMPONENT = 'api:collab-sites:list';
/** 5 minutes per TDD; disabled (0) for local development to ease iteration. */
const CACHE_TTL_SECONDS = process.env.NEXT_PUBLIC_ENV === 'LOCAL' ? 0 : 5 * 60;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CollabSitesListResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    /**
     * `parentId` scopes results to descendants of a specific listing page
     * (the route's itemId in the calling component). Required — without it
     * we'd fall back to a site-wide search, which is the bug we're fixing.
     */
    const rawParentId = req.query.parentId;
    const parentId = typeof rawParentId === 'string' ? rawParentId.trim() : '';
    if (!parentId) {
      return res.status(400).json({ error: 'parentId query parameter is required' });
    }

    const cacheKey = `collab-sites:list:${userEmail.toLowerCase().trim()}:${parentId.toLowerCase()}`;

    if (CACHE_TTL_SECONDS > 0) {
      try {
        const redis = await getRedisClient();
        const cached = await redis.get(cacheKey);
        if (cached) {
          return res.status(200).json(JSON.parse(cached));
        }
      } catch {
        // Redis failure degrades to cache miss
      }
    }

    // original
    // const userGroups = await fetchGroupsForUser(userEmail);
    // const userGroupEmails = new Set(userGroups.map((g) => g.email.toLowerCase().trim()));

    // refactor
    const sessionGroups = session.googleGroups;
    const userGroupEmails = new Set(
      (sessionGroups ?? (await fetchGroupsForUser(userEmail)))
        .map((g) => g.email?.toLowerCase().trim())
        .filter((e): e is string => Boolean(e))
    );

    log('INFO', COMPONENT, 'Fetching collab sites for user', {
      userEmail,
      parentId,
      userGroupCount: userGroupEmails.size,
      groupSource: sessionGroups ? 'session' : 'directory-fallback',
    });

    const allSites = await fetchAllCollabSites(parentId);
    let result = splitCollabSitesByMembership(allSites, userGroupEmails);

    /**
     * Transition any lingering `pending` join requests to `approved` for sites
     * the user is now a member of. Approval happens out-of-band (admin adds
     * them to the Google Group), so this is the moment we can detect it and
     * keep the joinRequests collection from accumulating stale pending docs.
     */
    try {
      await joinRequestService.markApproved(
        userEmail,
        result.myCollabSites.map((s) => s.id)
      );
    } catch (error) {
      log('WARNING', COMPONENT, 'Failed to mark join requests approved', {
        error: String(error),
      });
    }

    // Enrich explore collab sites with join request status from Firestore
    try {
      const collabSiteIds = result.exploreCollabSites.map((s) => s.id);
      if (collabSiteIds.length) {
        const statuses = await joinRequestService.getStatusBatch(userEmail, collabSiteIds);
        result = {
          ...result,
          exploreCollabSites: result.exploreCollabSites.map((s) => ({
            ...s,
            joinRequestStatus: statuses[s.id] ?? 'none',
          })),
        };
      }
    } catch (error) {
      log('WARNING', COMPONENT, 'Failed to fetch join request statuses, defaulting to none', {
        error: String(error),
      });
    }

    if (CACHE_TTL_SECONDS > 0) {
      try {
        const redis = await getRedisClient();
        await redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL_SECONDS);
      } catch {
        // Redis failure is non-fatal
      }
    }

    return res.status(200).json(result);
  } catch (error: unknown) {
    log('ERROR', COMPONENT, 'Failed to fetch collab sites', { error: String(error) });
    const message = error instanceof Error ? error.message : 'Failed to fetch collab sites';
    return res.status(500).json({ error: message });
  }
}
