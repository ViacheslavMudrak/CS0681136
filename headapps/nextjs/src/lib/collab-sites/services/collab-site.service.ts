import { admin } from '@googleapis/admin';

import { getServiceAccountClient } from 'lib/auth/google-client';
import { getRedisClient } from 'lib/cache/redis';
import { clientFactory } from 'lib/sitecore-client';
import { log } from 'src/util/helpers/log-helper';
import { CollabSiteSearch_GQL } from '../collab-site.graphql';
import type {
  CollabSiteCard,
  CollabSitePageResult,
  CollabSiteSearchQueryData,
  CollabSitesListResponse,
  ExploreCollabSiteCard,
  LeaveGroupResponse,
} from '../collab-site.types';

const COMPONENT = 'lib:collab-sites:service';
const DIRECTORY_GROUP_MEMBER_SCOPE = 'https://www.googleapis.com/auth/admin.directory.group.member';

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

export function normalizeCollabSite(result: CollabSitePageResult): CollabSiteCard {
  // Collect all group emails from the visibleBy multilist target items.
  // The community-to-group association is resolved exclusively via this field
  // per MVP spec (the separate communityGoogleGroupEmail field was removed).
  const emails = new Set<string>();

  for (const target of result.visibleBy?.targetItems ?? []) {
    const email = target.email?.value;
    if (typeof email === 'string' && email.includes('@')) {
      emails.add(email.toLowerCase().trim());
    }
  }

  const joinRequestEmails = (result.joinRequestEmails?.value ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return {
    id: result.url.path,
    url: result.url.path,
    name: result.collabSiteName?.value ?? '',
    description: result.collabSiteDescription?.value ?? '',
    thumbnailImage: result.collabSpaceThumbnail?.jsonValue ?? null,
    groupEmails: [...emails],
    isHidden: result.isHiddenCollabSite?.value === '1',
    creationDate: result.collabSpaceCreationDate?.value ?? '',
    joinRequestEmails,
  };
}

/**
 * Fetches and normalizes all collab site pages under the given Sitecore item,
 * paginating through the full result set. The `siteRootId` scopes the search
 * via `_path CONTAINS` — only items whose ancestor chain includes this id are
 * returned, so callers should pass the GUID of the listing page that should
 * own the results (e.g. the route's `itemId`).
 */
export async function fetchAllCollabSites(siteRootId: string): Promise<CollabSiteCard[]> {
  const allResults: CollabSitePageResult[] = [];
  let after: string | undefined;
  let hasNext = true;

  const query = CollabSiteSearch_GQL.replaceAll('__ANCESTOR_ID__', siteRootId);

  while (hasNext) {
    const queryData = await clientFactory().request<CollabSiteSearchQueryData>(query, {
      first: 50,
      ...(after && { after }),
    });

    const page = queryData.collabSites;
    allResults.push(...(page?.results ?? []));
    hasNext = page?.pageInfo?.hasNext ?? false;
    after = page?.pageInfo?.endCursor;
  }

  // Filter out system items (Standard Values, Page Branches)
  const contentResults = allResults.filter((r) => {
    const path = r.url?.path ?? '';
    return !path.includes('__Standard-Values') && !path.includes('Page-Branches');
  });

  log('INFO', COMPONENT, 'Fetched collab site data', {
    siteRootId,
    collabSiteCount: contentResults.length,
  });

  return contentResults.map(normalizeCollabSite);
}

/**
 * Splits a flat list of collab sites into the authenticated user's joined
 * sites and the sites available to explore.
 *
 * Explore sites are given a default `joinRequestStatus: 'none'`; callers
 * should enrich this with Firestore data when available.
 */
export function splitCollabSitesByMembership(
  allSites: CollabSiteCard[],
  userGroupEmails: Set<string>
): CollabSitesListResponse {
  const myCollabSites: CollabSiteCard[] = [];
  const exploreCollabSites: ExploreCollabSiteCard[] = [];

  for (const site of allSites) {
    const isMember = site.groupEmails.some((email) => userGroupEmails.has(email));

    if (isMember) {
      myCollabSites.push(site);
    } else if (!site.isHidden) {
      // Hidden collab sites only appear in My Collab Sites, never in Explore
      exploreCollabSites.push({ ...site, joinRequestStatus: 'none' });
    }
  }

  return { myCollabSites, exploreCollabSites };
}

/**
 * Removes the authenticated user from the Google Groups associated with a
 * collab site via the Google Admin Directory API.
 */
export async function leaveCollabSite(
  userEmail: string,
  groupEmails: string[]
): Promise<LeaveGroupResponse> {
  const emailKey = userEmail.toLowerCase().trim();
  return leaveViaGoogleApi(userEmail, emailKey, groupEmails);
}

async function leaveViaGoogleApi(
  userEmail: string,
  emailKey: string,
  groupEmails: string[]
): Promise<LeaveGroupResponse> {
  const jwtClient = getServiceAccountClient({ scopes: [DIRECTORY_GROUP_MEMBER_SCOPE] });
  const directoryClient = admin({ version: 'directory_v1', auth: jwtClient });

  const removedFrom: string[] = [];
  const errors: string[] = [];
  let isOwner = false;

  for (const groupEmail of groupEmails) {
    try {
      await directoryClient.members.delete({
        groupKey: groupEmail.toLowerCase().trim(),
        memberKey: userEmail,
      });
      removedFrom.push(groupEmail);
      log('INFO', COMPONENT, 'Removed from group', { userEmail, groupEmail });
    } catch (error: unknown) {
      const apiError = error as { code?: number; message?: string };

      if (apiError.code === 404) {
        log('INFO', COMPONENT, 'User not a member, skipping', { userEmail, groupEmail });
        removedFrom.push(groupEmail);
      } else if (apiError.code === 403 && /owner/i.test(apiError.message ?? '')) {
        isOwner = true;
        log('WARNING', COMPONENT, 'Owner cannot leave group', {
          userEmail,
          groupEmail,
          error: apiError.message,
        });
        errors.push(`Cannot leave ${groupEmail}: you are the owner`);
      } else {
        log('ERROR', COMPONENT, 'Failed to remove from group', {
          userEmail,
          groupEmail,
          error: apiError.message,
          code: apiError.code,
        });
        errors.push(`Failed to leave ${groupEmail}`);
      }
    }
  }

  // Invalidate list cache and proactively update the groups cache so the next
  // list request doesn't re-fetch stale membership from Google (propagation delay).
  if (removedFrom.length > 0) {
    const removedSet = new Set(removedFrom.map((e) => e.toLowerCase().trim()));
    try {
      const redis = await getRedisClient();
      // Keys are scoped by listing-page parent id, so wildcard-match all
      // variants for this user across any listing page that cached results.
      await deleteKeysByPattern(redis, `collab-sites:list:${emailKey}:*`);

      const groupsCacheKey = `google:groups:${emailKey}`;
      const cachedGroups = await redis.get(groupsCacheKey);
      if (cachedGroups) {
        const groups = JSON.parse(cachedGroups) as { email: string }[];
        const filtered = groups.filter((g) => !removedSet.has(g.email.toLowerCase().trim()));
        await redis.set(groupsCacheKey, JSON.stringify(filtered), 'EX', 15 * 60);
      }
    } catch {
      // Redis failure is non-fatal
    }
  }

  if (isOwner) {
    return { success: false, isOwner: true, error: errors.join('; ') };
  }

  if (errors.length > 0 && removedFrom.length === 0) {
    return { success: false, error: errors.join('; ') };
  }

  return {
    success: true,
    removedFrom,
    ...(errors.length > 0 && { error: errors.join('; ') }),
  };
}
