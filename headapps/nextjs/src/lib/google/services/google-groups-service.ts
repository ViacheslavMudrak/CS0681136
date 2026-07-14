import { admin } from '@googleapis/admin';
import { google } from 'googleapis';
import { getServiceAccountClient } from 'lib/auth/google-client';
import { getRedisClient } from 'lib/cache/redis';
import { log } from 'src/util/helpers/log-helper';
import type { GoogleGroupData } from 'ts/google';

const CLOUD_IDENTITY_GROUPS_SCOPE =
  'https://www.googleapis.com/auth/cloud-identity.groups.readonly';
const DIRECTORY_GROUP_SCOPE = 'https://www.googleapis.com/auth/admin.directory.group';
const CACHE_TTL_SECONDS = 15 * 60;
const COMPONENT = 'google-groups-service';

const GROUP_LABELS = [
  'cloudidentity.googleapis.com/groups.discussion_forum',
  'cloudidentity.googleapis.com/groups.dynamic',
];

/**
 * Which API to use for group membership lookups.
 * - 'cloud' (default): Cloud Identity searchTransitiveGroups — returns direct AND inherited memberships.
 * - 'admin': Admin Directory groups.list — returns direct memberships only (useful for comparison/testing).
 *
 * Controlled by the GOOGLE_GROUPS_PROVIDER env var; overridable per-call via the `provider` option.
 */
export type GroupsProvider = 'cloud' | 'admin';
const DEFAULT_PROVIDER: GroupsProvider =
  (process.env.GOOGLE_GROUPS_PROVIDER as GroupsProvider) ?? 'cloud';

// ============================================================================
// Internal fetch implementations
// ============================================================================

async function fetchViaCloudIdentity(userEmail: string): Promise<GoogleGroupData[]> {
  const customerId = process.env.GOOGLE_CUSTOMER_ID;
  if (!customerId) {
    throw new Error('GOOGLE_CUSTOMER_ID environment variable is not set');
  }

  const jwtClient = getServiceAccountClient({ scopes: [CLOUD_IDENTITY_GROUPS_SCOPE] });
  const ci = google.cloudidentity({ version: 'v1', auth: jwtClient });

  const seen = new Set<string>();
  const groups: GoogleGroupData[] = [];

  for (const label of GROUP_LABELS) {
    let pageToken: string | undefined;
    try {
      do {
        const response = await ci.groups.memberships.searchTransitiveGroups({
          parent: 'groups/-',
          query: `member_key_id == '${userEmail}' && '${label}' in labels && parent == 'customers/${customerId}'`,
          pageSize: 1000,
          pageToken,
        });

        for (const membership of response.data.memberships ?? []) {
          const email = membership.groupKey?.id?.toLowerCase().trim();
          if (!email || seen.has(email)) continue;
          seen.add(email);
          groups.push({
            id: membership.group?.replace('groups/', '') ?? '',
            email,
            name: membership.displayName ?? '',
          });
        }

        pageToken = response.data.nextPageToken ?? undefined;
      } while (pageToken);
    } catch (err: unknown) {
      const code = (err as { code?: number }).code;
      if (code !== 403) {
        log('WARNING', COMPONENT, 'searchTransitiveGroups failed', {
          label,
          userEmail,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  return groups;
}

async function fetchViaAdminDirectory(userEmail: string): Promise<GoogleGroupData[]> {
  const jwtClient = getServiceAccountClient({ scopes: [DIRECTORY_GROUP_SCOPE] });
  const directoryClient = admin({ version: 'directory_v1', auth: jwtClient });

  const response = await directoryClient.groups.list({
    userKey: userEmail,
    maxResults: 200,
  });

  return (response.data.groups || []).map((group) => ({
    id: group.id || '',
    email: (group.email || '').toLowerCase().trim(),
    name: group.name || '',
    description: group.description || undefined,
  }));
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Fetches Google Workspace groups for a user.
 *
 * Provider selection (in priority order):
 *   1. `provider` option on the call
 *   2. `GOOGLE_GROUPS_PROVIDER` env var
 *   3. Default: `'cloud'`
 *
 * Results are Redis-cached for 15 minutes per provider (keys: `google:groups:cloud:{email}`
 * and `google:groups:admin:{email}`). Pass `forceRefresh: true` to bypass the cache.
 *
 * Requires env vars:
 *   - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (JSON string)
 *   - GOOGLE_IMPERSONATE_ADMIN_EMAIL (a Workspace admin email)
 *   - GOOGLE_CUSTOMER_ID (cloud provider only, e.g. C01a2b3c4)
 */
export async function fetchGroupsForUser(
  userEmail: string,
  {
    forceRefresh = false,
    provider = DEFAULT_PROVIDER,
  }: { forceRefresh?: boolean; provider?: GroupsProvider } = {}
): Promise<GoogleGroupData[]> {
  const normalizedEmail = userEmail.toLowerCase().trim();
  const cacheKey = `google:groups:${provider}:${normalizedEmail}`;

  try {
    const redis = await getRedisClient();
    if (!forceRefresh) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as GoogleGroupData[];
      }
    }
  } catch {
    // Redis failure degrades to a cache miss
  }

  const groups =
    provider === 'admin'
      ? await fetchViaAdminDirectory(userEmail)
      : await fetchViaCloudIdentity(userEmail);

  try {
    const redis = await getRedisClient();
    await redis.set(cacheKey, JSON.stringify(groups), 'EX', CACHE_TTL_SECONDS);
  } catch {
    // Redis failure is non-fatal
  }

  return groups;
}
