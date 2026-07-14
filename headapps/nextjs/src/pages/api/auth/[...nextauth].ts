import {
  checkIsMockUser,
  enrichSessionWithMockData,
  ensureMockUserSession,
  getMockUserId,
  isMockAuthEnabled,
  MOCK_USER,
} from 'lib/auth/mock-user-helpers';
import { getVisibleByEmails } from 'lib/auth/visible-by-service';
import { refreshAccessToken } from 'lib/auth/google-client';
import { isTokenExpired } from 'lib/auth/token-helpers';
import { adminFirestore } from 'lib/firebase/config';
import { userProfileService } from 'lib/firebase/server';
import { googleProfileService, fetchGroupsForUser } from 'lib/google/server';
import { getNewsHomeSite } from 'lib/home-site';
import { getNewsSupplementalSites } from 'lib/home-site/home-site-service';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { AuthOptions } from 'next-auth';
import { encode } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { log } from 'src/util/helpers/log-helper';
import { hashEmailForSearch } from 'src/util/helpers/visibility-helpers';
import type { GoogleGroupData, GoogleProfileData } from 'ts/google';
import { VoyagerMockData } from 'ts/voyager-mock-data';

import { FirestoreAdapter } from '@auth/firebase-adapter';

const db = adminFirestore;

// In-memory map to dedupe concurrent profile fetches during same request cycle
const inFlightProfileFetches = new Map<string, Promise<GoogleProfileData | null>>();

type StoredGoogleTokens = {
  access_token?: string;
  expires_at?: number;
  refresh_token?: string;
};
/**
 * Query the `accounts` collection (managed by FirestoreAdapter) to find the
 * Google account document for a given userId, and return the doc reference + data.
 */

const getGoogleAccountDoc = async (userId?: string) => {
  if (!userId) return undefined;
  const snapshot = await db
    .collection('accounts')
    .where('userId', '==', userId)
    .where('provider', '==', 'google')
    .limit(1)
    .get();
  if (snapshot.empty) return undefined;
  const doc = snapshot.docs[0];
  return { ref: doc.ref, data: doc.data() as StoredGoogleTokens };
};

/**
 * Update the Google account document in the `accounts` collection with refreshed tokens.
 */
const updateGoogleAccountTokens = async (
  userId: string,
  tokens: {
    access_token: string;
    expires_at: number;
    refresh_token?: string;
  }
) => {
  const account = await getGoogleAccountDoc(userId);
  if (!account) return;

  const update: Record<string, unknown> = {
    access_token: tokens.access_token,
    expires_at: tokens.expires_at,
  };
  if (tokens.refresh_token) {
    update.refresh_token = tokens.refresh_token;
  }
  await account.ref.update(update);
};

