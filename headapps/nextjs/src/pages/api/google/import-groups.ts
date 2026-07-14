// import { google } from 'googleapis';
import { admin_directory_v1 } from '@googleapis/admin';
import { GoogleAuth } from 'google-auth-library';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { GoogleErrorResponse } from 'ts/google';
import { validateApiKey } from 'src/lib/auth/api-key-middleware';

// --- Configuration ---

// Get the key content from an environment variable for security
// Ensure this variable holds the ENTIRE JSON content as a string
const PRIVATE_KEY_CONTENT = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

// The email address of the Workspace admin user to impersonate
const USER_TO_IMPERSONATE = 'sa-lumapps@ascension.org'; // **CHANGE THIS**

// The scopes required for the Admin SDK Directory API
const SCOPES = [
  // 'https://www.googleapis.com/auth/admin.directory.group.readonly, https://www.googleapis.com/auth/directory.readonly',
  'https://www.googleapis.com/auth/admin.directory.group', // this scope is configured on the user to impersonate
];

/**
 * Authorizes the service account and returns an authenticated API client.
 * @returns {Promise<object>} An authenticated Google API client.
 */
function authorize(): GoogleAuth {
  if (!PRIVATE_KEY_CONTENT) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY environment variable is not set.');
  }

  // Parse the JSON content from the environment variable
  const key = JSON.parse(PRIVATE_KEY_CONTENT);

  // Create a new GoogleAuth object using the service account credentials
  // Use generic GoogleAuth from google-auth-library to avoid type conflicts
  // with firebase-admin's version of google-auth-library
  const authInstance = new GoogleAuth({
    credentials: {
      client_email: key.client_email,
      private_key: key.private_key,
    },
    scopes: SCOPES,
    // The key to impersonation: acting on behalf of a specific admin user
    clientOptions: {
      subject: USER_TO_IMPERSONATE,
    },
  });

  return authInstance;
}

interface ImportGroupsRequestQuery {
  userKey?: string; // email or immutable ID of the user if only those groups are to be listed
  query?: string; // search query for groups (optional)
}
interface SuccessResponse {
  success?: boolean;
  groups?: admin_directory_v1.Schema$Group[];
  message?: string;
  details?: string;
}

/**
 * Next.js API Route Handler
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | GoogleErrorResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Validate API key
  if (!validateApiKey(req, res)) {
    return;
  }

  const { userKey, query } = req.query as ImportGroupsRequestQuery;

  try {
    const authClient = authorize();

    // Create an instance of the Admin SDK Directory service
    // Type assertion needed due to GoogleAuth type incompatibility between
    // google-auth-library versions (firebase-admin vs @googleapis/admin)
    const directoryApi = new admin_directory_v1.Admin({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      auth: authClient as any,
    });

    const groups: admin_directory_v1.Schema$Group[] = [];

    // Use pagination to fetch all groups (nextPageToken)
    let pageToken: string | undefined = undefined;
    let totalFetched: number = 0;

    do {
      const apiResponse = (await directoryApi.groups.list({
        // 'my_customer' refers to the customer (domain) associated with the impersonated user
        customer: 'my_customer',
        maxResults: 200,
        orderBy: 'email',
        // Include optional filters if provided
        userKey: userKey || undefined,
        query: query || undefined,
        pageToken,
      })) as {
        data?: {
          groups?: admin_directory_v1.Schema$Group[];
          nextPageToken?: string;
        };
      };
      let pageGroups = apiResponse.data?.groups ?? [];
      totalFetched += pageGroups.length;
      const currentPage = Math.floor(totalFetched / (apiResponse.data?.groups?.length || 1)) + 1;

      console.log(
        `Fetched ${apiResponse.data?.groups?.length || 0} groups (page ${currentPage}), total fetched: ${totalFetched}`
      );

      pageGroups = pageGroups
        .filter((group) => group.name && group.name.includes('-INT-'))
        .map((group) => ({
          id: group.id || '',
          email: group.email || '',
          name: group.name || '',
          description: group.description || '',
        }));

      groups.push(...pageGroups);
      console.log(`Kept ${pageGroups.length} groups`);

      pageToken = apiResponse.data?.nextPageToken;
    } while (pageToken);

    console.log('Fetched total user groups:', groups.length);

    // Return the list of groups
    res.status(200).json({
      success: true,
      groups: groups,
    });
  } catch (error: unknown) {
    console.error('API Error:', error);

    const apiError = error as { code?: number; message?: string };

    // Check for specific API authorization errors
    if (apiError.code === 403) {
      return res.status(403).json({
        success: false,
        message:
          'Not Authorized to access this resource/API. Check Domain-Wide Delegation and Impersonation User.',
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      details: apiError.message,
    });
  }
}
