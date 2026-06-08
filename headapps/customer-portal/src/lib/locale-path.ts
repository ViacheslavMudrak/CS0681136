import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import { getPathWithoutLocale } from "@/lib/locale-cookie";

/**
 * Reads the active locale from the first path segment when it matches a configured locale.
 * Otherwise returns the app default locale (e.g. URL has no prefix with `localePrefix: "as-needed"`).
 */
export function getLocaleFromPathname(pathname: string): string {
  const first = pathname.split("/").filter(Boolean)[0]?.toLowerCase() ?? "";
  if (first && hasLocale(routing.locales, first)) {
    return first;
  }
  return routing.defaultLocale;
}

/**
 * Builds an internal pathname with the correct locale prefix for {@link routing}
 * (`localePrefix: "as-needed"` → no prefix for {@link routing.defaultLocale}).
 *
 * @param pathnameOnly - Path starting with `/` (may already include a locale segment; it is normalized away first)
 */
export function buildLocalizedPathname(pathnameOnly: string, locale: string): string {
  const loc = locale?.trim().toLowerCase();
  const normalized = pathnameOnly.startsWith("/") ? pathnameOnly : `/${pathnameOnly}`;
  const logicalPath = getPathWithoutLocale(normalized);

  if (!loc || !hasLocale(routing.locales, loc)) {
    return logicalPath;
  }

  return logicalPath === "/" ? `/${loc}` : `/${loc}${logicalPath}`;
}

const RELATIVE_HREF_RE = /^([^?#]*)(\?[^#]*)?(#.*)?$/;

/**
 * Prefixes same-origin and relative app links with the active locale.
 * Leaves external `http(s)` URLs (other origins), `mailto:`, `tel:`, `javascript:`, and bare `#hash` unchanged.
 *
 * Use for CMS-authored hrefs that omit the locale segment (common with Sitecore General Link).
 */
export function localizeHref(href: string, locale: string): string {
  const trimmed = href.trim();
  if (!trimmed) return href;
  if (trimmed.startsWith("#")) return href;

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:") ||
    lower.startsWith("javascript:")
  ) {
    return href;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (typeof window !== "undefined" && url.origin !== window.location.origin) {
        return href;
      }
      const localized = buildLocalizedPathname(url.pathname, locale);
      return `${url.origin}${localized}${url.search}${url.hash}`;
    } catch {
      return href;
    }
  }

  const m = trimmed.match(RELATIVE_HREF_RE);
  if (!m) return href;

  const pathPart = m[1] === "" ? "/" : m[1];
  const search = m[2] ?? "";
  const hash = m[3] ?? "";

  if (pathPart.startsWith("//")) {
    return href;
  }

  const localized = buildLocalizedPathname(pathPart, locale);
  return `${localized}${search}${hash}`;
}
