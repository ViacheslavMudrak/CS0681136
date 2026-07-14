import { NextApiRequest, NextApiResponse } from 'next';
import { auth, calendar } from '@googleapis/calendar';
import type { calendar_v3 } from '@googleapis/calendar';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]';

interface RequestBody {
  calendarId?: string;
  calendarEmail?: string;
  timeMin: string;
  timeMax: string;
}

interface SuccessResponse {
  events: calendar_v3.Schema$Event[];
}

interface ErrorResponse {
  error: string;
  /**
   * When true, the client should redirect to /auth/signin?error=Callback
   * to trigger the consent retry flow. Set when the user's session cannot
   * be refreshed (e.g. missing refresh token).
   */
  requiresReauth?: boolean;
}

interface CacheItem {
  data: calendar_v3.Schema$Event[];
  timestamp: number;
}

// Simple in-memory cache
const cache = new Map<string, CacheItem>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(calendarIdentifier: string, timeMin: string, timeMax: string): string {
  return `${calendarIdentifier}-${timeMin}-${timeMax}`;
}

function getFromCache(key: string): calendar_v3.Schema$Event[] | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: calendar_v3.Schema$Event[]): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the session to access the Google access token
    const session = await getServerSession(req, res, authOptions);

    if (!session?.googleAccessToken) {
      return res.status(401).json({
        error: 'No Google access token available',
        requiresReauth: true,
      });
    }

    /**
     * The session callback sets `RefreshAccessTokenError` when the stored access
     * token is expired and cannot be refreshed (no refresh_token in Firestore).
     * Short-circuit here instead of wasting a Google API call that will 401.
     */
    if (session.error === 'RefreshAccessTokenError') {
      return res.status(401).json({
        error: 'Session expired and cannot be refreshed. Please sign in again.',
        requiresReauth: true,
      });
    }

    const { calendarId, calendarEmail, timeMin, timeMax } = req.body as RequestBody;

    // Use calendarEmail if provided, otherwise use calendarId (default to 'primary')
    const calendarIdentifier = calendarEmail || calendarId || 'primary';

    if (!timeMin || !timeMax) {
      return res.status(400).json({ error: 'timeMin and timeMax are required' });
    }

    // Check cache first
    const cacheKey = getCacheKey(calendarIdentifier, timeMin, timeMax);
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      return res.status(200).json({ events: cachedData });
    }

    // Create Google Calendar API client
    // const { google } = await import('googleapis');

    const oauth2Client = new auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.googleAccessToken,
      scope:
        'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly',
      token_type: 'Bearer',
    });

    const cal = calendar({ version: 'v3', auth: oauth2Client });

    // Fetch events from Google Calendar
    const response = await cal.events.list({
      calendarId: calendarIdentifier,
      timeMin: timeMin,
      timeMax: timeMax,
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    // Cache the results
    setCache(cacheKey, events);

    res.status(200).json({ events });
  } catch (error: unknown) {
    console.error('Error fetching calendar events:', error);

    const apiError = error as { code?: number; message?: string };

    // Handle specific Google API errors
    if (apiError.code === 403) {
      return res.status(403).json({
        error: 'Access denied. You do not have permission to access this calendar.',
      });
    }

    if (apiError.code === 404) {
      return res.status(404).json({
        error: 'Calendar not found.',
      });
    }

    if (apiError.code === 401) {
      return res.status(401).json({
        error: 'Authentication failed. Please sign in again.',
        requiresReauth: true,
      });
    }

    res.status(500).json({
      error: apiError.message || 'Failed to fetch calendar events',
    });
  }
}
