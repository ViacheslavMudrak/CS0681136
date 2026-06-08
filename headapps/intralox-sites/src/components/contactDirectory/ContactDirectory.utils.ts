import { normalizeAppPathname } from "components/navigation/navigationUtils";
import type { IContactDirectoryCountryFields } from "./ContactDirectory.type";

const BASE_PATH = "support/phone-numbers";

export function toKebabPathSegment(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * URL segment for routes like `/support/phone-numbers/{segment}`.
 * Uses the last path segment of `CountryLink.path` when present, otherwise the country display name.
 */
export function getPathSlugForCountry(
  country: IContactDirectoryCountryFields,
): string {
  const path = country.CountryLink?.path?.trim();
  if (path) {
    const last = path.split("/").filter(Boolean).pop();
    if (last) {
      return last.toLowerCase();
    }
  }
  return toKebabPathSegment(country?.Country?.data?.Name ?? "");
}

/**
 * True when the URL slug matches the CMS path slug or the 2-letter country code
 * (e.g. geo middleware redirects using {@link getGeoPathSegmentForCountryCode} from `lib/geoCountryPathSegment`).
 */
export function countryMatchesPathSlug(
  country: IContactDirectoryCountryFields,
  slug: string | undefined,
): boolean {
  if (slug == null || slug === "") {
    return false;
  }
  const normalized = slug.toLowerCase();
  if (getPathSlugForCountry(country) === normalized) {
    return true;
  }
  const code = country?.Country?.data?.Code?.value?.trim().toLowerCase();
  return code != null && code.length === 2 && code === normalized;
}

/**
 * ISO country code (from `Country.data.Code`) → path slug, from the current GraphQL `Countries` list.
 * Useful for lookups, analytics, or other code that needs a map; routing uses {@link getPathSlugForCountry}.
 */
export function buildCountryCodeToPathSlugMap(
  countries: IContactDirectoryCountryFields[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const c of countries) {
    const code = c?.Country?.data?.Code?.value?.trim();
    if (!code) {
      continue;
    }
    out[code] = getPathSlugForCountry(c);
  }
  return out;
}

export function getCountrySlugFromPathname(
  pathname: string,
): string | undefined {
  const norm = normalizeAppPathname(pathname);
  const esc = BASE_PATH.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(
    /\//g,
    "\\/",
  );
  const m = new RegExp(`\\/${esc}\\/([^/]+)(?:/|$)`).exec(norm);
  return m?.[1]?.toLowerCase();
}

export function hrefForCountryName(countryNameSegment: string): string {
  return `/${BASE_PATH}/${countryNameSegment}`;
}

/**
 * Renders auth names that use kebab case (e.g. `united-states`) as space-separated
 * `united states` for the UI. CMS values without hyphens are unchanged.
 */
export function formatCountryLabelForDisplay(name: string): string {
  return name.trim().replace(/-/g, " ");
}

//strips whitespace out of phone numbers on the phone-numbers page. used for 'tel:' link.
export function stripWhiteSpace(string: string): string {
  return string.replace(/\s+/g, "-");
}
