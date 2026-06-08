/**
 * Sitecore headless route resolution encodes wildcard items (`*` in the tree) as the path segment
 * `,-w-,`. Passing a raw numeric (or GUID) segment makes Edge look for a real child item instead of
 * the wildcard page — see https://visionsincode.com/2024/08/01/simplify-sitecore-xm-cloud-wildcard-pages-with-dynamic-next-js-detection/
 */

import { normalizeOrderManagementPathSegments } from "@/lib/orderManagementPathRewrite";

const IDENTIFIER_REGEX =
  /^([0-9a-fA-F]{8,}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12})|([0-9a-fA-F]{8,})|([0-9]+(?:_[0-9a-fA-F]{8,}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12})?)|([0-9]+(?:_[0-9]+)?)$/;

export function containsUrlSegmentIdentifier(segment: string): boolean {
  return IDENTIFIER_REGEX.test(segment);
}

/**
 * When the resolved path is …/orders/&lt;id&gt; (after {@link normalizeOrderManagementPathSegments}),
 * replace the id segment with Sitecore's wildcard segment so layout resolves the `*` item.
 */
export function applyOrdersManagementOrderWildcard(sitecorePathSegments: string[]): string[] {
  if (sitecorePathSegments.length < 2) return sitecorePathSegments;
  const parent = sitecorePathSegments[sitecorePathSegments.length - 2];
  const last = sitecorePathSegments[sitecorePathSegments.length - 1];
  if (parent !== "orders" || !containsUrlSegmentIdentifier(last)) {
    return sitecorePathSegments;
  }
  return [...sitecorePathSegments.slice(0, -1), ",-w-,"];
}

/**
 * When the resolved path is …/quotes/&lt;id&gt; (after {@link normalizeOrderManagementPathSegments}),
 * replace the id segment with Sitecore's wildcard segment so layout resolves the `*` item.
 */
export function applyOrdersManagementQuoteWildcard(sitecorePathSegments: string[]): string[] {
  if (sitecorePathSegments.length < 2) return sitecorePathSegments;
  const parent = sitecorePathSegments[sitecorePathSegments.length - 2];
  const last = sitecorePathSegments[sitecorePathSegments.length - 1];
  if (parent !== "quotes" || !containsUrlSegmentIdentifier(last)) {
    return sitecorePathSegments;
  }
  return [...sitecorePathSegments.slice(0, -1), ",-w-,"];
}

/** URL `[[...path]]` segments → path for `getPage` / preview (OM casing + order + quote wildcards). */
export function resolveSitecoreGetPageSegments(path: string[] | undefined): string[] {
  const mapped = path?.map((segment) => (segment === "reset-password" ? "reset" : segment)) ?? [];
  const normalized = normalizeOrderManagementPathSegments(mapped);
  return applyOrdersManagementQuoteWildcard(applyOrdersManagementOrderWildcard(normalized));
}
