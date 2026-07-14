import { NextApiRequest, NextApiResponse } from 'next';
import { admin } from '@googleapis/admin';
import { getServiceAccountClient } from 'lib/auth/google-client';

const DIRECTORY_USER_READONLY_SCOPE =
  'https://www.googleapis.com/auth/admin.directory.user.readonly';

/**
 * GET /api/google/admin/directory/users/photo/[userKey]
 *
 * Proxies a Google Workspace user's profile photo via the service account.
 * Returns the photo as an image with proper caching headers.
 * Returns 404 when no photo is available — callers should render a letter avatar fallback.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userKey } = req.query;

    if (!userKey || typeof userKey !== 'string') {
      return res.status(400).json({ error: 'userKey is required' });
    }

    const jwtClient = getServiceAccountClient({
      scopes: [DIRECTORY_USER_READONLY_SCOPE],
    });

    const directoryClient = admin({
      version: 'directory_v1',
      auth: jwtClient,
    });

    const response = await directoryClient.users.photos.get({ userKey });

    if (!response.data.photoData) {
      return res.status(404).json({ error: 'No photo found' });
    }

    // Google returns base64url-encoded photo data
    const photoBuffer = Buffer.from(response.data.photoData, 'base64url');

    res.setHeader('Content-Type', response.data.mimeType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400'); // 24h cache
    return res.status(200).send(photoBuffer);
  } catch (error: unknown) {
    const apiError = error as { code?: number };

    if (apiError.code === 404) {
      return res.status(404).json({ error: 'No photo found' });
    }

    return res.status(500).json({ error: 'Failed to fetch photo' });
  }
}
