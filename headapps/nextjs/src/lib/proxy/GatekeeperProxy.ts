import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ProxyBase, ProxyBaseConfig } from '@sitecore-content-sdk/nextjs/proxy';
import type { GoogleGroupData } from '../../ts/google';
import {
  getPagePermissions,
  type AncestorItem,
  type VisibilitySettings,
} from '../auth/page-security-service';
import { isPublicRoute } from 'src/proxy';
import { TEMPLATE_ID_CONSTANTS, hasBaseTemplate } from 'src/constants/template-ids';
import { log } from 'src/util/helpers/log-helper';

export type GatekeeperProxyConfig = ProxyBaseConfig;

/**
 * Proxy for page-level security (Gatekeeper)
 * Handles authentication and authorization checks for protected routes
 */
export class GatekeeperProxy extends ProxyBase {
  constructor(config: GatekeeperProxyConfig) {
    super(config);
  }

  private static readonly COMPONENT = 'GatekeeperProxy';

  /**
   * Handle the proxy logic for page-level and site-level security
   */
  handle = async (req: NextRequest, res: NextResponse): Promise<NextResponse> => {
    const pathname = req.nextUrl.pathname;
    const decodedPath = decodeURIComponent(pathname);
    // Check if Proxy should be skipped
    if (this.disabled(req, res)) {
      return res;
    }

    // Skip gatekeeper for public routes. Editing-mode requests are filtered
    // out by the orchestrator (proxy.ts) before this handler runs.
    if (isPublicRoute(pathname)) {
      return res;
    }

    const securityData = await getPagePermissions(decodedPath);

    if (!securityData) {
      log('CRITICAL', GatekeeperProxy.COMPONENT, 'Security API failed. Blocking access.', {
        path: decodedPath,
        action: 'block',
        reason: 'security_api_failure',
      });
      return this.rewriteToError(req, res, '/500');
    }

    const requireLoginGlobally = process.env.FORCE_AUTH === 'true';

    // Resolve authentication and user groups.
    // Mock users use a JWT cookie (next-auth.mock-token) that getToken() can read.
    // Real Google users use database sessions, so getToken() returns null —
    // fall back to fetching the session via the internal NextAuth API.
    const { isAuthenticated, userGroups, userEmail } = await this.resolveAuth(req);
    const isUnauthenticated = !isAuthenticated;

    log(
      'INFO',
      GatekeeperProxy.COMPONENT,
      'GatekeeperProxy: User groups',
      securityData?.siteRoot?.item?.site?.visibleBy,
      true
    );
    // ── Site-level gating (_SiteSecuritySettings "visibleBy" field) ──
    const siteGateResult = this.checkGroupAccess({
      groups: securityData?.siteRoot?.item?.site?.visibleBy?.targetItems,
      allowAccessRequests: securityData?.siteRoot?.item?.site?.allowAccessRequests?.value,
      userGroups,
      isUnauthenticated,
    });

    if (siteGateResult.denied) {
      log('WARNING', GatekeeperProxy.COMPONENT, 'Site-level access denied.', {
        path: decodedPath,
        action: 'deny',
        reason: siteGateResult.reason,
        requestAccessEnabled: siteGateResult.showRequestButton,
      });
      if (isUnauthenticated) {
        return this.buildSigninRedirect(req);
      }
      return this.build403Redirect(req, siteGateResult.showRequestButton, userEmail);
    }

    // ── Ancestor-level gating (inherited from parent pages) ──
    // Walk ancestors from closest to farthest; if any ancestor has visibleBy configured,
    // the current page inherits that restriction. This allows gating an entire section
    // (e.g., /Ministry-Home) so all child pages are also restricted.
    // Only check ancestors whose template inherits from _AscensionSite to skip non-site items.
    const ancestors = securityData?.page?.item?.ancestors || [];
    // Ancestors are ordered root -> leaf; reverse to check closest parent first.
    const reversedAncestors = [...ancestors].reverse();

    for (const ancestor of reversedAncestors) {
      if (!this.isAscensionSitePage(ancestor)) {
        continue;
      }

      const ancestorGateResult = this.checkGroupAccess({
        groups: ancestor.visibleBy?.targetItems,
        allowAccessRequests: ancestor.allowAccessRequests?.value,
        userGroups,
        isUnauthenticated,
      });

      if (ancestorGateResult.denied) {
        log('WARNING', GatekeeperProxy.COMPONENT, 'Ancestor-level access denied.', {
          path: decodedPath,
          action: 'deny',
          reason: ancestorGateResult.reason,
          gatedAncestor: ancestor.name,
          requestAccessEnabled: ancestorGateResult.showRequestButton,
        });
        if (isUnauthenticated) {
          return this.buildSigninRedirect(req);
        }
        return this.build403Redirect(req, ancestorGateResult.showRequestButton, userEmail);
      }
    }

    // ── Page-level gating (page "visibleBy" field) ──
    const pageGroups = securityData?.page?.item?.visibleBy?.targetItems;
    const hasPageGroups = pageGroups && pageGroups.length > 0;

    if (!hasPageGroups) {
      if (!requireLoginGlobally) {
        return res;
      }

      if (isUnauthenticated) {
        log(
          'WARNING',
          GatekeeperProxy.COMPONENT,
          'Global login required. Unauthenticated request denied.',
          {
            path: decodedPath,
            action: 'deny',
            reason: 'global_login_required',
          }
        );
        return this.buildSigninRedirect(req);
      }

      return res;
    }

    const pageGateResult = this.checkGroupAccess({
      groups: pageGroups,
      allowAccessRequests: securityData?.page?.item?.allowAccessRequests?.value,
      userGroups,
      isUnauthenticated,
    });

    if (pageGateResult.denied) {
      log('WARNING', GatekeeperProxy.COMPONENT, 'Page-level access denied.', {
        path: decodedPath,
        action: 'deny',
        reason: pageGateResult.reason,
        requestAccessEnabled: pageGateResult.showRequestButton,
      });
      if (isUnauthenticated) {
        return this.buildSigninRedirect(req);
      }
      return this.build403Redirect(req, pageGateResult.showRequestButton, userEmail);
    }

    return res;
  };

