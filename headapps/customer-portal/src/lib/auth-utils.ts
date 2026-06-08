import { fetchUserProfile } from "./apis/user-profile-api";
import { getPreferredLocalePath } from "./locale-cookie";
import type { UserProfileResponse } from "./types/user-profile";
import { storeUserProfile } from "./user-profile-session-storage";
import { isFreshLoginSession } from "./okta-auth-client";
import { sendIdentityEvent } from "./CDPEvents";

export const CONTACT_SUPPORT_PATH = "/contact-support";
export const SIGNIN_ERROR_PATH = "/signin-error";

export type ContactSupportOnlyProfile = Pick<
  UserProfileResponse,
  "isMultipleParent" | "isDomainRestricted"
>;

/** Users who must use contact support instead of the main portal (post-login redirect target). */
export function isContactSupportOnlyProfile(
  profile: ContactSupportOnlyProfile | null | undefined
): boolean {
  return Boolean(profile?.isMultipleParent || profile?.isDomainRestricted);
}

export function isSignInErrorProfile(profile: UserProfileResponse | null | undefined): boolean {
  return profile != null && profile.parentContact == null && profile.leads == null;
}

/** Lead-only users pending account setup (post-login redirect to `/account-submitted`). */
export function isAccountSubmittedProfile(
  profile: UserProfileResponse | null | undefined
): boolean {
  return Boolean(profile?.leads && profile.leads.length > 0);
}

/** Profiles that must not access the main portal shell (contact support, sign-in error, or lead-only). */
export function isPortalAccessDeniedProfile(
  profile: UserProfileResponse | null | undefined
): boolean {
  return (
    isContactSupportOnlyProfile(profile) ||
    isSignInErrorProfile(profile) ||
    isAccountSubmittedProfile(profile)
  );
}

const AUTH_CALLBACK_PATHS = ["/authorization/verify", "/authorization/callback"];
export const AUTH_ENTRY_PATHS = ["/login", "/register", "/reset-password"];
const LOGIN_RETURN_URL_KEY = "login_return_url";

export function getReturnUrl(searchParams: URLSearchParams | string): string {
  if (typeof searchParams === "string") {
    const params = new URLSearchParams(searchParams);
    return params.get("returnUrl") || "/";
  }
  return searchParams.get("returnUrl") || "/";
}

export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    "/robots.txt",
    "/sitemap.xml",
    "/login",
    "/register",
    "/reset-password",
    "/register/check-email",
    "/account-submitted",
  ];

  const normalizedPath = normalizeAuthPath(pathname);

  if (publicRoutes.includes(normalizedPath)) {
    return true;
  }

  return publicRoutes.some((route) => normalizedPath.startsWith(`${route}/`));
}

export function buildLoginUrl(returnUrl: string): string {
  const sanitizedReturnUrl = sanitizeReturnUrl(returnUrl) ?? "/";
  return `/login?returnUrl=${encodeURIComponent(sanitizedReturnUrl)}`;
}

export function assignPostLoginNavigation(target: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const trimmed = (target || "").trim();
  const fallback = "/";

  if (!trimmed) {
    window.location.assign(fallback);
    return;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const dest = new URL(trimmed);
      if (dest.origin === window.location.origin) {
        window.location.assign(dest.pathname + dest.search + dest.hash);
        return;
      }
    } catch {
      /* invalid URL */
    }
    window.location.assign(fallback);
    return;
  }

  window.location.assign(trimmed.startsWith("/") ? trimmed : `/${trimmed}`);
}

function isAuthCallbackReturnUrl(returnUrl: string): boolean {
  const decodedReturnUrl = decodeURIComponent(returnUrl || "");
  return AUTH_CALLBACK_PATHS.some((callbackPath) => decodedReturnUrl.includes(callbackPath));
}

function isAuthEntryReturnUrl(returnUrl: string): boolean {
  const normalizedPath = normalizeAuthPath(returnUrl);
  return AUTH_ENTRY_PATHS.some(
    (authPath) => normalizedPath === authPath || normalizedPath.startsWith(`${authPath}/`)
  );
}

function isUsableReturnUrl(returnUrl: string | null | undefined): returnUrl is string {
  const sanitized = sanitizeReturnUrl(returnUrl);
  if (!sanitized) {
    return false;
  }
  return !isAuthCallbackReturnUrl(sanitized) && !isAuthEntryReturnUrl(sanitized);
}

