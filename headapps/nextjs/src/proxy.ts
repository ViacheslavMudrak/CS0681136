import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  defineProxy,
  MultisiteProxy,
  PersonalizeProxy,
  RedirectsProxy,
} from '@sitecore-content-sdk/nextjs/proxy';
import { isCrawlerRequest } from 'lib/auth/crawler-request';
import { log } from 'src/util/helpers/log-helper';
import { GatekeeperProxy } from './lib/proxy/GatekeeperProxy';
// @ts-ignore - import is auto generated on build
import sites from '.sitecore/sites.json';
import scConfig from 'sitecore.config';

export default async function proxy(req: NextRequest) {
  // If no Edge server contextId, skip Edge middlewares entirely.
  // (SSR/API can still use Local creds; no crash in Edge runtime.)
  if (!scConfig.api?.edge?.contextId && !scConfig.api?.local?.apiHost) {
    return NextResponse.next();
  }

  // ISR UPDATES
  // on-demand: experience edge webhook via experience edge admin api (when pages are published) to re-generate the page
  // - giving exp edge an endpoint to hit once something is published (e.g., serverless function) that calls revalidate function from the next.js application (or directly to next.js app if payload limit/build length doesn't cause timeout issues)
  // - experience edge > message bus (queue - pub/sub via google) > next.js application

  const pathname = req.nextUrl.pathname;
  const isSitecoreEditingMode = isSitecoreEditingRequest(req);

  log('INFO', 'middleware', 'Editing-mode evaluation', {
    path: pathname,
    isSitecoreEditingMode,
    hasPreviewBypassCookie: !!req.cookies.get('__prerender_bypass')?.value,
    hasPreviewDataCookie: !!req.cookies.get('__next_preview_data')?.value,
    headlessMode: req.cookies.get('sc_headless_mode')?.value ?? null,
  });

  // If Authentication Protection is enabled, check for protected routes
  // Skip authentication checks when in Sitecore editing mode
  const isAuthProtectionEnabled = process.env.FORCE_AUTH === 'true';
  if (
    isAuthProtectionEnabled &&
    !isSitecoreEditingMode &&
    !isPublicRoute(pathname) &&
    !isCrawlerRequest(req)
  ) {
    // Check if user is authenticated.
    // With database sessions, getToken() only works for mock/JWT users.
    // For real Google users, check for the database session cookie directly.
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const useSecureCookies = req.url.startsWith('https://');
    const sessionCookieName = useSecureCookies
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token';
    const hasSessionCookie = !!req.cookies.get(sessionCookieName)?.value;

    if (!token && !hasSessionCookie) {
      // User is not authenticated — attempt silent Google auth first.
      // The sign-in page will try prompt=none when silent=true is set,
      // falling back to the normal sign-in UI if Google can't authenticate silently.
      const signinUrl = new URL('/auth/signin', req.url);
      signinUrl.searchParams.set('silent', 'true');
      signinUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signinUrl);
    }
    console.log(
      JSON.stringify({
        severity: 'INFO',
        message: 'Request to protected route passed authentication.',
        component: 'middleware',
        path: pathname,
        timestamp: new Date().toISOString(),
      })
    );
  }

  /**
   * MIDDLEWARES
   * - Instantiate middlewares AFTER the guard so constructors don't run in local-only mode
   */

  // MIDDLEWARE (custom): PAGE-LEVEL SECURITY
  const gatekeeper = new GatekeeperProxy({
    /**
     * List of sites for site resolver to work with
     */
    sites,
    // This function determines if the middleware should be turned off on per-request basis.
    // Also bypasses gating for the Sitecore Search crawler so it can index all pages
    // including gated ones. Requires SITECORE_SEARCH_CRAWLER_USERNAME and SITECORE_SEARCH_CRAWLER_PASSWORD.
    skip: (req: NextRequest) => {
      if (skipRoutes(req)) return true;
      return isCrawlerRequest(req);
    },
  });

  const multisite = new MultisiteProxy({
    /**
     * List of sites for site resolver to work with
     */
    sites,
    ...scConfig.api.edge,
    ...scConfig.multisite,
    // This function determines if the middleware should be turned off on per-request basis.
    // Certain paths are ignored by default (e.g. files and Next.js API routes), but you may wish to disable more.
    // This is an important performance consideration since Next.js Edge middleware runs on every request.
    skip: (req: NextRequest) => skipRoutes(req),
  });

  const redirects = new RedirectsProxy({
    /**
     * List of sites for site resolver to work with
     */
    sites,
    ...scConfig.api.edge,
    ...scConfig.api.local,
    ...scConfig.redirects,
    // This function determines if the middleware should be turned off on per-request basis.
    // Certain paths are ignored by default (e.g. Next.js API routes), but you may wish to disable more.
    // By default it is disabled while in development mode.
    // This is an important performance consideration since Next.js Edge middleware runs on every request.
    skip: (req: NextRequest) => skipRoutes(req),
  });

  const personalize = new PersonalizeProxy({
    /**
     * List of sites for site resolver to work with
     */
    sites,
    ...scConfig.api.edge,
    ...scConfig.personalize,
    // This function determines if the middleware should be turned off on per-request basis.
    // Certain paths are ignored by default (e.g. Next.js API routes), but you may wish to disable more.
    // By default it is disabled while in development mode.
    // This is an important performance consideration since Next.js Edge middleware runs on every request
    skip: (req: NextRequest) => skipRoutes(req),
  });

  // Run gatekeeper FIRST to short-circuit if unauthenticated/unauthorized.
  // This avoids running multisite, redirects, and personalize middlewares
  // (which make Edge API calls) when the user will be denied anyway.
  // Sitecore editing requests bypass the gatekeeper entirely so Pages can
  // render gated content regardless of the editor's group memberships.
  let gatekeeperResult: NextResponse = NextResponse.next();
  if (!isSitecoreEditingMode) {
    gatekeeperResult = await gatekeeper.handle(req, NextResponse.next());
    const rewriteUrl = gatekeeperResult.headers.get('x-middleware-rewrite') || '';
    // Short-circuit on either a /403 rewrite OR a redirect (e.g., gatekeeper
    // sending an unauthenticated user to the sign-in page).
    const wasBlocked =
      rewriteUrl.includes('/403') ||
      rewriteUrl.includes('/Error/') ||
      (gatekeeperResult.status >= 300 && gatekeeperResult.status < 400);

    if (wasBlocked) {
      return gatekeeperResult;
    }
  }

  //**
  //* Run remaining middlewares with gatekeeper's response
  // The third res parameter is optional — when provided, it's used as the initial response seeding the reduce  chain instead of a fresh NextResponse.next(). So gatekeeperResult is correctly passed through as the starting response for multisite → redirects → personalize, preserving any headers/cookies gatekeeper may have set.
  //  */
  return defineProxy(multisite, redirects, personalize).exec(req, gatekeeperResult);
}