  /**
   * Extract enabled emails from a VisibilitySettings list and check if the user
   * belongs to any of them. Used by site-level, ancestor-level, and page-level gating.
   */
  private checkGroupAccess({
    groups,
    allowAccessRequests,
    userGroups,
    isUnauthenticated,
  }: {
    groups?: VisibilitySettings[];
    allowAccessRequests?: string;
    userGroups: string[];
    isUnauthenticated: boolean;
  }): { denied: boolean; showRequestButton: boolean; reason: string } {
    const items = groups || [];
    if (items.length === 0) {
      return { denied: false, showRequestButton: false, reason: '' };
    }

    if (isUnauthenticated) {
      return { denied: true, showRequestButton: false, reason: 'unauthenticated' };
    }

    const allowedEmails = items
      .filter((item) => item.disableGroup?.value !== '1')
      .map((item) => item.email?.value?.toLowerCase().trim())
      .filter((e): e is string => Boolean(e));

    if (allowedEmails.length === 0) {
      return { denied: true, showRequestButton: false, reason: 'empty_allow_list' };
    }

    const allowedSet = new Set(allowedEmails);
    const hasAccess = userGroups.some((g) => allowedSet.has(g));

    if (!hasAccess) {
      const showRequestButton = allowAccessRequests === '1';
      return { denied: true, showRequestButton, reason: 'insufficient_group_membership' };
    }

    return { denied: false, showRequestButton: false, reason: '' };
  }

  /**
   * Check if an ancestor item's template inherits from _AscensionSite.
   * Uses GUID comparison to protect against template renaming.
   * Only these ancestors should be evaluated for gating; non-site items are skipped.
   */
  private isAscensionSitePage(ancestor: AncestorItem): boolean {
    return hasBaseTemplate(ancestor.template?.baseTemplates, TEMPLATE_ID_CONSTANTS.ASCENSION_SITE);
  }

