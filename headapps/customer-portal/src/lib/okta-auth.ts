import { cookies } from "next/headers";

/**
 * Session Management Utilities for Okta Authentication
 */

export interface OktaUserInfo {
  sub: string;
  email?: string;
  name?: string;
}

const OKTA_COOKIE_NAMES = [
  "okta_access_token",
  "okta_id_token",
  "okta_refresh_token",
  "okta_user_info",
] as const;

/**
 * Get access token from cookies (server-side only)
 */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("okta_access_token")?.value || null;
}

/**
 * Get ID token from cookies (server-side only)
 */
export async function getIdToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("okta_id_token")?.value || null;
}

/**
 * Get refresh token from cookies (server-side only)
 */
export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("okta_refresh_token")?.value || null;
}

/**
 * Get user info from cookies (server-side only)
 */
export async function getUserInfo(): Promise<OktaUserInfo | null> {
  const cookieStore = await cookies();
  const userInfoStr = cookieStore.get("okta_user_info")?.value;
  if (!userInfoStr) {
    return null;
  }
  try {
    return JSON.parse(userInfoStr) as OktaUserInfo;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated (server-side only)
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}

/**
 * Clear all Okta session cookies (server-side only)
 * Uses COOKIE_DOMAIN if set to ensure cookies are cleared across subdomains for SSO
 * Note: Next.js cookies().delete() doesn't support domain parameter, so we set expired cookies
 * with the same domain that was used when setting them
 */
export async function clearOktaSession(): Promise<void> {
  const cookieStore = await cookies();
  const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

  const expiredCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  };

  for (const cookieName of OKTA_COOKIE_NAMES) {
    // Always clear host-only cookies.
    cookieStore.set(cookieName, "", expiredCookieOptions);

    // Also clear domain-scoped cookies used for cross-subdomain SSO.
    if (cookieDomain) {
      cookieStore.set(cookieName, "", {
        ...expiredCookieOptions,
        domain: cookieDomain,
      });
    }
  }
}

/**
 * Revoke all active Okta sessions for a specific user.
 * Requires OKTA_API_TOKEN and NEXT_PUBLIC_OKTA_DOMAIN to be configured.
 */
export async function revokeAllOktaSessionsForUser(userId: string): Promise<void> {
  if (!userId) {
    return;
  }

  const oktaDomain = process.env.NEXT_PUBLIC_OKTA_DOMAIN;
  const oktaApiToken = process.env.OKTA_API_TOKEN;

  if (!oktaDomain || !oktaApiToken) {
    return;
  }

  const response = await fetch(
    `https://${oktaDomain}/api/v1/users/${encodeURIComponent(userId)}/sessions?oauthTokens=true`,
    {
      method: "DELETE",
      cache: "no-store",
      headers: {
        Authorization: `SSWS ${oktaApiToken}`,
        Accept: "application/json",
      },
    }
  );

  // 404 can happen when no active sessions remain for the user.
  if (!response.ok && response.status !== 404) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Failed to revoke Okta sessions for user ${userId}: ${response.status} ${response.statusText} ${errorText}`.trim()
    );
  }
}

/**
 * Client-side utilities for token access
 * Note: Tokens are stored in httpOnly cookies, so client-side access is limited
 *
 * @deprecated Use functions from '@/lib/okta-auth-client' instead
 * This export is kept for backward compatibility but should not be used in client components
 */
export const clientAuth = {
  /**
   * Check if user is authenticated (client-side)
   * This checks for tokens in sessionStorage (set by widget before redirect)
   */
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") {
      return false;
    }
    return !!sessionStorage.getItem("okta_id_token");
  },

  /**
   * Clear client-side auth state
   */
  clearAuth: (): void => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("okta_id_token");
      sessionStorage.removeItem("okta_access_token");
    }
  },
};
