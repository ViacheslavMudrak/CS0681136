/**
 * Client-safe pathname check aligned with {@link isOrderManagementLayoutRoute} itemPath rules.
 * Used so route-level permission gates do not block Order Management (tab/component permissions apply instead).
 */
export function isOrderManagementPathname(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return /\/orders-management(\/|$)/i.test(pathname);
}
