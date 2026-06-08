import type { LinkField } from "@sitecore-content-sdk/nextjs";

import {
  getOrderManagementTabLinkRaw,
  resolveOrderManagementTabCanonicalPath,
  resolveOrderManagementTabNavHref,
  resolveOrderManagementTabNavTargetPath,
} from "@/lib/orderManagementUtils";

export const ORDER_MANAGEMENT_SEARCH_PARAMS_SYNC_EVENT = "order-management-search-params-sync";

/** @deprecated Pathname sync is handled by Next.js `usePathname()` after navigation. */
export const ORDER_MANAGEMENT_PATHNAME_SYNC_EVENT = "order-management-pathname-sync";

/**
 * Updates the address bar immediately on tab click. Tab content and data fetching
 * should follow {@link usePathname} / route transition, not this URL alone.
 */
export function syncOrderManagementBrowserUrl(href: string): void {
  if (typeof window === "undefined") return;
  const nextUrl = `${href}${window.location.search}${window.location.hash}`;
  window.history.pushState(window.history.state, "", nextUrl);
}

export function resolveOrderManagementTabNavHrefForTab(
  currentPathname: string,
  tabUrl: LinkField | undefined
): string | undefined {
  const raw = getOrderManagementTabLinkRaw(tabUrl);
  const canonical = resolveOrderManagementTabCanonicalPath(raw);
  const target = resolveOrderManagementTabNavTargetPath(raw, canonical);
  if (!target) return undefined;
  return resolveOrderManagementTabNavHref(currentPathname, target);
}
