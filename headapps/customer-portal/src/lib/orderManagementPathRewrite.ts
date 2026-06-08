/**
 * Pure path helpers for Order Management URLs (Edge/middleware safe — no CSS/component imports).
 * Sitecore layout resolution expects canonical casing: /orders-management/invoices, etc.
 */

const OM_FOLDER = "orders-management";

const TAB_SEGMENT_CANONICAL: Record<string, string> = {
  orders: "orders",
  order: "orders",
  shipments: "shipments",
  shipment: "shipments",
  invoices: "invoices",
  invoice: "invoices",
  quotes: "quotes",
  quote: "quotes",
};

/**
 * If `pathname` contains `orders-management` (any case), rewrite folder + first tab segment to
 * Sitecore-canonical casing. Preserves prefix (site / locale) and any path after the first segment.
 */
export function normalizeOrderManagementPathnameForSitecore(pathname: string): string {
  const trimmed = pathname.trim().replace(/\/$/, "") || "/";
  const lower = trimmed.toLowerCase();
  const needle = "/orders-management/";
  const idx = lower.indexOf(needle);

  if (idx === -1) {
    const endMarker = "/orders-management";
    if (lower.endsWith(endMarker)) {
      const at = lower.length - endMarker.length;
      if (at === 0 || lower.charAt(at - 1) === "/") {
        return `${trimmed.slice(0, at)}/${OM_FOLDER}`;
      }
    }
    return trimmed;
  }

  const prefix = trimmed.slice(0, idx);
  const afterOm = trimmed.slice(idx + needle.length);
  if (!afterOm) {
    return `${prefix}/${OM_FOLDER}`;
  }

  const slashIdx = afterOm.indexOf("/");
  const firstSeg = slashIdx === -1 ? afterOm : afterOm.slice(0, slashIdx);
  const rest = slashIdx === -1 ? "" : afterOm.slice(slashIdx);
  const canon = TAB_SEGMENT_CANONICAL[firstSeg.toLowerCase()];
  const tabPart = canon ?? firstSeg;
  return `${prefix}/${OM_FOLDER}/${tabPart}${rest}`;
}

/**
 * Normalizes `[[...path]]` segments for Sitecore `getPage` (same rules as {@link normalizeOrderManagementPathnameForSitecore}).
 */
export function normalizeOrderManagementPathSegments(segments: string[]): string[] {
  if (!segments.length) return segments;
  const normalizedPath = normalizeOrderManagementPathnameForSitecore(`/${segments.join("/")}`);
  const trimmed = normalizedPath.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!trimmed) return [];
  return trimmed.split("/").filter(Boolean);
}
