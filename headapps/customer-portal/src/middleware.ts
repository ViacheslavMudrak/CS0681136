/* eslint-disable @typescript-eslint/no-require-imports */
import { type SiteInfo } from "@sitecore-content-sdk/nextjs";
import {
  AppRouterMultisiteMiddleware,
  defineMiddleware,
  LocaleMiddleware,
  PersonalizeMiddleware,
  RedirectsMiddleware
} from "@sitecore-content-sdk/nextjs/middleware";
import { hasLocale } from "next-intl";
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse
} from "next/server";
import scConfig from "sitecore.config";
import { routing } from "./i18n/routing";
import { AUTH_ENTRY_PATHS, buildLoginUrl, isPublicRoute, normalizeAuthPath } from "./lib/auth-utils";

// Handle missing sites.json gracefully
let sites: SiteInfo[] = [];
try {
  sites = require(".sitecore/sites.json");
} catch {
  // sites.json doesn't exist yet - use empty array
  sites = [];
}

// Routes that should skip Sitecore middleware processing
// These are Next.js routes, not Sitecore pages
// Note: /login and /register are Sitecore pages (rendered via Auth component), so they should go through Sitecore middleware
const nonSitecoreRoutes = ["/dashboard", "/authorization"];

const shouldSkipSitecoreMiddleware = (pathname: string): boolean => {
  // Skip Sitecore middleware for non-Sitecore routes
  return nonSitecoreRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
};

/** Skip personalize/redirects on public auth pages — locale middleware still runs. */
const shouldSkipPersonalizeAndRedirects = (pathname: string): boolean => {
  if (shouldSkipSitecoreMiddleware(pathname)) {
    return true;
  }

  const normalizedPath = normalizeAuthPath(pathname);
  return AUTH_ENTRY_PATHS.some(
    (route) => normalizedPath === route || normalizedPath.startsWith(`${route}/`)
  );
};

const locale = new LocaleMiddleware({
  /**
   * List of sites for site resolver to work with
   */
  sites,
  /**
   * List of all supported locales configured in routing.ts
   */
  locales: routing.locales.slice(),
  // This function determines if the middleware should be turned off on per-request basis.
  // Certain paths are ignored by default (e.g. files and Next.js API routes), but you may wish to disable more.
  // This is an important performance consideration since Next.js Edge middleware runs on every request.
  // in multilanguage scenarios, we need locale middleware to always run first to ensure locale is set and used correctly by the rest of the middlewares
  skip: (req) => shouldSkipSitecoreMiddleware(req.nextUrl.pathname)
});

const multisite = new AppRouterMultisiteMiddleware({
  /**
   * List of sites for site resolver to work with
   */
  sites,
  ...scConfig.api.edge,
  ...scConfig.multisite,
  // This function determines if the middleware should be turned off on per-request basis.
  // Certain paths are ignored by default (e.g. files and Next.js API routes), but you may wish to disable more.
  // This is an important performance consideration since Next.js Edge middleware runs on every request.
  skip: (req) => shouldSkipSitecoreMiddleware(req.nextUrl.pathname)
});

const redirects = new RedirectsMiddleware({
  /**
   * List of sites for site resolver to work with
   */
  sites,
  ...scConfig.api.edge,
  ...scConfig.redirects,
  // This function determines if the middleware should be turned off on per-request basis.
  // Certain paths are ignored by default (e.g. Next.js API routes), but you may wish to disable more.
  // By default it is disabled while in development mode.
  // This is an important performance consideration since Next.js Edge middleware runs on every request.
  skip: (req) => shouldSkipPersonalizeAndRedirects(req.nextUrl.pathname)
});

const personalize = new PersonalizeMiddleware({
  /**
   * List of sites for site resolver to work with
   */
  sites,
  ...scConfig.api.edge,
  ...scConfig.personalize,
  // This function determines if the middleware should be turned off on per-request basis.
  // Certain paths are ignored by default (e.g. Next.js API routes), but you may wish to disable more.
  // By default it is disabled while in development mode.
  // This is an important performance consideration since Next.js Edge middleware runs on every request.
  skip: (req) => shouldSkipPersonalizeAndRedirects(req.nextUrl.pathname)
});


/**
 * Authentication Middleware
 * Checks for authentication cookie and redirects to login if not authenticated
 * Also handles route protection: redirects authenticated users from /login to /dashboard
 * and unauthenticated users from /dashboard to /login
 */
function authMiddleware(req: NextRequest): NextResponse | null {
  const pathname = req.nextUrl.pathname;
  const accessToken = req.cookies.get("okta_access_token");
  const isAuthenticated = !!accessToken;


  // Redirect unauthenticated users from dashboard to login
  // Note: /dashboard remains a public route but requires authentication to view
  if (pathname === "/" && !isAuthenticated) {
    const loginUrl = buildLoginUrl("/");
    return NextResponse.redirect(new URL(loginUrl, req.url));
  }

  // TODO: Remove this once we have a proper dashboard page in sitecore
  // Skip authentication check for public routes (except /login and /dashboard which are handled above)
  if (isPublicRoute(pathname)) {
    return null; // Continue with other middleware
  }
  // If no access token, redirect to login with return URL
  if (!isAuthenticated) {
    const loginUrl = buildLoginUrl(req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(new URL(loginUrl, req.url));
  }

  // User is authenticated, continue with other middleware
  return null;
}

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  const hostname = req.headers.get("host") || "";
  const isFrontendRequest = hostname.includes(process.env.HOSTNAME || "");

  // Run authentication check first
  const authResponse = isFrontendRequest ? authMiddleware(req) : null;
  if (authResponse) {
    return authResponse;
  }


  // Continue with Sitecore middleware
  return defineMiddleware(locale, multisite, redirects, personalize).exec(
    req,
    ev
  );
}

export const config = {
  /*
   * Match all paths except for:
   * 1. /api routes
   * 2. /_next (Next.js internals)
   * 3. /sitecore/api (Sitecore API routes)
   * 4. /- (Sitecore media)
   * 5. /healthz (Health check)
   * 6. /dashboard, /authorization (Next.js routes - login/register are Sitecore pages)
   * 7. all root files inside /public
   */
  matcher: [
    "/",
    "/((?!api/|_next/|healthz|sitecore/api/|-/|favicon.ico|sc_logo.svg|authorization).*)"
  ]
};
