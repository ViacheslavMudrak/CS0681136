/** Allowed values for analytics `entry_point`. */
export type OrderDetailEntryPoint =
  | "Orders_Listing"
  | "Shipments_Listing"
  | "Invoices_Listing"
  | "Direct_URL";

const SESSION_KEY = "cp_order_detail_entry_point";

const ALLOWED = new Set<string>([
  "Orders_Listing",
  "Shipments_Listing",
  "Invoices_Listing",
  "Direct_URL",
]);

/** Path without locale: `/orders-management/orders/:id` (digits). */
export const ORDER_DETAIL_PATH_REGEX = /^\/orders-management\/orders\/(\d+)$/;

/**
 * True when `[[...path]]` segments are …/orders-management/orders/&lt;numeric id&gt; (order detail route).
 * Used for metadata; browser URL uses header id, not the display order number from API.
 */
export function isOrdersManagementOrderDetailPathSegments(path: string[] | undefined): boolean {
  if (!path || path.length < 3) return false;
  const folder = path[0]?.toLowerCase() ?? "";
  const tab = path[path.length - 2]?.toLowerCase() ?? "";
  const id = path[path.length - 1] ?? "";
  if (folder !== "orders-management" || tab !== "orders") return false;
  return /^\d+$/.test(id);
}

/** Peek only; removal happens in {@link scheduleOrderDetailEntryPointSessionCleanup}. */
function peekEntryPointFromSession(): OrderDetailEntryPoint | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)?.trim();
    if (raw && ALLOWED.has(raw)) {
      return raw as OrderDetailEntryPoint;
    }
  } catch {
    // private mode / quota
  }
  return null;
}

let sessionCleanupMicrotaskQueued = false;

/**
 * Call from a link/button before navigating to order detail.
 * Cleared after GTM + CDP order-detail page events ({@link scheduleOrderDetailEntryPointSessionCleanup}).
 */
export function stashOrderDetailEntryPoint(entryPoint: OrderDetailEntryPoint): void {
  if (!ALLOWED.has(entryPoint)) return;
  try {
    sessionStorage.setItem(SESSION_KEY, entryPoint);
  } catch {
    // ignore
  }
}

/**
 * After order-detail analytics: call from GTM and CDP paths once each; storage is removed on the next microtask
 * so both reads see the same value in the same React commit.
 */
export function scheduleOrderDetailEntryPointSessionCleanup(): void {
  if (sessionCleanupMicrotaskQueued) return;
  sessionCleanupMicrotaskQueued = true;
  queueMicrotask(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    sessionCleanupMicrotaskQueued = false;
  });
}

/** Value from session (peek only); use {@link scheduleOrderDetailEntryPointSessionCleanup} after firing events. */
export function resolveOrderDetailEntryPoint(): OrderDetailEntryPoint {
  return peekEntryPointFromSession() ?? "Direct_URL";
}
