import { NextApiRequest, NextApiResponse } from 'next';
import { admin } from '@googleapis/admin';
import { getServiceAccountClient } from 'lib/auth/google-client';

// ============================================================================
// Constants
// ============================================================================

const DIRECTORY_USER_READONLY_SCOPE =
  'https://www.googleapis.com/auth/admin.directory.user.readonly';

const CUSTOM_SCHEMA_NAME = 'User_Info';
const CUSTOM_SCHEMA_FIELD = 'Company_Code';

/** Only fetch the custom schema data — no need for names, phones, etc. */
const COMPANY_CODE_FIELDS = ['users(primaryEmail,customSchemas)', 'nextPageToken'].join(',');

// ============================================================================
// Cache (1 hour — company codes rarely change)
// ============================================================================

let cachedCodes: string[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// ============================================================================
// API Handler
// ============================================================================

/**
 * GET /api/google/admin/directory/company-codes
 *
 * Returns all unique company codes from Google Workspace custom schema (User_Info.Company_Code).
 * Results are cached server-side for 1 hour.
 *
 * Response:
 * - companyCodes: string[] — sorted unique company codes
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return cached if fresh
    if (cachedCodes && Date.now() - cacheTimestamp < CACHE_DURATION) {
      return res.status(200).json({ companyCodes: cachedCodes });
    }

    const jwtClient = getServiceAccountClient({
      scopes: [DIRECTORY_USER_READONLY_SCOPE],
    });

    const directoryClient = admin({
      version: 'directory_v1',
      auth: jwtClient,
    });

    const codesSet = new Set<string>();
    let pageToken: string | undefined;

    do {
      const response = await directoryClient.users.list({
        customer: 'my_customer',
        projection: 'custom',
        customFieldMask: CUSTOM_SCHEMA_NAME,
        maxResults: 500,
        pageToken,
        fields: COMPANY_CODE_FIELDS,
      });

      if (response.data.users) {
        for (const user of response.data.users) {
          const companyCode = (
            user.customSchemas?.[CUSTOM_SCHEMA_NAME] as Record<string, unknown> | undefined
          )?.[CUSTOM_SCHEMA_FIELD];
          if (companyCode && typeof companyCode === 'string') {
            codesSet.add(companyCode);
          }
        }
      }

      pageToken = response.data.nextPageToken || undefined;
    } while (pageToken);

    const companyCodes = [...codesSet].sort();

    // Cache the result
    cachedCodes = companyCodes;
    cacheTimestamp = Date.now();

    return res.status(200).json({ companyCodes });
  } catch (error: unknown) {
    console.error('Error fetching company codes:', error);
    const apiError = error as { code?: number; message?: string };

    return res.status(apiError.code || 500).json({
      error: apiError.message || 'Failed to fetch company codes',
    });
  }
}