/**
 * Determines whether a request is part of a Sitecore Pages editing session.
 *
 * Used by the Edge middleware to skip the GatekeeperProxy for Pages editor
 * traffic so editors can render every page regardless of group membership.
 *
 * Signals (all server-set, per Sitecore Content SDK docs):
 *   - Next.js Preview Mode cookies (`__prerender_bypass`, `__next_preview_data`)
 *     set by `/api/editing/render` after Sitecore validates its editing JWT.
 *   - `sc_headless_mode` cookie set by the SDK with value 'edit' or 'preview'.
 *   - Direct calls to the editing API route (the handler validates JWT itself).
 *
 * Referer headers and query parameters are intentionally NOT used: both are
 * trivially forgeable by any client and would create an auth-bypass vector
 * against the gatekeeper's page-level visibility gates.
 *
 * sc_headless_mode values:
 *   'edit'    — Pages editor in editing mode
 *   'preview' — Pages editor in preview mode
 *   'normal'  — regular page browsing (do NOT bypass auth)
 */
function isSitecoreEditingRequest(req: NextRequest): boolean {
  const headlessMode = req.cookies.get('sc_headless_mode')?.value;
  return (
    !!req.cookies.get('__prerender_bypass')?.value ||
    !!req.cookies.get('__next_preview_data')?.value ||
    headlessMode === 'edit' ||
    headlessMode === 'preview' ||
    req.nextUrl.pathname.startsWith('/api/editing/')
  );
}

// Centralized function to determine if middleware should be skipped for specific routes
function skipRoutes(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (pathname === '/403') return true;
  // Array of path prefixes to skip middleware for
  const skipPrefixes = ['/auth/', '/poc/', '/.well-known', '/fonts'];
  return skipPrefixes.some((prefix) => pathname.startsWith(prefix));
}

// Function to determine if a route is public (doesn't require authentication)
// This function prevents authentication loops and ensures critical functionality remains accessible
export function isPublicRoute(pathname: string): boolean {
  // Tier 1: Exact Match Check - checks if the exact pathname matches any predefined public routes
  const publicRoutes = [
    '/auth/signin',
    '/auth/signout',
    '/auth/error',
    '/Error/403',
    '/403',
    '/Error/404',
    '/Error/500',
    '/api/auth', // NextAuth API base route
    '/healthz', // Health check endpoint
    '/_next', // Next.js internals
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/site.webmanifest', // PWA manifest
    '/sw.js', // PWA service worker
    '/icons', // PWA icons folder
  ];

  // Check exact matches
  if (publicRoutes.includes(pathname)) {
    return true;
  }

  // Tier 2: Prefix Match Check - handles routes that are public by prefix/pattern
  return (
    publicRoutes.some((route) => pathname.startsWith(route + '/')) ||
    pathname.startsWith('/Error/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/editing/') || // Sitecore editing API routes (preview mode)
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/sitecore/api/') || // Sitecore API endpoints
    pathname.startsWith('/-/') // Sitecore media library assets
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
   * 6. /fonts (Font files)
   * 7. /assets (Assets)
   * 8. /site.webmanifest, /sw.js, /icons (PWA — must be reachable unauthenticated)
   * 9. all root files inside /public
   */
  matcher: [
    '/',
    '/((?!api/|_next/|healthz|sitecore/api/|-/|fonts/|assets/|favicon.ico|poc/|ukg|site\\.webmanifest|sw\\.js|icons/).*)',
  ],
};

// export { auth as middleware } from 'auth';
