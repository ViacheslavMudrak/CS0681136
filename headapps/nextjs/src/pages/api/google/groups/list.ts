import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { admin, type admin_directory_v1 } from '@googleapis/admin';
import { getGoogleClient } from 'lib/auth/google-client';
import { fetchGroupsForUser } from 'lib/google/services/google-groups-service';
import type { GroupsProvider } from 'lib/google/services/google-groups-service';
import { log } from 'src/util/helpers/log-helper';

const COMPONENT = 'api:google:groups:list';

// ============================================================================
// Types
// ============================================================================

/** Request body for the get-groups API */
interface GetGroupsRequestBody {
  /** User's Google OAuth access token (optional if using session) */
  googleToken?: string;
  /** User's email address to fetch groups for */
  email: string;
  /** Whether to use service account with DWD instead of user token */
  useServiceAccount?: boolean;
  /**
   * Which API to use for the service-account path. Defaults to the
   * GOOGLE_GROUPS_PROVIDER env var ('cloud' if unset).
   *   cloud — Cloud Identity searchTransitiveGroups (direct + inherited memberships)
   *   admin — Admin Directory groups.list (direct memberships only, for comparison)
   * Ignored when useServiceAccount is false.
   */
  provider?: GroupsProvider;
  /** Whether to bypass the Redis cache and fetch fresh data */
  forceRefresh?: boolean;
}

/** Individual group data returned by the API */
interface GroupInfo {
  id: string;
  email: string;
  displayName: string;
  description?: string;
  type: 'MEMBER';
}

/** Successful response from the get-groups API */
interface GetGroupsSuccessResponse {
  groups: GroupInfo[];
  source: 'user_token' | 'service_account';
}

/** Error response from the get-groups API */
interface GetGroupsErrorResponse {
  error: string;
  details?: string;
  /**
   * When true, the client should redirect to /auth/signin?error=Callback to
   * trigger the consent retry flow. Only set on failures from the user-token
   * path — service-account failures aren't fixable by user re-consent.
   */
  requiresReauth?: boolean;
}

type GetGroupsResponse = GetGroupsSuccessResponse | GetGroupsErrorResponse;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Maps Google Directory API group response to our GroupInfo type
 */
function mapGroupToGroupInfo(group: admin_directory_v1.Schema$Group): GroupInfo {
  return {
    id: group.id || '',
    email: group.email || '',
    displayName: group.name || '',
    description: group.description || undefined,
    type: 'MEMBER',
  };
}

/**
 * Fetches groups using user's OAuth token
 */
async function fetchGroupsWithUserToken(
  googleToken: string,
  userEmail: string
): Promise<GroupInfo[]> {
  const oauth2Client = getGoogleClient(googleToken);

  const directoryClient = admin({
    version: 'directory_v1',
    auth: oauth2Client,
  });

  const response = await directoryClient.groups.list({
    userKey: userEmail,
    maxResults: 200,
  });

  return (response.data.groups || []).map(mapGroupToGroupInfo);
}

/**
 * Fetches all transitive groups for a user via the Cloud Identity API.
 * Delegates to fetchGroupsForUser which uses searchTransitiveGroups.
 */
async function fetchGroupsWithServiceAccount(
  userEmail: string,
  provider?: GroupsProvider,
  forceRefresh = false
): Promise<GroupInfo[]> {
  const groups = await fetchGroupsForUser(userEmail, { provider, forceRefresh });

  return groups.map((group) => ({
    id: group.id,
    email: group.email,
    displayName: group.name,
    description: group.description,
    type: 'MEMBER' as const,
  }));
}

// ============================================================================
// API Handler
// ============================================================================

/**
 * POST /api/google/groups/list
 *
 * Fetches Google Workspace groups for a user.
 *
 * Supports two authentication methods:
 * 1. Service Account with DWD (default) - uses a service account impersonating an admin
 * 2. User OAuth token - uses the user's access token
 *
 * Request Body:
 * - googleToken (optional): User's OAuth access token
 * - email (required): User's email address
 * - useServiceAccount (optional): If true, use service account instead of user token
 * - provider (optional): 'cloud' or 'admin' — selects the service-account API (default: cloud)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetGroupsResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as GetGroupsRequestBody;
  const { email, provider, useServiceAccount = true } = body;
  let { googleToken } = body;

  try {
    // Validate email
    if (!email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    let groups: GroupInfo[];
    let source: 'user_token' | 'service_account';

    // By default, use service account with domain-wide delegation
    if (useServiceAccount) {
      log('INFO', COMPONENT, 'Fetching groups', { source: 'service_account', email });
      groups = await fetchGroupsWithServiceAccount(email, provider, body.forceRefresh);
      source = 'service_account';
    } else {
      // Use user's OAuth token
      if (!googleToken) {
        // Try to get token from session
        const session = await getServerSession(req, res, authOptions);
        googleToken = session?.googleAccessToken;
      }

      if (!googleToken) {
        return res.status(401).json({
          error: 'No Google access token available. Provide googleToken or use useServiceAccount.',
          requiresReauth: true,
        });
      }

      log('INFO', COMPONENT, 'Fetching groups', { source: 'user_token', email });
      groups = await fetchGroupsWithUserToken(googleToken, email);
      source = 'user_token';
    }

    log('INFO', COMPONENT, 'Groups fetched', { count: groups.length, source });
    return res.status(200).json({ groups, source });
  } catch (error: unknown) {
    log('ERROR', COMPONENT, 'Failed to fetch Google groups', {
      error: error instanceof Error ? error.message : String(error),
    });

    const apiError = error as { code?: number; message?: string };

    // Handle specific Google API errors
    if (apiError.code === 403) {
      return res.status(403).json({
        error: `Access denied. Insufficient permissions to access directory data.`,
        details: apiError.message || undefined,
      });
    }

    if (apiError.code === 401) {
      /**
       * Only signal re-consent when the failure came from the user-token path —
       * a 401 from the service-account path indicates a DWD misconfiguration and
       * is not fixable by user re-consent.
       */
      return res.status(401).json({
        error: 'Authentication failed. Please sign in again.',
        ...(useServiceAccount ? {} : { requiresReauth: true }),
      });
    }

    return res.status(500).json({
      error: apiError.message || 'Failed to fetch groups',
      details: String(error),
    });
  }
}
