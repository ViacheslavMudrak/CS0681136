import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import type { GoogleErrorResponse, GoogleProfileData } from 'ts/google';
import { googleProfileService } from 'lib/google/server';

interface SuccessResponse {
  profile: GoogleProfileData;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | GoogleErrorResponse>
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        error: 'No authenticated user session available.',
      });
    }

    // Use shared service (with shared cache)
    const profile = await googleProfileService.fetchExtendedProfile(userEmail);

    if (!profile) {
      return res.status(500).json({
        error: 'Failed to fetch profile data',
      });
    }

    res.status(200).json({ profile });
  } catch (error: unknown) {
    console.error('Error fetching Google profile:', error);

    const apiError = error as { code?: number; message?: string };

    // Handle specific Google API errors
    if (apiError.code === 403) {
      return res.status(403).json({
        error: `Access denied. Insufficient permissions to access profile data. ${apiError.message || ''}`,
      });
    }

    if (apiError.code === 401) {
      return res.status(401).json({
        error: 'Authentication failed. Please sign in again.',
      });
    }

    res.status(500).json({
      error: apiError.message || 'Failed to fetch profile data',
    });
  }
}
