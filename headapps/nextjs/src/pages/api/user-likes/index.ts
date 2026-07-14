import { userLikesService } from 'lib/firebase/server';
import { getErrorMessage } from 'lib/firebase/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (!['GET', 'POST', 'DELETE'].includes(method ?? '')) {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).json({ error: `Method ${method} not allowed` });
  }

  // GET is unauthenticated — like counts are not user-sensitive.
  // POST and DELETE require a valid session.
  let userId: string | undefined;
  if (method !== 'GET') {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized - Please sign in' });
    if (!session.user.id) return res.status(400).json({ error: 'User ID not found in session' });
    userId = session.user.id as string;
  }

  try {
    switch (method) {
      case 'GET': {
        const { pageId } = req.query;
        if (!pageId) {
          return res.status(400).json({ error: 'page url required.' });
        }
        const userEmails = await userLikesService.getUserLikes(pageId as string);
        return res.status(200).json({ userEmails });
      }
      case 'POST': {
        const { pageId } = req.body;
        if (!pageId) {
          return res.status(400).json({ error: 'page url required.' });
        }
        await userLikesService.saveUserLikes(userId!, pageId);
        return res.status(200).json({ success: true });
      }
      case 'DELETE': {
        const { pageId } = req.body;
        if (!pageId) {
          return res.status(400).json({ error: 'page url required.' });
        }
        await userLikesService.deleteUserLike(userId!, pageId);
        return res.status(200).json({ success: true });
      }
    }
  } catch (error) {
    const message = getErrorMessage(error);
    // Include error details in development for debugging
    const errorDetails =
      process.env.NODE_ENV === 'development'
        ? {
            message,
            stack: error instanceof Error ? error.stack : undefined,
            error: error instanceof Error ? error.toString() : String(error),
          }
        : { message };
    return res.status(500).json({ error: errorDetails });
  }
}