export function normalizeAuthPath(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  const parsedPath = (() => {
    try {
      return new URL(pathname, "http://localhost").pathname;
    } catch {
      return pathname;
    }
  })();

  const normalizedSlashes = parsedPath.replace(/\/{2,}/g, "/");
  const withoutTrailingSlash =
    normalizedSlashes.length > 1 ? normalizedSlashes.replace(/\/+$/, "") : normalizedSlashes;
  const segments = withoutTrailingSlash.split("/").filter(Boolean);

  if (segments.length >= 3) {
    const localeCandidate = segments[1];
    const isLocaleLike = /^[a-z]{2}(?:-[A-Za-z]{2})?$/.test(localeCandidate);
    if (isLocaleLike) {
      return `/${segments.slice(2).join("/")}` || "/";
    }
  }

  return withoutTrailingSlash.startsWith("/") ? withoutTrailingSlash : `/${withoutTrailingSlash}`;
}

export function sanitizeReturnUrl(returnUrl: string | null | undefined): string | null {
  if (!returnUrl) {
    return null;
  }

  const trimmed = returnUrl.trim();
  if (!trimmed) {
    return null;
  }

  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    decoded = trimmed;
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//")) {
    return null;
  }

  const normalizedPath = normalizeAuthPath(decoded);
  if (
    AUTH_CALLBACK_PATHS.some(
      (path) => normalizedPath === path || normalizedPath.startsWith(`${path}/`)
    )
  ) {
    return null;
  }
  if (isAuthEntryReturnUrl(decoded)) {
    return null;
  }
  return decoded;
}

export async function resolvePostLoginDestination(options: {
  userEmail?: string;
  explicitReturnUrl?: string | null;
  includeStoredReturnUrl?: boolean;
  clearStoredReturnUrl?: boolean;
}): Promise<string> {
  if (!options.userEmail) {
    return '';
  }
  const {
    userEmail,
    explicitReturnUrl,
    includeStoredReturnUrl = true,
    clearStoredReturnUrl = true,
  } = options;

  const freshLoginSession = isFreshLoginSession();
  if (freshLoginSession && typeof window !== "undefined") {
    sessionStorage.removeItem("okta_fresh_login_session");
  }

  let profile: Awaited<ReturnType<typeof fetchUserProfile>> | null = null;
  try {
    profile = await fetchUserProfile({ email: userEmail });
    storeUserProfile(profile, userEmail);

    const contact = profile?.parentContact?.[0];
    const lead = profile?.leads?.[0];
    const identityEmail = userEmail || lead?.email;
    if (identityEmail) {
      sendIdentityEvent({
        firstName: contact?.firstName || lead?.firstName,
        lastName: contact?.lastName || lead?.lastName,
        email: identityEmail,
      });
    }
  } catch (e) {
    console.warn("Post-login profile fetch failed:", e);
    return SIGNIN_ERROR_PATH;
  }

  let returnUrl = "/";
  if (isContactSupportOnlyProfile(profile)) {
    return CONTACT_SUPPORT_PATH;
  }
  if (isSignInErrorProfile(profile)) {
    return SIGNIN_ERROR_PATH;
  }
  if (isAccountSubmittedProfile(profile)) {
    return "/account-submitted";
  }

  if (isUsableReturnUrl(explicitReturnUrl)) {
    returnUrl = explicitReturnUrl;
  }

  if (typeof window === "undefined") {
    return returnUrl;
  }

  if (!freshLoginSession && !isUsableReturnUrl(explicitReturnUrl) && includeStoredReturnUrl) {
    const storedReturnUrl = sessionStorage.getItem(LOGIN_RETURN_URL_KEY);
    if (isUsableReturnUrl(storedReturnUrl)) {
      returnUrl = storedReturnUrl;
    }
  }

  if (clearStoredReturnUrl) {
    sessionStorage.removeItem(LOGIN_RETURN_URL_KEY);
  }

  const redirectPath = new URL(returnUrl, window.location.origin);
  const pathname = redirectPath.pathname;
  const search = redirectPath.search;
  const defaultLanguage = profile?.userPreference?.defaultLanguage?.trim();
  if (defaultLanguage) {
    const targetPath = getPreferredLocalePath(pathname, defaultLanguage);
    returnUrl = targetPath ? targetPath + search : returnUrl;
  }
  return returnUrl;
}

export type AuthFlowType = "register" | "reset-password" | "login";

export function detectAuthFlow(): AuthFlowType {
  if (typeof window === "undefined") {
    return "login";
  }

  const registerFlow = localStorage.getItem("okta_register_flow");
  const resetFlow = localStorage.getItem("okta_reset_flow");

  if (registerFlow === "true") {
    return "register";
  }

  if (resetFlow === "true") {
    return "reset-password";
  }

  return "login";
}
