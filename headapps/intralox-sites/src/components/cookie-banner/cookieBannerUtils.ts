import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';

import type { CookieBannerDatasource, CookieBannerFields } from './CookieBanner.type';

/** Empty-state hint shown to authors when the datasource has no usable fields. */
export const COOKIE_BANNER_EMPTY_HINT = 'Cookie Banner';

export const COOKIE_BANNER_STORAGE_KEY = 'intralox-cookie-banner-consent';

export const COOKIE_BANNER_CONSENT_COOKIE_NAME = 'intralox_cookie_banner_consent';

export const COOKIE_BANNER_CONSENT_MAX_AGE_SEC = 60 * 60 * 24 * 365;

export const COOKIE_BANNER_SCROLL_DISMISS_THRESHOLD_PX = 48;

export function getCookieBannerPageScrollY(): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  const scrollingElement = document.scrollingElement ?? document.documentElement;
  return Math.max(
    window.scrollY ?? 0,
    scrollingElement.scrollTop ?? 0,
    document.documentElement.scrollTop ?? 0,
    document.body.scrollTop ?? 0,
  );
}

export function hasCookieBannerScrolledEnoughForConsent(
  baselineScrollY: number,
  currentScrollY?: number,
): boolean {
  const current = currentScrollY ?? getCookieBannerPageScrollY();
  return (
    Math.abs(current - baselineScrollY) >= COOKIE_BANNER_SCROLL_DISMISS_THRESHOLD_PX
  );
}

export const COOKIE_BANNER_REGION_ARIA_FALLBACK = 'Cookie consent';

export const COOKIE_BANNER_CTA_ARIA_FALLBACK = 'Cookie consent action';

export const COOKIE_BANNER_EMPTY_RICH_TEXT = { value: '' } as Field<string>;

export const COOKIE_BANNER_EMPTY_LINK = {
  value: { href: '', text: '' },
} as LinkField;

/**
 * Parses `document.cookie` and returns whether the consent dismissal cookie is set.
 *
 * @param documentCookie - Browser `document.cookie` string (tests may pass synthetic values).
 * @returns True when the consent cookie equals `1`.
 */
export function isCookieBannerConsentGranted(documentCookie: string): boolean {
  if (!documentCookie) {
    return false;
  }
  const segments = documentCookie.split(';');
  for (const segment of segments) {
    const trimmed = segment.trim();
    const eq = trimmed.indexOf('=');
    if (eq < 0) {
      continue;
    }
    const name = trimmed.slice(0, eq).trim();
    if (name !== COOKIE_BANNER_CONSENT_COOKIE_NAME) {
      continue;
    }
    const value = trimmed.slice(eq + 1).trim();
    return value === '1';
  }
  return false;
}

export function readCookieBannerDismissedFromBrowser(isEditing: boolean): boolean {
  if (isEditing || typeof document === 'undefined') {
    return false;
  }
  return isCookieBannerConsentGranted(document.cookie);
}

export function formatCookieBannerConsentDocumentCookie(isSecure: boolean): string {
  const base = `${COOKIE_BANNER_CONSENT_COOKIE_NAME}=1; Path=/; Max-Age=${COOKIE_BANNER_CONSENT_MAX_AGE_SEC}; SameSite=Lax`;
  return isSecure ? `${base}; Secure` : base;
}

/**
 * Derives an accessible name for the dismiss CTA from the Sitecore link field.
 *
 * @param field - General link field (text / title from Sitecore).
 * @param fallback - Used when both link text and title are empty.
 * @returns A non-empty string suitable for `aria-label` on the CTA `Link`.
 */
export function getCookieBannerCtaAriaLabel(
  field: LinkField | undefined,
  fallback: string,
): string {
  const text = field?.value?.text?.trim();
  if (text) {
    return text;
  }
  const title = field?.value?.title?.trim();
  if (title) {
    return title;
  }
  return fallback;
}

/**
 * Detects whether a rich text string contains visible characters after stripping markup.
 *
 * @param html - Raw rich text value from Sitecore.
 * @returns True when stripping tags and whitespace still leaves visible characters.
 */
export function hasMeaningfulRichTextValue(html: string | undefined | null): boolean {
  if (html == null || html === '') {
    return false;
  }
  const stripped = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return stripped.length > 0;
}

/**
 * Decides whether the banner body region should render for the current mode.
 *
 * @param field - Sitecore rich text field.
 * @param isEditing - When true, treat empty values as meaningful so authors can edit.
 * @returns Whether the banner body should reserve layout space.
 */
export function shouldRenderBannerText(
  field: Field<string> | undefined,
  isEditing: boolean,
): boolean {
  if (isEditing) {
    return true;
  }
  return hasMeaningfulRichTextValue(field?.value);
}

/**
 * Decides whether the consent CTA should render for the current mode.
 *
 * @param field - Sitecore general link field used as the continue CTA.
 * @param isEditing - When true, always render so authors can configure the link.
 * @returns Whether the CTA affordance should render for the current mode.
 */
export function shouldRenderButtonLink(
  field: LinkField | undefined,
  isEditing: boolean,
): boolean {
  if (isEditing) {
    return true;
  }
  const href = field?.value?.href;
  const text = field?.value?.text;
  const hasHref = typeof href === 'string' && href.trim() !== '';
  const hasText = typeof text === 'string' && text.trim() !== '';
  return hasHref || hasText;
}

export function resolveBannerTextField(
  fields: CookieBannerFields | null | undefined,
): Field<string> | undefined {
  if (!fields) {
    return undefined;
  }
  const flat = fields.BannerText;
  const ds = fields.data?.datasource as CookieBannerDatasource | undefined;
  const fromGraphql =
    ds?.bannerText?.jsonValue ?? ds?.BannerText?.jsonValue ?? undefined;
  return flat ?? fromGraphql;
}

/**
 * Normalizes the CTA link field from flat layout fields or GraphQL datasource shape.
 *
 * @param fields - Raw fields object from layout service or GraphQL.
 * @returns Normalized link field for the continue / dismiss control (`Link` or `ButtonTextWithLink`, then GraphQL).
 */
export function resolveButtonLinkField(
  fields: CookieBannerFields | null | undefined,
): LinkField | undefined {
  if (!fields) {
    return undefined;
  }
  const flat = fields.Link ?? fields.ButtonTextWithLink;
  const ds = fields.data?.datasource as CookieBannerDatasource | undefined;
  const fromGraphql =
    ds?.link?.jsonValue ??
    ds?.Link?.jsonValue ??
    ds?.buttonTextWithLink?.jsonValue ??
    ds?.ButtonTextWithLink?.jsonValue ??
    undefined;
  return flat ?? fromGraphql;
}

/**
 * Returns true when either the banner copy or CTA should render for visitors or authoring.
 *
 * @param fields - Cookie banner fields from Sitecore.
 * @param isEditing - Experience Editor / Pages mode flag.
 * @returns True when at least one visitor-visible slice exists, or authoring requires chrome.
 */
export function hasAnyCookieBannerContent(
  fields: CookieBannerFields | null | undefined,
  isEditing: boolean,
): boolean {
  const banner = resolveBannerTextField(fields);
  const button = resolveButtonLinkField(fields);
  return (
    shouldRenderBannerText(banner, isEditing) || shouldRenderButtonLink(button, isEditing)
  );
}
