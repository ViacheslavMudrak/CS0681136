import { hasLocale } from "next-intl";
import { routing } from "src/i18n/routing";



/**
 * Returns the path to navigate to so the URL matches the preferred locale, or null if no change needed.
 * Use when profile has loaded and the current path has no locale, wrong locale, or old locale.
 *
 * @param pathname - Current pathname (e.g. "/" or "/about")
 * @param preferredLocale - Preferred language from profile (must be valid per routing.locales)
 * @returns Path to redirect to (e.g. "/fr" or "/fr/about"), or null if URL is already correct
 */
export function getPreferredLocalePath(
  pathname: string,
  preferredLocale: string
): string | null {
  const locale = preferredLocale?.trim()?.toLowerCase();
  if (!locale || !hasLocale(routing.locales, locale)) return null;

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase() ?? "";
  const hasPathLocale = hasLocale(routing.locales, firstSegment);

  if (hasPathLocale && firstSegment === locale) return null;

  const pathWithoutLocale = getPathWithoutLocale(pathname);
  return pathWithoutLocale === "/" ? `/${locale}` : `/${locale}${pathWithoutLocale}`;
}

/**
 * Returns the path with the leading locale segment removed, for comparison without locale.
 * E.g. "/fr/about" -> "/about", "/en/dashboard" -> "/dashboard", "/about" -> "/about".
 *
 * @param pathname - Full pathname (may include locale prefix)
 * @returns Path without the leading locale segment
 */
export function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0]?.toLowerCase();
  if (first && hasLocale(routing.locales, first)) {
    segments.shift();
  }
  return segments.length > 0 ? `/${segments.join("/")}` : "/";
}