export const authOptions: AuthOptions = {
  adapter: FirestoreAdapter(db),
  // Configure one or more authentication providers
  providers: [
    // Mock credentials provider (development only)
    ...(isMockAuthEnabled()
      ? [
          CredentialsProvider({
            id: 'mock',
            name: 'Mock User',
            credentials: {
              email: { type: 'text' },
              groupEmail: { type: 'text' },
              companyCode: { type: 'text' },
              businessUnit: { type: 'text' },
            },
            async authorize(credentials) {
              const email = credentials?.email || MOCK_USER.email;
              return {
                id: getMockUserId(email),
                email,
                name: MOCK_USER.name,
                groupEmail:
                  credentials?.groupEmail || process.env.MOCK_GROUP_EMAIL || 'atexec@ascension.org',
                companyCode:
                  credentials?.companyCode || process.env.MOCK_USER_COMPANY_CODE || 'AscTech',
                businessUnit:
                  credentials?.businessUnit || process.env.MOCK_USER_BUSINESS_UNIT || '123',
              };
            },
          }),
        ]
      : []),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          /**
           * access_type=offline tells Google to issue a refresh token alongside
           * the access token so the session callback can renew expired access
           * tokens (see refreshAccessToken handling below). Without this, users
           * would receive 401s from Google APIs after the 1-hour access token TTL.
           */
          access_type: 'offline',
          scope: [
            // Basic OpenID Connect scopes
            'openid',
            'email',
            'profile',

            // User information (read-only)
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',

            // Admin Directory API (read-only)
            //// 'https://www.googleapis.com/auth/admin.directory.group.readonly'
            //// 'https://www.googleapis.com/auth/admin.directory.user.readonly',   // scope removal for go-live
            //// 'https://www.googleapis.com/auth/directory.readonly'

            // Drive (read-only)
            'https://www.googleapis.com/auth/drive.readonly',

            // Calendar (read-only)
            'https://www.googleapis.com/auth/calendar.events.readonly',
            'https://www.googleapis.com/auth/calendar.readonly',

            // Cloud Identity Groups (read-only)
            'https://www.googleapis.com/auth/cloud-identity.groups.readonly',

            // Chat API
            //// 'https://www.googleapis.com/auth/chat.spaces',     // scope removal for go-live
            //// 'https://www.googleapis.com/auth/chat.messages',   // scope removal for go-live
          ].join(' '),
        },
      },
    }),
  ],
  // how the user session is saved - we will eventually want to to switch to the 'database' adapter approach
  session: {
    // strategy: 'jwt',
    strategy: 'database',
  },
  // Use the same secret for JWT tokens in middleware
  secret: process.env.NEXTAUTH_SECRET,
  // a custom app-level sign-in page if we don't want to redirect to the Entra provider login directly
  pages: {
    signIn: '/auth/signin',
    // Route OAuth errors (e.g. silent auth failure with prompt=none) back to the
    // sign-in page so users see the normal UI instead of a generic error page.
    error: '/auth/signin',
  },
  debug: process.env.NODE_ENV !== 'production',
  callbacks: {
    /**
     * NextAuth.js signIn callback.
     *
     * Persists fresh Google OAuth tokens (access_token, refresh_token, expires_at)
     * to the Firestore `accounts` collection on every Google sign-in. This is
     * necessary because NextAuth v4's FirestoreAdapter only writes tokens on
     * *initial* account linking — it does NOT update tokens on subsequent
     * sign-ins for an already-linked account. Without this callback, users who
     * re-consent (e.g. to obtain a missing refresh_token) would keep seeing
     * their old stale tokens on `session.googleAccessToken`, and the session
     * callback would repeatedly flag `RefreshAccessTokenError`.
     */
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user?.id && account.access_token) {
        try {
          await updateGoogleAccountTokens(user.id, {
            access_token: account.access_token,
            expires_at: account.expires_at || Math.floor(Date.now() / 1000) + 3600,
            refresh_token: account.refresh_token ?? undefined,
          });
          log('INFO', 'NextAuth', 'Persisted Google tokens on sign-in', {
            userId: user.id,
            hasRefreshToken: !!account.refresh_token,
          });
        } catch (error) {
          log('WARNING', 'NextAuth', 'Failed to persist Google tokens on sign-in', { error });
        }
      }
      return true;
    },

    /**
     * NextAuth.js session callback.
     *
     * This function is invoked whenever a session is checked or created, such as on every page load
     * where `useSession`, `getSession`, or similar NextAuth.js session utilities are used.
     * It is responsible for augmenting the session object with additional user data, such as:
     * - User ID normalization
     * - Mock authentication support for development environments
     * - Loading and refreshing Google OAuth tokens from Firestore
     * - Fetching and attaching Google Groups and Google Profile data
     * - Loading additional user data from Firestore (e.g., UKG person numbers)
     *
     * The callback may perform asynchronous operations, including Firestore and external API calls,
     * and will return the enriched session object for use on the client and server.
     *
     * @param session - The current session object.
     * @param user - The user object (may be undefined depending on the trigger).
     * @returns The updated session object with additional user and authentication data.
     */
    async session({ session, user }) {
      const userId = session.user?.id || user?.id;

      if (userId && session.user) {
        session.user.id = userId;
      }

      //Add ukg data to the session.
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();

      if (userData?.employeeNumber) {
        session.employeeNumber = userData.employeeNumber;
      }
      if (userData?.employeeNumbers) {
        session.employeeNumbers = Array.isArray(userData.employeeNumbers)
          ? userData.employeeNumbers
          : userData.employeeNumbers.split(',').map((e: string) => e.trim());
      }
      if (userData?.VoyagerMockJson && userData?.VoyagerMockJson !== '') {
        try {
          const parsed: VoyagerMockData = JSON.parse(userData?.VoyagerMockJson);
          session.voyagerMockJson = parsed;
        } catch {
          session.voyagerMockJson = undefined;
        }
      }

      // Handle mock authentication (development only)
      if (checkIsMockUser(session.user?.email ?? undefined, userId)) {
        return enrichSessionWithMockData(
          session,
          userId,
          userData as Record<string, unknown> | undefined,
          user as { groupEmail?: string }
        );
      }

      // Load Google tokens from the accounts collection (managed by FirestoreAdapter) and refresh if expired
      const googleAccount = await getGoogleAccountDoc(userId);
      if (googleAccount?.data.access_token && googleAccount.data.expires_at) {
        let accessToken = googleAccount.data.access_token;
        // expires_at from the adapter is in seconds; convert to ms for consistency
        let accessTokenExpires = googleAccount.data.expires_at * 1000;
        let refreshToken = googleAccount.data.refresh_token;

        if (isTokenExpired(accessTokenExpires) && refreshToken) {
          try {
            log('INFO', 'NextAuth', 'Access token expired, refreshing');
            const refreshed = await refreshAccessToken(refreshToken);
            accessToken = refreshed.accessToken;
            accessTokenExpires = refreshed.accessTokenExpires;
            refreshToken = refreshed.refreshToken || refreshToken;

            if (userId) {
              await updateGoogleAccountTokens(userId, {
                access_token: accessToken,
                // Store back in seconds to match the adapter's format
                expires_at: Math.floor(accessTokenExpires / 1000),
                refresh_token: refreshToken,
              });
            }
          } catch (error) {
            log('WARNING', 'NextAuth', 'Failed to refresh Google access token', { error });
            session.error = 'RefreshAccessTokenError';
          }
        } else if (isTokenExpired(accessTokenExpires) && !refreshToken) {
          /**
           * Expired access token with no refresh token — session cannot self-recover.
           * This happens for accounts created before `access_type: 'offline'` was added
           * to the Google provider. API routes should detect this flag and signal the
           * client to redirect through the consent retry path
           * (/auth/signin?error=Callback) so Google issues a fresh refresh token.
           */
          log('WARNING', 'NextAuth', 'Access token expired with no refresh token available');
          session.error = 'RefreshAccessTokenError';
        }

        session.user.googleAccessToken = accessToken;
        session.googleAccessToken = accessToken;
        session.googleAccessTokenExpires = accessTokenExpires;
        session.refreshToken = refreshToken;
      }

      // Uses a service account with domain-wide delegation
      // Only fetch if not already on the session to avoid redundant API calls.
      // Guard: never call fetchGroupsForUser for mock users — it has a 15-minute Redis
      // cache that would serve stale groups across user switches in deployed environments.
      const userEmail = session.user?.email;
      if (userEmail && !session.googleGroups && !checkIsMockUser(userEmail, userId)) {
        try {
          session.googleGroups = await fetchGroupsForUser(userEmail);
        } catch (err) {
          log('WARNING', 'NextAuth', 'Failed to fetch google groups', {
            error: err instanceof Error ? err.message : String(err),
          });
          session.googleGroups = [];
        }
      }

      if (
        session.googleGroups?.length &&
        (!session.filteredGroupEmailHashes?.length || !session.filteredGroupEmails?.length)
      ) {
        try {
          const visibleByEmails = await getVisibleByEmails();
          const visibleBySet = new Set(visibleByEmails);
          const filteredEmails = ((session.googleGroups as GoogleGroupData[]) ?? [])
            .map((g) => g.email?.toLowerCase().trim())
            .filter((e): e is string => Boolean(e) && visibleBySet.has(e));
          session.filteredGroupEmails = filteredEmails;
          session.filteredGroupEmailHashes = filteredEmails.map(hashEmailForSearch);
        } catch (err) {
          log('WARNING', 'NextAuth', 'Failed to compute filtered group emails', {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }

      // Fetch Google profile data if not already on the session
      if (!session.googleProfile && userId && userEmail && !checkIsMockUser(userEmail, userId)) {
        // Check if we already have an in-flight request for this user
        let profilePromise = inFlightProfileFetches.get(userId);

        if (!profilePromise) {
          // Create new fetch promise
          profilePromise = (async () => {
            try {
              // Try loading from Firestore first (via userProfileService)
              let profile = await userProfileService.getGoogleProfile(userId);

              // If not in Firestore or stale, fetch from Directory API (via googleProfileService)
              if (!profile) {
                profile = await googleProfileService.fetchExtendedProfile(userEmail);

                // If fetch succeeded, persist to Firestore (fire and forget)
                if (profile) {
                  userProfileService.saveGoogleProfile(userId, profile).catch((err) => {
                    log('WARNING', 'NextAuth', 'Failed to cache profile in Firestore', {
                      error: err instanceof Error ? err.message : String(err),
                    });
                  });
                }
              }

              return profile;
            } finally {
              // Clean up in-flight tracking
              inFlightProfileFetches.delete(userId);
            }
          })();

          // Track this request to prevent duplicate fetches
          inFlightProfileFetches.set(userId, profilePromise);
        }

        // Await the profile (either new or in-flight)
        try {
          session.googleProfile = (await profilePromise) || undefined;
        } catch (error) {
          log('WARNING', 'NextAuth', 'Failed to fetch Google data', { error });
        }
      }

      // Resolve news home site and supplemental sites for the user.
      if (userId && session.googleProfile) {
        try {
          session.newsHomeSite = await getNewsHomeSite(userId, session.googleProfile);
          session.newsSupplementalSites = await getNewsSupplementalSites(userId);
        } catch (error) {
          log('WARNING', 'NextAuth', 'Failed to resolve home site or supplemental sites', {
            error,
          });
        }
      }
      return session;
    },
  },
  events: {
    /**
     * Revoke the user's Google OAuth grant on sign-out and clear stored tokens.
     * Belt-and-suspenders for shared workstations: even if the browser-level
     * Google session cookie persists, the stored refresh token is dead so the
     * next sign-in is forced through the consent screen rather than silent
     * token reuse.
     */
    async signOut(message) {
      const userId =
        (message as { session?: { userId?: string } }).session?.userId ??
        (message as { token?: { sub?: string } }).token?.sub;

      log('INFO', 'NextAuth', 'signOut event fired', {
        hasUserId: !!userId,
        messageKeys: Object.keys(message || {}),
      });

      if (!userId) return;

      try {
        const account = await getGoogleAccountDoc(userId);
        const tokenToRevoke = account?.data.refresh_token || account?.data.access_token;

        if (tokenToRevoke) {
          await fetch('https://oauth2.googleapis.com/revoke', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ token: tokenToRevoke }).toString(),
          });
        }

        if (account) {
          await account.ref.update({
            access_token: null,
            refresh_token: null,
            expires_at: null,
          });
        }

        log('INFO', 'NextAuth', 'Revoked Google tokens on sign-out', { userId });
      } catch (error) {
        log('WARNING', 'NextAuth', 'Failed to revoke Google tokens on sign-out', { error });
      }
    },
  },
};

