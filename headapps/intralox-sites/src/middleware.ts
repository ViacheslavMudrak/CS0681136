import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
import { getGeoPathSegmentForCountryCode } from 'lib/geoCountryPathSegment';
import {
  defineMiddleware,
  AppRouterMultisiteMiddleware,
  PersonalizeMiddleware,
  RedirectsMiddleware,
  LocaleMiddleware,
} from '@sitecore-content-sdk/nextjs/middleware';
import allSites from '.sitecore/sites.json';
import scConfig from 'sitecore.config';
import { routing } from './i18n/routing';

const DEFAULT_SITE_NAME = process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME;

/**
 * Filter the sites list to only the site matching NEXT_PUBLIC_DEFAULT_SITE_NAME.
 * Falls back to the full list when the variable is not set.
 */
const sites = DEFAULT_SITE_NAME
  ? allSites.filter((site) => site.name === DEFAULT_SITE_NAME)
  : allSites;

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
  skip: () => false,
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
  skip: () => false,
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
  skip: () => false,
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
  skip: () => false,
});

const PHONE_NUMBERS_BASE = '/support/phone-numbers';

/**
 * If the user opens `/…/support/phone-numbers` without a country segment, redirect
 * to `/…/support/phone-numbers/{kebab-country-name}` from geo IP (Vercel / Cloudflare)
 * and set a short-lived `user-country` cookie (ISO-3166 alpha-2).
 */
function redirectPhoneNumbersWithGeoCountry(
  request: NextRequest
): NextResponse | undefined {
  const url = request.nextUrl.clone();
  const trimmed = (url.pathname || '/').replace(/\/+$/, '') || '/';
  if (!trimmed.endsWith(PHONE_NUMBERS_BASE)) {
    return undefined;
  }
  const countryRaw =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    'US';
  const country = /^[A-Za-z]{2}$/.test(countryRaw.trim())
    ? countryRaw.trim().toUpperCase()
    : 'US';
  const segment = getGeoPathSegmentForCountryCode(country);
  url.pathname = `${trimmed}/${segment}`;
  const response = NextResponse.redirect(url);
  response.cookies.set('user-country', country, {
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  return response;
}

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  const phoneRedirect = redirectPhoneNumbersWithGeoCountry(req);
  if (phoneRedirect) {
    return phoneRedirect;
  }
  return defineMiddleware(locale, multisite, redirects, personalize).exec(req, ev);
}

export const config = {
  /*
   * Match all paths except for:
   * 1. API route handlers
   * 2. /_next (Next.js internals)
   * 3. /sitecore/api (Sitecore API routes)
   * 4. /- (Sitecore media)
   * 5. /healthz (Health check)
   * 7. all root files inside /public
   */
  matcher: [
    '/',
    '/((?!api/|sitemap|robots|_next/|healthz|sitecore/api/|-/|favicon.ico|sc_logo.svg).*)',
  ],
};
