/**
 * Central list of DXP API route paths and base URL.
 * Base URL comes from BASE_API_URL (e.g. https://apidev.intralox.com/v1/dxp).
 */

/**
 * Base API URL from env, no trailing slash.
 * Empty string when {@link BASE_API_URL} is not set.
 */
export function getBaseApiUrl(): string {
  const base = process.env.BASE_API_URL;
  if (!base || typeof base !== "string") return "";
  return base.replace(/\/$/, "");
}

/**
 * DXP API route paths (path segment only, with leading slash).
 * Append to base URL to get full endpoint URL.
 */
export const API_ROUTES = {
  /** GET/POST user profile - /users */
  USERS: "/users",
  /** POST user preferences (default language/account) - /Users/userpreferences */
  USER_PREFERENCES: "/users/userpreferences",
  /** POST lead web registration - /Leads/webregistration */
  LEADS_WEBREGISTRATION: "/leads/webregistration",
  /** GET all permissions catalog */
  PERMISSIONS: "/permissions",
  /** GET profile permission matrix | PATCH update profile permissions */
  PROFILES_PERMISSIONS: "/profiles/permissions",
  /** GET user-specific permissions with email/account filters */
  USER_PERMISSIONS: "/users/permissions",
  /** GET permission change audit log list */
  PERMISSION_LOGS: "/permission-logs",
  /** POST orders listing (GetOrders) — account-scoped, body: accountId, date range, pagination, sorting */
  ORDERS_LIST: "/orders",
  /**
   * POST Shipment search — body: pagination, accountId, search, shipmentStatus, shipmentDateFrom/To, sorting.
   * Full URL is `BASE_API_URL` + this path.
   */
  SHIPMENTS_LIST: "/orders/shipments",
  /** GET shipments for an order — query: orderHeaderId, accountId */
  ORDERS_SHIPMENTS: "/orders/shipments",
  /** POST invoices listing — same shape as orders list until DXP finalizes the contract */
  INVOICES_LIST: "/orders/invoices",
  /** POST quotes listing — contract TBD; path reserved for DXP integration */
  QUOTES_LIST: "/orders/quotes/search",
  /** POST document binary stream for PDF open/download */
  ORDERS_DOCUMENTS_BINARY: "/orders/documents/binary",
  /** POST order facet belt dimensions + status (PostOrderFacets) — body: accountId, orderDateFrom, orderDateTo */
  ORDERS_FACET: "/orders/facet",
  /** GET single order — /orders/{orderHeaderId}?accountId= */
  ORDER_DETAIL: "/orders",
  /** POST document request notification — body includes entryPoint, accountId, order lines, requests[], comments, recipients, etc. */
  DOCUMENT_REQUEST_NOTIFICATION: "/knocknotification/notification-request-document",
  /**
   * Quote request (RFQ) draft: GET `?email=&accountId=`, POST body save draft, POST `/{quoteRequestId}` submit.
   */
  QUOTE_REQUEST: "/quotes",
  /** GET dashboard recent orders + quotes — query: accountId, orderCount, quoteCount, orderDays, quoteDays */
  DASHBOARD_RECENT_DATA: "/dashboard/recentdata",
} as const;

/** POST submit: `/quotes/{quoteRequestId}` with a positive integer id. */
export const UPSTREAM_QUOTE_SUBMIT_PATH = /^\/quotes\/[1-9]\d*$/;

/** BFF proxy pathname for quote submit: `/api/dxp/quotes/{id}`. */
export const DXP_PROXY_QUOTE_SUBMIT_PATH = /^\/api\/dxp\/quotes\/[1-9]\d*$/;

/** Unique upstream path segments from {@link API_ROUTES} (deduped). */
export function getAllowedUpstreamPathWhitelist(): readonly string[] {
  return Array.from(new Set(Object.values(API_ROUTES)));
}

/** Allowed `/api/dxp/...` pathnames derived from {@link API_ROUTES}. */
export function getDxpProxyFetchPathWhitelist(proxyPrefix = "/api/dxp"): readonly string[] {
  const prefix = proxyPrefix.replace(/\/$/, "");
  return Array.from(
    new Set(Object.values(API_ROUTES).map((route) => `${prefix}${route}`))
  );
}

/** Full upstream URLs (`base` + each {@link API_ROUTES} path) for BFF SSRF checks. */
export function getUpstreamFetchUrlWhitelist(baseUrl: string): readonly string[] {
  const base = baseUrl.replace(/\/$/, "");
  return getAllowedUpstreamPathWhitelist().map((route) => `${base}${route}`);
}

/**
 * Returns full URL for a given API route.
 * @param route - Path from API_ROUTES (e.g. API_ROUTES.USERS)
 * @returns Full URL or empty string if base URL is not configured
 */
/**
 * Full URL for a route (e.g. logging, tests). Prefer passing `API_ROUTES` paths to `request()` in api-service only.
 */
export function getApiUrl(route: string): string {
  const base = getBaseApiUrl();
  if (!base) return "";
  const path = route.startsWith("/") ? route : `/${route}`;
  return `${base}${path}`;
}
