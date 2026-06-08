/**
 * Build kebab path segments for `/support/phone-numbers/{segment}` from a geo
 * two-letter country/region code (Vercel `x-vercel-ip-country`, Cloudflare `cf-ipcountry`).
 * Uses English region display names; falls back to lowercase ISO on invalid codes.
 */
function toKebabPathSegment(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getGeoPathSegmentForCountryCode(iso: string): string {
  const code = iso.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) {
    return toKebabPathSegment(iso);
  }
  try {
    const name = new Intl.DisplayNames(["en"], { type: "region" }).of(code);
    if (name) {
      return toKebabPathSegment(name);
    }
  } catch {
    // Invalid or non-geographic M49 codes not supported in all runtimes
  }
  return code.toLowerCase();
}
