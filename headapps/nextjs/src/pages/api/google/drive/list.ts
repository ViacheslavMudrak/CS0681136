import { getGoogleClient } from 'lib/auth/google-client';
import { pageSize } from 'lib/google/constants';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { log } from 'src/util/helpers/log-helper';
import type { GoogleErrorResponse } from 'ts/google';

import { drive, type drive_v3 } from '@googleapis/drive';

import { authOptions } from '../../auth/[...nextauth]';

interface SuccessResponse {
  success: boolean;
  files: drive_v3.Schema$File[];
  count: number;
  nextPageToken?: string | null;
  driveName?: string | null;
}

/**
 * GET /api/google/drive/list
 * Lists the first 20 files from Google Drive
 *
 * Query Parameters:
 * - driveId (optional): ID of a shared drive to search. When provided,
 *   the API will search within that specific shared drive.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | GoogleErrorResponse>
) {
  try {
    // Validate user session
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.googleAccessToken) {
      return res.status(401).json({
        error: 'Unauthorized - No valid session',
        requiresReauth: true,
      });
    }

    // Session cannot self-recover — signal client to trigger consent retry
    if (session.error === 'RefreshAccessTokenError') {
      return res.status(401).json({
        error: 'Session expired. Please sign in again.',
        requiresReauth: true,
      });
    }

    // Extract query parameters
    const driveId = req.query.driveId as string | undefined;
    const parentId = req.query.parentId as string | undefined;

    // Initialize Google OAuth2 client with user's tokens
    const oauth2Client = getGoogleClient(session.googleAccessToken, session.refreshToken);

    // Initialize Google Drive API
    const driveClient = drive({ version: 'v3', auth: oauth2Client });

    // Extract pagination token if provided (to fetch next page)
    const pageToken = req.query.pageToken as string | undefined;

    let currentResourceName: string | null = null;
    // 1. Fetch the Name/Title of the Drive or Folder
    try {
      if (driveId && !parentId) {
        // If we are at the root of a Shared Drive, get the Drive's name
        const driveMeta = await driveClient.drives.get({
          driveId: driveId,
          fields: 'name',
        });
        currentResourceName = driveMeta.data.name || null;
      }
    } catch (e) {
      const metaError = e as { code?: number; message?: string };
      log('WARNING', 'google-drive-list', 'Drive metadata fetch failed', {
        action: 'drives.get',
        code: metaError.code,
        message: metaError.message,
        driveId,
      });
      // Fallback so the main file list still loads even if name fetch fails
    }

    // Build list parameters
    const listParams: drive_v3.Params$Resource$Files$List = {
      pageSize: pageSize,
      fields:
        'nextPageToken, files(id, name, mimeType, parents, createdTime, modifiedTime, size, webViewLink, webContentLink, exportLinks, fullFileExtension)',
      orderBy: 'modifiedTime desc',
      // Required for shared drive support
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    };

    // When driveId is provided, search within that specific shared drive
    if (driveId) {
      listParams.driveId = driveId;
      listParams.corpora = 'drive'; // Required when driveId is specified
      const targetParent = parentId || driveId;
      listParams.q = `'${targetParent}' in parents and trashed = false`;
    }

    // If a parentId is provided, restrict results to files whose parent is parentId
    // This lets the client list folder contents.
    if (parentId) {
      // Only non-trashed items
      listParams.q = `\'${parentId}\' in parents and trashed = false`;
    }

    // If a page token was supplied, include it to fetch the next page
    if (pageToken) {
      listParams.pageToken = pageToken;
    }

    // List files - first 20, ordered by most recent
    const response = await driveClient.files.list(listParams);

    return res.status(200).json({
      success: true,
      files: response.data.files || [],
      count: response.data.files?.length || 0,
      nextPageToken: response.data.nextPageToken,
      driveName: currentResourceName,
    });
  } catch (error: unknown) {
    const apiError = error as { code?: number; message?: string };

    // Expected, user-scoped failures (denied access / not found / expired token)
    // are logged at WARNING so they don't trip ERROR alerts. Anything else is a
    // genuine server-side error and stays at ERROR.
    const isExpectedUserError =
      apiError.code === 401 || apiError.code === 403 || apiError.code === 404;

    log(
      isExpectedUserError ? 'WARNING' : 'ERROR',
      'google-drive-list',
      'Failed to list Drive files',
      {
        action: 'files.list',
        code: apiError.code,
        message: apiError.message,
        driveId: req.query.driveId,
        parentId: req.query.parentId,
      }
    );

    // Handle specific Google API errors
    if (apiError.code === 403) {
      return res.status(403).json({
        error: `Access denied. Insufficient permissions to retrieve drive files. ${apiError.message || ''}`,
      });
    }

    if (apiError.code === 401) {
      return res.status(401).json({
        error: 'Authentication failed. Please sign in again.',
        requiresReauth: true,
      });
    }

    res.status(500).json({
      error: apiError.message || 'Failed to retrieve drive files',
    });
  }
}