  /**
   * Resolve authentication and Google Group memberships.
   *
   * The `next-auth.mock-token` JWT cookie is intentionally NOT consulted here.
   * That cookie outlives a mock sign-out (NextAuth only clears the standard
   * session-token), so reading it would attribute a prior mock user's groups
   * to whoever currently holds the browser — including a real Google account
   * signed in afterwards. Mock users still authorize correctly because the
   * NextAuth session callback enriches their session with mock groups before
   * /api/auth/session returns.
   *
   * If the standard cookie holds a JWT (JWT session strategy), use it.
   * Otherwise fall through to the internal /api/auth/session lookup, which
   * works for both mock and real Google users.
   */
  private async resolveAuth(
    req: NextRequest
  ): Promise<{ isAuthenticated: boolean; userGroups: string[]; userEmail: string }> {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (token) {
      const rawGroups = (token.googleGroups as unknown as GoogleGroupData[]) || [];
      const userGroups = rawGroups
        .map((g) => g.email?.toLowerCase().trim())
        .filter((e): e is string => Boolean(e));
      const userEmail = (token.email as string | undefined)?.toLowerCase().trim() ?? '';
      return { isAuthenticated: true, userGroups, userEmail };
    }

    /**
     * Database session resolution — fetch session via internal API.
     *
     * In a Kubernetes deployment, the pod often cannot reach itself through the
     * external hostname (DNS hairpin is not routed inside the cluster). Use
     * NEXTAUTH_URL_INTERNAL when set so the Proxy hits the local process
     * directly; fall back to the request origin for local development.
     */

    // Short-circuit: if no session cookie exists there is nothing to resolve.
    // This eliminates one network hop for definitively-unauthenticated requests
    // and avoids treating a missing cookie identically to a failed fetch.
    const useSecureCookies = req.url.startsWith('https://');
    const sessionCookieName = useSecureCookies
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token';
    const hasSessionCookie = !!req.cookies.get(sessionCookieName)?.value;

    if (!hasSessionCookie) {
      return { isAuthenticated: false, userGroups: [], userEmail: '' };
    }

    try {
      const origin = process.env.NEXTAUTH_URL_INTERNAL || req.nextUrl.origin;
      const cookie = req.headers.get('cookie') || '';

      const sessionRes = await fetch(`${origin}/api/auth/session`, {
        headers: { cookie },
      });

      if (!sessionRes.ok) {
        return { isAuthenticated: false, userGroups: [], userEmail: '' };
      }

      const session = await sessionRes.json();
      const email = session?.user?.email;

      if (!email) {
        return { isAuthenticated: false, userGroups: [], userEmail: '' };
      }

      // googleGroups is populated by the session callback — fetchGroupsForUser()
      // for real Google users, enrichSessionWithMockData() for mock users.
      const groups = (session.googleGroups as GoogleGroupData[]) || [];
      const userGroups = groups
        .map((g) => g.email?.toLowerCase().trim())
        .filter((e): e is string => Boolean(e));

      return { isAuthenticated: true, userGroups, userEmail: email };
    } catch (error) {
      log('ERROR', GatekeeperProxy.COMPONENT, 'Failed to resolve session from internal API.', {
        error: String(error),
      });
      // Fail closed: a session fetch error cannot be distinguished from an
      // invalid/forged cookie, so treat the request as unauthenticated and let
      // the normal sign-in redirect handle it. This prevents FORCE_AUTH bypass
      // during transient failures.
      log(
        'WARNING',
        GatekeeperProxy.COMPONENT,
        'Session fetch failed; treating as unauthenticated.',
        { path: req.nextUrl.pathname }
      );
      return { isAuthenticated: false, userGroups: [], userEmail: '' };
    }
  }

  /**
   * Send unauthenticated visitors to the sign-in page so they can attempt to
   * gain access, instead of dead-ending them on /403. After signing in, the
   * gatekeeper re-evaluates and either allows the request or returns a real
   * 403 with proper context (request-access button, user email, etc.).
   *
   * Mirrors the silent-auth redirect in proxy.ts so the two gates behave
   * consistently.
   */
  private buildSigninRedirect(req: NextRequest): NextResponse {
    const callbackUrl = decodeURIComponent(req.nextUrl.pathname) + req.nextUrl.search;
    const signinUrl = new URL('/auth/signin', req.url);
    signinUrl.searchParams.set('silent', 'true');
    signinUrl.searchParams.set('callbackUrl', callbackUrl);
    return NextResponse.redirect(signinUrl);
  }

  /**
   * Helper to build 403 redirect without causing redirect loops
   */
  private build403Redirect(
    req: NextRequest,
    requestAccess: boolean,
    userEmail: string
  ): NextResponse {
    const currentPath = decodeURIComponent(req.nextUrl.pathname);

    if (currentPath.startsWith('/Error/') || currentPath === '/403') {
      return NextResponse.next();
    }

    const url = req.nextUrl.clone();
    url.pathname = '/403';

    // Pass data via request headers (not query params) so users cannot tamper with them.
    // getServerSideProps reads these from context.req.headers.
    const headers = new Headers(req.headers);
    headers.set('x-gk-request-access', requestAccess ? '1' : '0');
    headers.set('x-gk-return-url', currentPath);
    headers.set('x-gk-user-email', userEmail);

    return NextResponse.rewrite(url, { request: { headers } });
  }

  /**
   * Helper to rewrite to an error page
   */
  private rewriteToError(req: NextRequest, _res: NextResponse, errorPath: string): NextResponse {
    return NextResponse.rewrite(new URL(errorPath, req.url));
  }
}