// Session max age in seconds (30 days, matching NextAuth default)
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

/**
 * Custom NextAuth handler that intercepts mock credentials sign-in.
 *
 * NextAuth v4's CredentialsProvider does NOT call the database adapter's
 * createUser / createSession methods, so mock login never persists a session
 * in Firestore. We handle it manually here:
 * 1. Create/upsert the mock user document in Firestore
 * 2. Create a session document with a generated sessionToken
 * 3. Set the session cookie so NextAuth can resolve it on subsequent requests
 * 4. Redirect to the callbackUrl
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  /**
   * On signOut, expire the `next-auth.mock-token` cookie. NextAuth's built-in
   * signOut only clears its standard cookies (session-token, csrf, etc.) — the
   * mock JWT cookie set by the mock-signin flow below would otherwise linger
   * for up to 30 days and could be misread by downstream code as a valid
   * authentication source for the next user of the browser.
   */
  const isSignOut =
    req.method === 'POST' &&
    Array.isArray(req.query.nextauth) &&
    req.query.nextauth.includes('signout');

  if (isSignOut) {
    const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith('https://');
    const mockCookieName = useSecureCookies
      ? '__Secure-next-auth.mock-token'
      : 'next-auth.mock-token';
    const clearMockCookie =
      `${mockCookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax` +
      (useSecureCookies ? '; Secure' : '');

    /**
     * NextAuth writes its own Set-Cookie headers via res.setHeader during
     * signout, which would replace any Set-Cookie we wrote eagerly. Wrap
     * setHeader so our clear-cookie directive is appended to whatever NextAuth
     * sets, rather than overwritten.
     */
    const originalSetHeader = res.setHeader.bind(res);
    const wrappedSetHeader: typeof res.setHeader = ((
      name: string,
      value: number | string | readonly string[]
    ) => {
      if (typeof name === 'string' && name.toLowerCase() === 'set-cookie') {
        const cookies: string[] = Array.isArray(value)
          ? [...(value as readonly string[])]
          : [value as string];
        return originalSetHeader('Set-Cookie', [...cookies, clearMockCookie]);
      }
      return originalSetHeader(name, value);
    }) as typeof res.setHeader;
    res.setHeader = wrappedSetHeader;
  }

  const isMockSignIn =
    req.method === 'POST' &&
    req.query.nextauth?.includes('callback') &&
    req.query.nextauth?.includes('mock');

  if (isMockSignIn) {
    try {
      const email = (req.body?.email as string) || MOCK_USER.email;
      const groupEmail = (req.body?.groupEmail as string) || undefined;
      const companyCode = (req.body?.companyCode as string) || undefined;
      const businessUnit = (req.body?.businessUnit as string) || undefined;
      const mockUser = {
        id: getMockUserId(email),
        email,
        name: MOCK_USER.name,
        groupEmail,
        companyCode,
        businessUnit,
      };

      const sessionToken = await ensureMockUserSession(mockUser, SESSION_MAX_AGE);

      // Determine the session cookie name (NextAuth uses __Secure- prefix in production)
      const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith('https://');
      const cookieName = useSecureCookies
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token';

      const expires = new Date(Date.now() + SESSION_MAX_AGE * 1000);

      // Build mock groups from form input → env var → default
      const mockGroupRaw = groupEmail || process.env.MOCK_GROUP_EMAIL || 'atexec@ascension.org';
      const mockGoogleGroups = mockGroupRaw
        .split(',')
        .map((e: string) => e.trim().toLowerCase())
        .filter(Boolean)
        .map((grpEmail: string) => ({ id: grpEmail, email: grpEmail, name: grpEmail }));

      // Sign a JWT token so getToken() in GatekeeperProxy can read googleGroups.

      const jwtValue = await encode({
        token: {
          sub: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          googleGroups: mockGoogleGroups,
        },
        secret: process.env.NEXTAUTH_SECRET!,
        maxAge: SESSION_MAX_AGE,
      });

      // Set the database session cookie (for NextAuth session resolution)
      const sessionCookieOptions = [
        `${cookieName}=${sessionToken}`,
        `Path=/`,
        `Expires=${expires.toUTCString()}`,
        `HttpOnly`,
        `SameSite=Lax`,
        ...(useSecureCookies ? ['Secure'] : []),
      ].join('; ');

      // Set the JWT cookie under a distinct name so it doesn't overwrite the session
      const jwtCookieNameToken = useSecureCookies
        ? '__Secure-next-auth.mock-token'
        : 'next-auth.mock-token';

      const jwtCookieOptions = [
        `${jwtCookieNameToken}=${jwtValue}`,
        `Path=/`,
        `Expires=${expires.toUTCString()}`,
        `HttpOnly`,
        `SameSite=Lax`,
        ...(useSecureCookies ? ['Secure'] : []),
      ].join('; ');

      res.setHeader('Set-Cookie', [sessionCookieOptions, jwtCookieOptions]);

      // Return JSON response — next-auth/react's signIn() uses fetch() internally
      // and expects a JSON body with a `url` property for the client-side redirect.
      const callbackUrl = (req.body?.callbackUrl as string) || '/';
      return res.status(200).json({ url: callbackUrl });
    } catch (error) {
      log('ERROR', 'NextAuth', 'Mock sign-in failed', { error });
      return res.status(200).json({ url: '/auth/signin?error=MockSignInFailed' });
    }
  }

  // For all other auth requests (Google OAuth, session checks, etc.), delegate to NextAuth
  return NextAuth(req, res, authOptions);
}

declare module 'next-auth' {
  interface Session {
    googleGroups?: GoogleGroupData[];
    googleProfile?: GoogleProfileData;
    googleAccessToken?: string;
    googleAccessTokenExpires?: number;
    refreshToken?: string;
    error?: string;
  }

  interface User {
    googleAccessToken?: string;
  }
}
