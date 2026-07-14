import { NextApiRequest, NextApiResponse } from 'next';
import type { GoogleProfileData } from 'ts/google';
import { googleProfileService } from 'lib/google/services/google-profile-service';

// ============================================================================
// Types
// ============================================================================

/** Successful response from the users API */
interface GetUserSuccessResponse {
  user: GoogleProfileData;
}

/** Error response from the users API */
interface GetUserErrorResponse {
  error: string;
  details?: string;
  code?: number;
}

type GetUserResponse = GetUserSuccessResponse | GetUserErrorResponse;

// ============================================================================
// API Handler
// ============================================================================

/**
 * GET /api/google/admin/directory/users/[userKey]
 *
 * Retrieves a Google Workspace user's data including custom schemas.
 *
 * Path Parameters:
 * - userKey: The user's primary email address, alias email, or unique user ID
 *
 * Query Parameters:
 * - projection (optional): 'basic' | 'custom' | 'full' - defaults to 'custom' to include custom schemas
 * - customFieldMask (optional): Comma-separated schema names - defaults to 'User_Info'
 *
 * Response includes structured userInfo fields mapped from the User_Info custom schema.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<GetUserResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed', code: 405 });
  }

  try {
    // Extract userKey from dynamic route
    const { userKey } = req.query;

    if (!userKey || typeof userKey !== 'string') {
      return res.status(400).json({
        error: 'userKey is required in the URL path',
        code: 400,
      });
    }

    // Optional query parameters
    const projection = (req.query.projection as 'basic' | 'custom' | 'full') || 'custom';
    const customFieldMask = (req.query.customFieldMask as string) || 'User_Info';

    const user = await googleProfileService.fetchExtendedProfile(userKey, {
      projection,
      customFieldMask,
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found or could not be fetched',
        code: 404,
      });
    }

    return res.status(200).json({ user });
  } catch (error: unknown) {
    console.error('Error fetching user from Directory API:', error);

    const apiError = error as { code?: number; message?: string; errors?: unknown[] };

    if (apiError.code === 404) {
      return res.status(404).json({
        error: 'User not found',
        details: apiError.message || undefined,
        code: 404,
      });
    }

    if (apiError.code === 403) {
      return res.status(403).json({
        error: 'Access denied. Insufficient permissions to access user data.',
        details: apiError.message || undefined,
        code: 403,
      });
    }

    if (apiError.code === 401) {
      return res.status(401).json({
        error: 'Authentication failed. Service account credentials may be invalid.',
        code: 401,
      });
    }

    if (apiError.code === 400) {
      return res.status(400).json({
        error: 'Bad request. Invalid userKey or parameters.',
        details: apiError.message || undefined,
        code: 400,
      });
    }

    return res.status(500).json({
      error: apiError.message || 'Failed to fetch user data',
      details: String(error),
      code: 500,
    });
  }
}
