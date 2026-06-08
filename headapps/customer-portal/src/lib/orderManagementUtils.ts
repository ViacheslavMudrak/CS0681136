import type { CalendarDate } from "@internationalized/date";
import { getLocalTimeZone, startOfWeek, today } from "@internationalized/date";
import type { Field, ImageField, LinkField } from "@sitecore-content-sdk/nextjs";
import type {
  OrderLineItem,
  OrderListItem,
  OrderShipment,
  OrdersApiSearchField,
  OrdersListProductAttributes,
} from "@/lib/apis/orders-api";
import type { InvoiceRecord } from "@/lib/apis/invoices-api";
import type {
  OrderManagementCarrierSelectionItem,
  OrderManagementDatePresetItem,
  OrderManagementGridColumnItem,
  OrderManagementSearchAttributeItem,
  OrderManagementShipmentDetailItem,
  OrderManagementTabFields,
  OrderManagementTabItem,
} from "@/components/core/OrderManagement/OrderManagement.type";
import {
  MAX_DATE_RANGE_MONTHS,
  PRESET_CUSTOM_ID,
  PRESET_LAST_12_MONTHS_ID,
} from "@/components/core/OrderManagement/orderManagementLabels";
import { normalizeOrderManagementPathnameForSitecore } from "@/lib/orderManagementPathRewrite";

export type OrderRecord = OrderListItem;

export type { InvoiceRecord } from "@/lib/apis/invoices-api";

/** Route-driven tab identity for Order Management (from CMS `TabURL.href`). */
export type OrderManagementTabKind = "orders" | "shipments" | "invoices" | "quotes" | "unknown";

/** Canonical OM section base — must match Sitecore route item path casing (see XM Cloud layout resolution). */
export const ORDERS_MANAGEMENT_PATH_PREFIX = "/orders-management";

/** Invoices tab — must match Sitecore item URL or layout is empty on full navigation. */
export const ORDERS_MANAGEMENT_INVOICES_TAB_HREF = `${ORDERS_MANAGEMENT_PATH_PREFIX}/invoices`;

/** Shipments tab — must match Sitecore item URL for full navigation from order detail. */
export const ORDERS_MANAGEMENT_SHIPMENTS_TAB_HREF = `${ORDERS_MANAGEMENT_PATH_PREFIX}/shipments`;

/** Quotes tab — same as {@link ORDERS_MANAGEMENT_INVOICES_TAB_HREF} pattern. */
export const ORDERS_MANAGEMENT_QUOTES_TAB_HREF = `${ORDERS_MANAGEMENT_PATH_PREFIX}/quotes`;

/** Raw `href` / `url` from a Sitecore General Link on an Order Management tab. */
export function getOrderManagementTabLinkRaw(link?: LinkField): string | undefined {
  const raw = link?.value;
  if (!raw || typeof raw !== "object") return undefined;
  const v = raw as { href?: string; url?: string };
  const h = v.href?.trim();
  if (h) return h;
  const u = v.url?.trim();
  if (u) return u;
  return undefined;
}

/**
 * General Link field with a string `href` for locale-aware `LinkRender` (or SDK `Link`).
 * Mirrors {@link getOrderManagementTabLinkRaw}: Sitecore may set `url` without `href`.
 */
export function toOrderManagementLinkFieldWithHref(link?: LinkField): LinkField | undefined {
  const raw = link?.value;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const v = raw as Record<string, unknown>;
  const hrefRaw = v.href ?? v.url;
  const href = typeof hrefRaw === "string" ? hrefRaw.trim() : "";
  if (!href) return undefined;

  const next: Record<string, string> = { href };
  const copyIfString = (key: string) => {
    const x = v[key];
    if (typeof x === "string" && x) next[key] = x;
  };
  copyIfString("linktype");
  copyIfString("text");
  copyIfString("target");
  copyIfString("anchor");
  copyIfString("querystring");
  copyIfString("title");
  copyIfString("class");

  return { ...link, value: next as LinkField["value"] };
}

/**
 * Converts CMS tab link text to a pathname (`https://host/a/b` → `/a/b`, adds leading `/` when missing).
 */
export function toOrderManagementTabPathname(raw: string): string {
  const t = raw.trim();
  if (!t) return "/";
  if (/^https?:\/\//i.test(t)) {
    try {
      return new URL(t).pathname || "/";
    } catch {
      return t.startsWith("/") ? t : `/${t}`;
    }
  }
  return t.startsWith("/") ? t : `/${t}`;
}

/** If `pathname` contains `orders-management`, returns that segment onward (e.g. `/orders-management/shipments`). */
export function extractOrdersManagementRelativePath(pathname: string): string | null {
  const lower = pathname.toLowerCase();
  const needle = "/orders-management/";
  const idx = lower.indexOf(needle);
  if (idx !== -1) {
    const slice = pathname.slice(idx);
    return slice.replace(/\/$/, "") || slice;
  }
  return null;
}

/**
 * Rewrites legacy / bookmarked lowercase OM segments to Sitecore-canonical casing under
 * {@link ORDERS_MANAGEMENT_PATH_PREFIX}.
 */
export function normalizeOrderManagementInvoicesQuotesSegment(path: string): string {
  const trimmed = path.trim().replace(/\/$/, "") || "/";
  return normalizeOrderManagementPathnameForSitecore(trimmed);
}

/**
 * Rewrites legacy CMS tab URLs under {@link ORDERS_MANAGEMENT_PATH_PREFIX} (Sitecore item paths).
 */
export function normalizeOrderManagementTabHref(href: string | undefined): string | undefined {
  if (!href || !href.trim()) return href;
  const raw = href.trim();
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const noTrail = withSlash.replace(/\/$/, "") || "/";
  if (/\/orders-management(\/|$)/i.test(noTrail)) {
    return normalizeOrderManagementInvoicesQuotesSegment(noTrail);
  }
  const lower = noTrail.toLowerCase();
  const parts = lower.split("/").filter(Boolean);
  const tabKey = parts[parts.length - 1];
  const map: Record<string, string> = {
    order: `${ORDERS_MANAGEMENT_PATH_PREFIX}/orders`,
    orders: `${ORDERS_MANAGEMENT_PATH_PREFIX}/orders`,
    shipment: `${ORDERS_MANAGEMENT_PATH_PREFIX}/shipments`,
    shipments: `${ORDERS_MANAGEMENT_PATH_PREFIX}/shipments`,
    invoices: ORDERS_MANAGEMENT_INVOICES_TAB_HREF,
    invoice: ORDERS_MANAGEMENT_INVOICES_TAB_HREF,
    quotes: ORDERS_MANAGEMENT_QUOTES_TAB_HREF,
    quote: ORDERS_MANAGEMENT_QUOTES_TAB_HREF,
  };
  if (!tabKey || !map[tabKey]) {
    return normalizeOrderManagementInvoicesQuotesSegment(noTrail);
  }
  if (parts.length === 1) return map[tabKey];
  if (parts.length === 2 && /^[a-z]{2}(-[a-z]{2})?$/i.test(parts[0])) return map[tabKey];
  return normalizeOrderManagementInvoicesQuotesSegment(noTrail);
}

/**
 * Resolves a CMS tab link to the canonical OM path used in `Link` href assembly
 * (e.g. full Site URL → `/orders-management/shipments`).
 */
export function resolveOrderManagementTabCanonicalPath(
  rawLink: string | undefined
): string | undefined {
  if (!rawLink || !rawLink.trim()) return undefined;
  const pathOnly = toOrderManagementTabPathname(rawLink.trim());
  const omSlice = extractOrdersManagementRelativePath(pathOnly);
  const forNorm = omSlice ?? pathOnly;
  return normalizeOrderManagementTabHref(forNorm) ?? forNorm;
}

/**
 * Builds the full pathname for Next.js client navigation: keeps `[site]/[locale]/…` (and any
 * prefix before `Orders-Management`) and swaps the OM segment to the tab’s canonical path.
 */
export function resolveOrderManagementTabNavHref(
  pathname: string,
  normalizedTabHref: string
): string {
  const target = (
    normalizedTabHref.startsWith("/") ? normalizedTabHref : `/${normalizedTabHref}`
  ).replace(/\/$/, "");
  const lowerPath = pathname.toLowerCase();
  const marker = "/orders-management/";
  const idx = lowerPath.indexOf(marker);
  if (idx !== -1) {
    return `${pathname.slice(0, idx)}${target}`;
  }
  const endOm = "/orders-management";
  if (lowerPath.endsWith(endOm)) {
    const at = lowerPath.length - endOm.length;
    if (at === 0 || pathname.charAt(at - 1) === "/") {
      return `${pathname.slice(0, at)}${target}`;
    }
  }
  const base = pathname.replace(/\/$/, "");
  return `${base}${target}`;
}

/**
 * OM tab strip navigation target: when the tab’s kind is known, use the fixed Sitecore route for that
 * section so client tab clicks always go to the right page even if the CMS duplicated another tab’s URL.
 */
export function resolveOrderManagementTabNavTargetPath(
  rawLink: string | undefined,
  canonicalResolved: string | undefined
): string | undefined {
  const c = canonicalResolved?.trim();
  if (!c) return undefined;
  const kind = resolveOrderManagementTabKind(rawLink);
  if (kind === "unknown") return c;
  const byKind: Record<Exclude<OrderManagementTabKind, "unknown">, string> = {
    orders: `${ORDERS_MANAGEMENT_PATH_PREFIX}/orders`,
    shipments: `${ORDERS_MANAGEMENT_PATH_PREFIX}/shipments`,
    invoices: ORDERS_MANAGEMENT_INVOICES_TAB_HREF,
    quotes: ORDERS_MANAGEMENT_QUOTES_TAB_HREF,
  };
  return byKind[kind];
}

/** Derives tab kind from the current browser path (handles locale + site prefix segments). */
export function resolveOrderManagementTabKindFromPathname(
  pathname: string
): OrderManagementTabKind {
  const m = pathname.match(/\/orders-management\/([^/?#]+)/i);
  if (!m) return "unknown";
  return resolveOrderManagementTabSegment(m[1]);
}

function resolveOrderManagementTabSegment(segment: string): OrderManagementTabKind {
  const seg = segment.toLowerCase();
  if (seg === "orders" || seg === "order") return "orders";
  if (seg === "shipments" || seg === "shipment") return "shipments";
  if (seg === "invoices" || seg === "invoice") return "invoices";
  if (seg === "quotes" || seg === "quote") return "quotes";
  return "unknown";
}

/**
 * Derives OM tab kind from Sitecore layout context (Experience Editor / Preview).
 * Uses `context.itemPath` when present, then falls back to `route.name` (Orders, Shipments, etc.).
 */
export function resolveOrderManagementTabKindFromSitecoreLayout(
  sitecore: OrderManagementLayoutSitecoreProbe | undefined
): OrderManagementTabKind {
  const ctx = sitecore?.context as { itemPath?: string } | undefined;
  const itemPath = ctx?.itemPath;
  if (typeof itemPath === "string" && itemPath.trim()) {
    const normalized = itemPath.startsWith("/") ? itemPath : `/${itemPath}`;
    const fromItemPath = resolveOrderManagementTabKindFromPathname(normalized);
    if (fromItemPath !== "unknown") {
      return fromItemPath;
    }
  }

  const route = sitecore?.route as { name?: string } | null | undefined;
  const routeName = (route?.name ?? "").trim().toLowerCase();
  return resolveOrderManagementTabSegment(routeName);
}

/** Path string used to resolve the active OM tab (browser URL or Sitecore item path in EE/preview). */
export function resolveOrderManagementActiveTabPath(
  pathname: string,
  sitecore: OrderManagementLayoutSitecoreProbe | undefined,
  preferSitecoreLayoutPath: boolean
): string {
  if (!preferSitecoreLayoutPath) {
    return pathname;
  }

  const ctx = sitecore?.context as { itemPath?: string } | undefined;
  const itemPath = ctx?.itemPath;
  if (typeof itemPath === "string" && itemPath.trim()) {
    return itemPath.startsWith("/") ? itemPath : `/${itemPath}`;
  }

  return pathname;
}

export function resolveOrderManagementTabKind(href: string | undefined): OrderManagementTabKind {
  if (!href) return "unknown";
  const normalized = resolveOrderManagementTabCanonicalPath(href);
  if (!normalized) return "unknown";
  const path = normalized.replace(/\/$/, "").toLowerCase();
  if (path.includes("/shipments") || /\/shipment(\/|$)/i.test(path)) return "shipments";
  if (path.includes("/orders-management/orders") || /\/orders$/i.test(path)) return "orders";
  if (path.includes("/invoices")) return "invoices";
  if (path.includes("/quotes")) return "quotes";
  return "unknown";
}

/** Canonical horizontal tab order: Orders → Invoices → Shipments → Quotes. */
const ORDER_MANAGEMENT_TAB_KIND_ORDER: Record<OrderManagementTabKind, number> = {
  orders: 0,
  invoices: 1,
  shipments: 2,
  quotes: 3,
  unknown: 99,
};

/**
 * Sorts CMS `Tabs` into a stable order (Orders → Invoices → Shipments → Quotes) regardless of multilist order in Sitecore.
 */
export function sortOrderManagementTabs(tabs: OrderManagementTabItem[]): OrderManagementTabItem[] {
  return [...tabs].sort((a, b) => {
    const hrefA = getOrderManagementTabLinkRaw(a.fields?.TabURL);
    const hrefB = getOrderManagementTabLinkRaw(b.fields?.TabURL);
    const oa = ORDER_MANAGEMENT_TAB_KIND_ORDER[resolveOrderManagementTabKind(hrefA)] ?? 99;
    const ob = ORDER_MANAGEMENT_TAB_KIND_ORDER[resolveOrderManagementTabKind(hrefB)] ?? 99;
    return oa - ob;
  });
}

/**
 * Horizontal tab label shown in the OM tab bar. Normalizes CMS text (e.g. singular "Shipment" → "Shipments").
 */
export function getOrderManagementTabDisplayLabel(tab: OrderManagementTabItem): string {
  const raw = String(tab.fields?.TabName?.value ?? tab.displayName ?? "").trim();
  const label = raw.length > 0 ? raw : "Tab";
  const kind = resolveOrderManagementTabKind(getOrderManagementTabLinkRaw(tab.fields?.TabURL));
  if (kind === "shipments" && /^shipment$/i.test(label)) {
    return "Shipments";
  }
  return label;
}

/**
 * Normalizes portal/side-nav links under `orders-management` to canonical Sitecore OM paths.
 */
export function normalizeOrderManagementSideNavHref(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "#") return trimmed;
  const pathOnly = toOrderManagementTabPathname(trimmed);
  if (!/\/orders-management\//i.test(pathOnly)) {
    return pathOnly;
  }
  const canonical = resolveOrderManagementTabCanonicalPath(pathOnly);
  return canonical ?? pathOnly;
}

/** Sitecore `layout.sitecore` slice used to detect Order Management pages (for layout permission handling). */
export type OrderManagementLayoutSitecoreProbe = {
  context?: unknown;
  route?: unknown;
};

/**
 * True when the current page is an Order Management subsection (Orders / Invoices / Shipments / Quotes).
 * Used to skip misleading route-level {@link PermissionSelection} (e.g. admin-only codes on customer OM pages).
 */
export function isOrderManagementLayoutRoute(
  sitecore: OrderManagementLayoutSitecoreProbe | undefined
): boolean {
  const ctx = sitecore?.context as { itemPath?: string } | undefined;
  const itemPath = ctx?.itemPath;
  if (typeof itemPath === "string" && /\/orders-management\//i.test(itemPath)) {
    return true;
  }
  const route = sitecore?.route as { name?: string } | null | undefined;
  const routeName = (route?.name ?? "").trim().toLowerCase();
  return (
    routeName === "orders" ||
    routeName === "shipments" ||
    routeName === "invoices" ||
    routeName === "quotes"
  );
}

/** Tab shows a data grid when CMS defines at least one grid column. */
export function tabHasRenderableGrid(tab: OrderManagementTabItem | undefined): boolean {
  const cols = tab?.fields?.GridSelection;
  return Array.isArray(cols) && cols.length > 0;
}

/** Sort keys for the Shipments grid (subset of CMS sortable columns). */
export type ShipmentSortColumnId =
  | "trackingNumber"
  | "carrier"
  | "poNumber"
  | "orderNumber"
  | "items"
  | "shipDate"
  | null;

/** One row in the Shipments tab grid (flattened from orders + shipment lines). */
export type ShipmentGridRow = {
  rowId: string;
  orderHeaderId: string;
  orderNumber: string;
  poNumber: string;
  trackingNumber: string;
  trackingUrl: string;
  carrier: string;
  itemCount: number;
  shipDateIso: string;
  documentUrl?: string | null;
};

const STUB_TRACKING = "1Z999AA10123456784";
const STUB_TRACKING_URL = "https://www.fedex.com/fedextrack/?trknbr=1Z999AA10123456784";

/** When the API returns no shipment lines, synthesize one row per order for Shipments UI (until shipment API exists). */
export function stubShipmentsForOrder(order: OrderRecord): OrderShipment[] {
  if (order.shipments.length > 0) return order.shipments;
  return [
    {
      id: `stub-${order.orderHeaderId}`,
      trackingNumber: STUB_TRACKING,
      trackingUrl: STUB_TRACKING_URL,
      carrier: "FedEx Ground",
      itemCount: order.itemCount,
      statusLabel: order.orderStatusLabel ?? "Shipped",
      shippedDate: order.orderDate,
    },
  ];
}

function normalizeShipmentCarrierName(raw: string | undefined): string {
  return (raw ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function compactCarrierKey(raw: string): string {
  return raw.replace(/[^a-z0-9]/g, "");
}

function carrierAcronym(raw: string): string {
  return raw
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("");
}

function carriersLikelyMatch(left: string, right: string): boolean {
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.includes(right) || right.includes(left)) return true;

  const leftCompact = compactCarrierKey(left);
  const rightCompact = compactCarrierKey(right);
  if (!leftCompact || !rightCompact) return false;
  if (leftCompact === rightCompact) return true;
  if (leftCompact.includes(rightCompact) || rightCompact.includes(leftCompact)) return true;

  const leftAcronym = carrierAcronym(left);
  const rightAcronym = carrierAcronym(right);
  if (
    (leftAcronym && leftAcronym === rightCompact) ||
    (rightAcronym && rightAcronym === leftCompact) ||
    (leftAcronym && rightAcronym && leftAcronym === rightAcronym)
  ) {
    return true;
  }

  return false;
}

export function trackingUrlFromCarrierSelection(
  carrier: string,
  trackingNumber: string,
  carrierSelection: OrderManagementCarrierSelectionItem[] | undefined
): string | null {
  const normalizedCarrier = normalizeShipmentCarrierName(carrier);
  const normalizedTracking = trackingNumber.trim();
  if (!normalizedCarrier || !normalizedTracking || !carrierSelection?.length) return null;

  for (const item of carrierSelection) {
    const template = item.fields?.URL?.value?.trim();
    if (!template) continue;

    const byDisplayName = normalizeShipmentCarrierName(item.displayName);
    const byName = normalizeShipmentCarrierName(item.name);
    const matches =
      (byDisplayName && carriersLikelyMatch(normalizedCarrier, byDisplayName)) ||
      (byName && carriersLikelyMatch(normalizedCarrier, byName));

    if (matches) {
      return template.replaceAll("{tracking_number}", encodeURIComponent(normalizedTracking));
    }
  }

  return null;
}

/**
 * Resolve a shipment tracking URL from CMS carrier templates with API fallback.
 */
export function resolveTrackingUrl(
  carrier: string,
  trackingNumber: string,
  carrierSelection: OrderManagementCarrierSelectionItem[] | undefined,
  fallbackTrackingUrl?: string | null
): string {
  const fromCms = trackingUrlFromCarrierSelection(carrier, trackingNumber, carrierSelection);
  return fromCms ?? fallbackTrackingUrl?.trim() ?? "";
}

/**
 * Carrier URL templates for tracking links: prefer the active tab’s `CarrierSelection`,
 * otherwise the Shipments tab (where CMS authors typically place the multilist).
 */
export function resolveCarrierSelectionForTracking(
  currentTabFields: OrderManagementTabFields | undefined,
  allTabs: OrderManagementTabItem[]
): OrderManagementCarrierSelectionItem[] | undefined {
  const direct = currentTabFields?.CarrierSelection;
  if (direct?.length) return direct;

  for (const tab of allTabs) {
    const href = getOrderManagementTabLinkRaw(tab.fields?.TabURL);
    if (resolveOrderManagementTabKind(href) !== "shipments") continue;
    const inherited = tab.fields?.CarrierSelection;
    if (inherited?.length) return inherited;
  }

  return undefined;
}

export function flattenOrdersToShipmentRows(
  orders: OrderRecord[],
  carrierSelection?: OrderManagementCarrierSelectionItem[]
): ShipmentGridRow[] {
  const out: ShipmentGridRow[] = [];
  let rowSeq = 0;
  for (const o of orders) {
    for (const s of stubShipmentsForOrder(o)) {
      const trackingUrlResolved = resolveTrackingUrl(
        s.carrier,
        s.trackingNumber,
        carrierSelection,
        s.trackingUrl
      );
      out.push({
        // `orderHeaderId` + shipment `id` can repeat (duplicate API rows / merged lists); suffix keeps React keys stable.
        rowId: `${o.orderHeaderId}-${s.id}-${rowSeq}`,
        orderHeaderId: o.orderHeaderId,
        orderNumber: o.orderNumber,
        poNumber: o.poNumber,
        trackingNumber: s.trackingNumber,
        trackingUrl: trackingUrlResolved,
        carrier: s.carrier,
        itemCount: s.itemCount ?? o.itemCount,
        shipDateIso: s.shippedDate || o.orderDate,
        documentUrl: s.documentUrl ?? null,
      });
      rowSeq += 1;
    }
  }
  return out;
}

function compareShipmentLocaleNumeric(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function sortShipmentGridRows(
  rows: ShipmentGridRow[],
  column: ShipmentSortColumnId,
  direction: "asc" | "desc"
): ShipmentGridRow[] {
  if (!column) return [...rows];
  const mul = direction === "asc" ? 1 : -1;
  const copy = [...rows];
  copy.sort((a, b) => {
    if (column === "items") return (a.itemCount - b.itemCount) * mul;
    if (column === "carrier") return a.carrier.localeCompare(b.carrier) * mul;
    if (column === "shipDate") {
      const ta = new Date(a.shipDateIso).getTime();
      const tb = new Date(b.shipDateIso).getTime();
      return ((Number.isFinite(ta) ? ta : 0) - (Number.isFinite(tb) ? tb : 0)) * mul;
    }
    if (column === "trackingNumber")
      return compareShipmentLocaleNumeric(a.trackingNumber, b.trackingNumber) * mul;
    if (column === "poNumber") return compareShipmentLocaleNumeric(a.poNumber, b.poNumber) * mul;
    if (column === "orderNumber")
      return compareShipmentLocaleNumeric(a.orderNumber, b.orderNumber) * mul;
    return 0;
  });
  return copy;
}

/** Stable React key / row id for order list rows (DXP `orderHeaderId`). */
export function getOrderRowKey(order: OrderRecord, index: number): string {
  return `${order.orderHeaderId}-${order.orderId}-${index}`;
}

export interface DateRangeValue {
  start: Date;
  end: Date;
}

/**
 * Default rolling 12‑month window for DXP list APIs (local calendar):
 * **end** = end of today; **start** = midnight on the calendar day **after** “same month/day one year earlier”.
 * Example: if today is 16 Apr 2026, start is 17 Apr 2025 00:00 and end is 16 Apr 2026 23:59:59.999.
 * Implemented as one `Date` construction `new Date(y - 1, m, d + 1)` so month/day math stays in local
 * calendar (avoids `setFullYear` / chained `setDate` edge cases). Use {@link toYmd} for API bodies.
 */
export function getDefaultLast12MonthsRange(now = new Date()): DateRangeValue {
  const end = endOfDay(now);
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const start = new Date(y - 1, m, d + 1);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function isOrderInDateRange(orderDateIso: string, range: DateRangeValue): boolean {
  const t = new Date(orderDateIso).getTime();
  return t >= range.start.getTime() && t <= range.end.getTime();
}

export function monthsSpanInclusive(start: Date, end: Date): number {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  return months + 1;
}

export function isRangeWithinMaxMonths(start: Date, end: Date): boolean {
  if (end < start) return false;
  return monthsSpanInclusive(start, end) <= MAX_DATE_RANGE_MONTHS;
}

export function formatLocaleDateShort(d: Date, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

/**
 * BCP-47 locale for React Aria {@link DateField} segment placeholders and order.
 * App routing uses short codes (`en`, `fr`); without a region, browsers may pick `en-GB` (dd/mm/yyyy).
 */
const DATE_FIELD_LOCALE_BY_APP_LOCALE: Record<string, string> = {
  en: "en-US",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  it: "it-IT",
  ja: "ja-JP",
  pl: "pl-PL",
  pt: "pt-PT",
  zh: "zh-CN",
  ar: "ar",
};

export function resolveDateFieldLocale(appLocale: string): string {
  const trimmed = appLocale.trim();
  if (!trimmed) return "en-US";
  const key = trimmed.toLowerCase();
  const mapped = DATE_FIELD_LOCALE_BY_APP_LOCALE[key];
  if (mapped) return mapped;
  if (key.includes("-")) return trimmed;
  return trimmed;
}

/** ISO-8601 numeric offset at end of string: `±HH:MM` or `±HHMM` (minutes east of UTC). */
function parseIsoNumericOffsetEastMinutesAtEnd(trimmed: string): number | null {
  const withColons = trimmed.match(/([+-])(\d{2}):(\d{2})$/);
  if (withColons) {
    const sign = withColons[1] === "+" ? 1 : -1;
    const h = Number.parseInt(withColons[2], 10);
    const m = Number.parseInt(withColons[3], 10);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    return sign * (h * 60 + m);
  }
  const compact = trimmed.match(/([+-])(\d{2})(\d{2})$/);
  if (!compact) return null;
  const sign = compact[1] === "+" ? 1 : -1;
  const h = Number.parseInt(compact[2], 10);
  const m = Number.parseInt(compact[3], 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  if (h > 14 || m >= 60) return null;
  return sign * (h * 60 + m);
}

function formatYmdWithIntlUtcNoon(
  year: number,
  monthIndex: number,
  day: number,
  locale: string
): string {
  return new Intl.DateTimeFormat(locale, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthIndex, day, 12, 0, 0)));
}

/**
 * Formats API date/datetime strings for list/detail display.
 * - `YYYY-MM-DD` only: local calendar day (matches date picker / {@link parseIsoYmdToLocalDate}).
 * - Full ISO with `Z`: UTC calendar day (avoids viewer TZ shifting the day).
 * - Full ISO with explicit `±HH:MM` / `±HHMM`: calendar day in that fixed offset (matches embedded wall date).
 * - Naive `YYYY-MM-DDTHH:mm:ss` (no zone): interpreted in the viewer’s local TZ (matches {@link toApiDateRangeStart}).
 */
export function formatOrderDateDisplay(iso: string, locale: string): string {
  const trimmed = iso.trim();
  if (!trimmed) return "";

  const dateOnly = parseIsoYmdToLocalDate(trimmed);
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed) && dateOnly) {
    try {
      return new Intl.DateTimeFormat(locale, {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }).format(dateOnly);
    } catch {
      return trimmed.slice(0, 10);
    }
  }

  const instant = new Date(trimmed);
  const t = instant.getTime();
  if (!Number.isFinite(t)) {
    return trimmed.slice(0, 10);
  }

  try {
    if (/Z$/i.test(trimmed)) {
      return new Intl.DateTimeFormat(locale, {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      }).format(instant);
    }

    const eastMinutes = parseIsoNumericOffsetEastMinutesAtEnd(trimmed);
    if (eastMinutes != null) {
      const wallMs = t + eastMinutes * 60_000;
      const wall = new Date(wallMs);
      return formatYmdWithIntlUtcNoon(
        wall.getUTCFullYear(),
        wall.getUTCMonth(),
        wall.getUTCDate(),
        locale
      );
    }

    return new Intl.DateTimeFormat(locale, {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).format(instant);
  } catch {
    return trimmed.slice(0, 10);
  }
}

export function formatCurrencyAmount(amount: number, currency: string, locale: string): string {
  try {
    return currency
      ? new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount)
      : `${amount ? amount.toFixed(2) : "0.00"}`;
  } catch {
    return `${currency} ${amount ? amount.toFixed(2) : "0.00"}`;
  }
}

/**
 * CMS `ResultSummaryPattern` for order list pagination (placeholders `{start}`, `{end}`, `{total}`).
 */
export function resolveOrderManagementResultSummaryPattern(
  field: Field<string> | undefined,
  start: number,
  end: number,
  total: number
): string {
  const raw = (field?.value ?? "").trim();
  if (!raw) {
    return `${start}–${end} of ${total}`;
  }
  return raw
    .replace(/\{start\}/gi, String(start))
    .replace(/\{end\}/gi, String(end))
    .replace(/\{total\}/gi, String(total));
}

/** Case-insensitive highlight segments for search matches. */
export function splitHighlightSegments(
  text: string,
  query: string
): { text: string; match: boolean }[] {
  const q = query.trim();
  if (!q) return [{ text, match: false }];
  const lower = text.toLowerCase();
  const lq = q.toLowerCase();
  const segments: { text: string; match: boolean }[] = [];
  let i = 0;
  while (i < text.length) {
    const idx = lower.indexOf(lq, i);
    if (idx === -1) {
      segments.push({ text: text.slice(i), match: false });
      break;
    }
    if (idx > i) segments.push({ text: text.slice(i, idx), match: false });
    segments.push({ text: text.slice(idx, idx + q.length), match: true });
    i = idx + q.length;
  }
  return segments;
}

export type SearchableAttributeKey =
  | "po"
  | "order"
  | "part"
  | "description"
  | "carrier"
  | "tracking"
  | "invoice"
  | "contactName"
  | "quoteNumber";

const ATTR_HANDLERS: Record<SearchableAttributeKey, (o: OrderRecord, q: string) => boolean> = {
  po: (o, q) => o.poNumber.toLowerCase().includes(q),
  order: (o, q) => o.orderNumber.toLowerCase().includes(q),
  part: (o, q) => o.lineItems.some((l) => l.intraloxPartNumber.toLowerCase().includes(q)),
  description: (o, q) => o.lineItems.some((l) => l.description.toLowerCase().includes(q)),
  carrier: (o, q) =>
    stubShipmentsForOrder(o).some((s) => (s.carrier ?? "").toLowerCase().includes(q)),
  tracking: (o, q) =>
    stubShipmentsForOrder(o).some((s) => (s.trackingNumber ?? "").toLowerCase().includes(q)),
  invoice: () => false,
  contactName: () => false,
  quoteNumber: () => false,
};

/**
 * Maps CMS search attribute display/value to internal keys. Unknown values are ignored.
 */
export function resolveSearchAttributeKey(label: string): SearchableAttributeKey | null {
  const n = label.toLowerCase();
  if (n.includes("invoice number") || n.includes("invoice #")) return "invoice";
  if (n.includes("po number") || n === "po") return "po";
  if (n.includes("order number") || n === "order") return "order";
  if (n.includes("part number") || n.includes("intralox part")) return "part";
  if (n.includes("line item") || n.includes("description")) return "description";
  if (n.includes("carrier")) return "carrier";
  if (n.includes("contact name")) return "contactName";
  if (n.includes("quote number")) return "quoteNumber";
  if (n.includes("tracking")) return "tracking";
  return null;
}

export function isInvoiceInDateRange(invoiceDateIso: string, range: DateRangeValue): boolean {
  return isOrderInDateRange(invoiceDateIso, range);
}

/** One row in the Quotes tab grid (list API + client filters). */
export type QuoteRecord = {
  /** Display quote number (e.g. business `quoteId` from DXP). */
  quoteId: string;
  /** Route segment + GET order detail (`quoteHeaderId` from DXP). */
  quoteHeaderId?: string;
  /** Parsed numeric header id when available (legacy / compat). */
  orderHeaderId?: number;
  quoteNumber: string;
  contactPerson: string;
  /** `null` when the API omits a count. */
  itemCount: number | null;
  /** Normalized filter key, e.g. {@link normalizeCmsStatusKeyToFilterKey}(`READY`) → `order_ready`. */
  statusKey: string;
  quoteDateIso: string;
  /** Calendar days until expiry; `null` when expired or unknown. */
  expiresInDays: number | null;
  totalAmount: number;
  currency: string;
  /** When API provides a direct download URL */
  downloadUrl?: string;
};

/** URL segment for quote detail — prefers {@link QuoteRecord.quoteHeaderId}. */
export function quoteDetailRouteId(
  row: Pick<QuoteRecord, "quoteHeaderId" | "quoteId">
): string {
  const header = (row.quoteHeaderId ?? "").trim();
  if (header) return header;
  return (row.quoteId ?? "").trim();
}

export function isQuoteInDateRange(quoteDateIso: string, range: DateRangeValue): boolean {
  if (!quoteDateIso?.trim()) return false;
  return isOrderInDateRange(quoteDateIso, range);
}

export function quoteMatchesSearch(
  row: QuoteRecord,
  query: string,
  activeAttributeKeys: SearchableAttributeKey[]
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const matchContact = row.contactPerson.toLowerCase().includes(q);
  const matchQuote = row.quoteNumber.toLowerCase().includes(q);
  if (!activeAttributeKeys.length) {
    return matchContact || matchQuote;
  }
  return activeAttributeKeys.some((k) => {
    if (k === "contactName") return matchContact;
    if (k === "quoteNumber") return matchQuote;
    return false;
  });
}

export function invoiceMatchesSearch(
  inv: InvoiceRecord,
  query: string,
  activeAttributeKeys: SearchableAttributeKey[]
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const matchInvoice = inv.invoiceNumber.toLowerCase().includes(q);
  const matchPo = inv.poNumber.toLowerCase().includes(q);
  const matchOrder = inv.orderNumber.toLowerCase().includes(q);
  if (!activeAttributeKeys.length) {
    return matchInvoice || matchPo || matchOrder;
  }
  return activeAttributeKeys.some((k) => {
    if (k === "invoice") return matchInvoice;
    if (k === "po") return matchPo;
    if (k === "order") return matchOrder;
    return false;
  });
}

/**
 * Normalized `fields.Value` / `displayName` from Sitecore SearchAttribute items → DXP `searchIn` names.
 * Only known authoring values map; anything else is omitted (no default fill).
 */
const CMS_ORDER_SEARCH_VALUE_TO_API: Record<string, OrdersApiSearchField> = {
  "po number": "poNumber",
  "order number": "orderNumber",
  "intralox part number": "intraloxPartNumber",
  "line item description": "partDescription",
};

/**
 * Maps a single CMS search attribute label (`Value` or `displayName`) to the API `searchIn` field name.
 */
export function cmsOrderSearchLabelToApiField(label: string): OrdersApiSearchField | null {
  const key = label.trim().toLowerCase().replace(/\s+/g, " ");
  return CMS_ORDER_SEARCH_VALUE_TO_API[key] ?? null;
}

const API_FIELD_TO_SEARCHABLE_KEY: Record<OrdersApiSearchField, SearchableAttributeKey> = {
  poNumber: "po",
  orderNumber: "order",
  intraloxPartNumber: "part",
  partDescription: "description",
};

/** Maps API `searchIn` field back to the internal key used for client-side filtering. */
export function apiSearchFieldToSearchableKey(field: OrdersApiSearchField): SearchableAttributeKey {
  return API_FIELD_TO_SEARCHABLE_KEY[field];
}

/** Maps selected client-side search keys to DXP `searchIn` fields (orders API). */
export function searchableKeysToApiSearchIn(
  keys: SearchableAttributeKey[]
): OrdersApiSearchField[] {
  const out: OrdersApiSearchField[] = [];
  for (const [apiField, sk] of Object.entries(API_FIELD_TO_SEARCHABLE_KEY) as [
    OrdersApiSearchField,
    SearchableAttributeKey,
  ][]) {
    if (keys.includes(sk) && !out.includes(apiField)) out.push(apiField);
  }
  return out;
}

/**
 * Builds DXP `searchIn` from the SearchAttribute multilist: only items whose `Value`/`displayName`
 * match {@link cmsOrderSearchLabelToApiField} are included, in CMS order, deduped.
 * Returns an empty array when nothing is configured or nothing maps.
 */
export function resolveApiSearchInFromCmsSearchAttributes(
  attrs: OrderManagementSearchAttributeItem[] | undefined | null
): OrdersApiSearchField[] {
  const out: OrdersApiSearchField[] = [];
  for (const a of attrs ?? []) {
    const raw = a.fields?.Value?.value ?? a.displayName ?? "";
    const api = cmsOrderSearchLabelToApiField(String(raw));
    if (api && !out.includes(api)) out.push(api);
  }
  return out;
}

/**
 * Orders tab search input placeholder: CMS `SearchPlaceholder` plus comma-separated
 * `SearchAttribute` labels (prefer `Value`, else `displayName`).
 */
export function buildOrdersSearchPlaceholder(tabFields: OrderManagementTabFields): string {
  const base = (tabFields.SearchPlaceholder?.value ?? "").trim();
  const labels =
    tabFields.SearchAttribute?.map((a) => {
      const fromValue = a.fields?.Value?.value?.trim();
      if (fromValue) return fromValue;
      return (a.displayName ?? "").trim();
    }).filter((s): s is string => Boolean(s)) ?? [];
  const attrPart = labels.join(", ");
  if (base && attrPart) return `${base} ${attrPart}`;
  return base || attrPart;
}

/**
 * Tab search placeholder for non-orders tabs.
 * Uses CMS `SearchPlaceholder` + `SearchAttribute`; when placeholder text is blank but
 * attributes exist, defaults to `Search by`.
 */
export function buildTabSearchPlaceholder(tabFields: OrderManagementTabFields): string {
  const base = (tabFields.SearchPlaceholder?.value ?? "").trim();
  const labels =
    tabFields.SearchAttribute?.map((a) => {
      const fromValue = a.fields?.Value?.value?.trim();
      if (fromValue) return fromValue;
      return (a.displayName ?? "").trim();
    }).filter((s): s is string => Boolean(s)) ?? [];
  const attrPart = labels.join(", ");
  const resolvedBase = base || (attrPart ? "Search by" : "");
  if (resolvedBase && attrPart) return `${resolvedBase} ${attrPart}`;
  return resolvedBase || attrPart;
}

export function orderMatchesSearch(
  order: OrderRecord,
  query: string,
  activeAttributeKeys: SearchableAttributeKey[]
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (!activeAttributeKeys.length) {
    return (
      ATTR_HANDLERS.po(order, q) ||
      ATTR_HANDLERS.order(order, q) ||
      ATTR_HANDLERS.part(order, q) ||
      ATTR_HANDLERS.description(order, q) ||
      ATTR_HANDLERS.carrier(order, q) ||
      ATTR_HANDLERS.tracking(order, q)
    );
  }
  return activeAttributeKeys.some((k) => ATTR_HANDLERS[k](order, q));
}

export interface BeltSelections {
  series: Set<string>;
  style: Set<string>;
  material: Set<string>;
  color: Set<string>;
}

export function createEmptyBeltSelections(): BeltSelections {
  return {
    series: new Set(),
    style: new Set(),
    material: new Set(),
    color: new Set(),
  };
}

export function getBeltSelectionCount(belt: BeltSelections): number {
  return belt.series.size + belt.style.size + belt.material.size + belt.color.size;
}

/** True when the search term matches a line's intralox part # or description. */
export function lineItemMatchesTextSearch(line: OrderLineItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    line.intraloxPartNumber.toLowerCase().includes(q) ||
    line.description.toLowerCase().includes(q)
  );
}

/**
 * True when at least one line matches the search on part # or description.
 * When false but the order is in search results, the match was on PO/order # (header-level).
 */
export function orderHasLineLevelTextSearchMatch(
  lineItems: OrderLineItem[],
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  return lineItems.some((line) => lineItemMatchesTextSearch(line, query));
}

/**
 * True when a line item satisfies the active belt chip selections.
 * If the line has no belt dimensions (common when the API omits attributes), it is treated as a match
 * when any belt filter is active — the order list is already server-filtered.
 */
function lineItemMatchesBeltSelection(line: OrderLineItem, belt: BeltSelections): boolean {
  const hasSeries = belt.series.size > 0;
  const hasStyle = belt.style.size > 0;
  const hasMaterial = belt.material.size > 0;
  const hasColor = belt.color.size > 0;
  if (!hasSeries && !hasStyle && !hasMaterial && !hasColor) return true;

  const lineHasDims = Boolean(line.series || line.style || line.material || line.color);
  if (!lineHasDims) return true;

  const okSeries = !hasSeries || (line.series != null && belt.series.has(line.series));
  const okStyle = !hasStyle || (line.style != null && belt.style.has(line.style));
  const okMat = !hasMaterial || (line.material != null && belt.material.has(line.material));
  const okColor = !hasColor || (line.color != null && belt.color.has(line.color));
  return okSeries && okStyle && okMat && okColor;
}

/**
 * Line items for the expanded "Matching Item(s) Found" block when search and/or belt filters are active.
 * Header-level search (PO/order #) returns all lines from the API row; line-level search filters by part/description.
 */
export function lineItemsForExpandedMatchingSection(
  order: OrderRecord,
  query: string,
  belt: BeltSelections
): OrderLineItem[] {
  const q = query.trim().toLowerCase();
  const beltActive =
    belt.series.size > 0 || belt.style.size > 0 || belt.material.size > 0 || belt.color.size > 0;
  if (!q && !beltActive) return [];

  const headerOnlySearch = Boolean(q) && !orderHasLineLevelTextSearchMatch(order.lineItems, query);

  let items = order.lineItems;
  if (beltActive) {
    items = items.filter((line) => lineItemMatchesBeltSelection(line, belt));
  }
  if (q && !headerOnlySearch) {
    items = items.filter((line) => lineItemMatchesTextSearch(line, query));
  }
  return items;
}

/** Matching line items for one shipment in the expanded orders list row. */
export function lineItemsForExpandedMatchingSectionByShipment(
  order: OrderRecord,
  shipmentId: string,
  query: string,
  belt: BeltSelections
): OrderLineItem[] {
  return lineItemsForExpandedMatchingSection(order, query, belt).filter(
    (line) => line.shipmentId === shipmentId
  );
}

/**
 * Line items for one shipment in the expanded row: all lines when no search/belt;
 * filtered by belt and/or line-level search when active. Header-level search (PO/order #) keeps all
 * lines under each shipment because POST /orders already scoped the row via `shippingDetails`.
 */
export type ExpandedShipmentLineItemsOptions = {
  shipmentIndex?: number;
  shipmentCount?: number;
};

export function lineItemsForExpandedShipmentSection(
  lineItems: OrderLineItem[],
  shipmentId: string,
  query: string,
  belt: BeltSelections,
  options?: ExpandedShipmentLineItemsOptions
): OrderLineItem[] {
  let scoped = lineItems.filter((line) => line.shipmentId === shipmentId);
  if (
    scoped.length === 0 &&
    lineItems.length > 0 &&
    lineItems.every((line) => !line.shipmentId) &&
    options?.shipmentIndex != null &&
    options?.shipmentCount != null &&
    options.shipmentCount > 0
  ) {
    const perShipment = Math.ceil(lineItems.length / options.shipmentCount);
    const start = options.shipmentIndex * perShipment;
    scoped = lineItems.slice(start, start + perShipment);
  }
  const q = query.trim().toLowerCase();
  const beltActive =
    belt.series.size > 0 || belt.style.size > 0 || belt.material.size > 0 || belt.color.size > 0;
  if (!q && !beltActive) {
    return scoped;
  }

  const headerOnlySearch = Boolean(q) && !orderHasLineLevelTextSearchMatch(lineItems, query);

  let items = scoped;
  if (beltActive) {
    items = items.filter((line) => lineItemMatchesBeltSelection(line, belt));
  }
  if (q && !headerOnlySearch) {
    items = items.filter((line) => lineItemMatchesTextSearch(line, query));
  }
  return items;
}

/** True when any line item would render under a shipment block on expand. */
export function hasExpandedShipmentLineItems(
  lineItems: OrderLineItem[],
  shipments: { id: string }[],
  query: string,
  belt: BeltSelections
): boolean {
  return shipments.some(
    (sh, shipmentIndex) =>
      lineItemsForExpandedShipmentSection(lineItems, sh.id, query, belt, {
        shipmentIndex,
        shipmentCount: shipments.length,
      }).length > 0
  );
}

/** Whether the expanded row should show any per-shipment or fallback matching blocks. */
export function hasExpandedMatchingLineItems(
  order: OrderRecord,
  query: string,
  belt: BeltSelections
): boolean {
  return lineItemsForExpandedMatchingSection(order, query, belt).length > 0;
}

const sortBeltAttr = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: "base" });

/**
 * Maps belt UI selections to DXP `productAttributes` on the orders list payload.
 */
export function beltSelectionsToProductAttributes(
  belt: BeltSelections
): OrdersListProductAttributes {
  return {
    series: [...belt.series].sort(sortBeltAttr),
    style: [...belt.style].sort(sortBeltAttr),
    material: [...belt.material].sort(sortBeltAttr),
    color: [...belt.color].sort(sortBeltAttr),
  };
}

export function fallbackApiOrderStatusFromStatusKey(statusKey: string): string {
  if (statusKey.startsWith("order_")) {
    const tail = statusKey.slice(6).replace(/_/g, " ");
    return tail.replace(/\b\w/g, (c) => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase());
  }
  return statusKey;
}

/**
 * Maps selected status filter keys (`order_*`) to strings for DXP `orderStatus` (prefers CMS `StatusValue`).
 */
export function orderStatusFilterKeysToApiValues(
  selectedKeys: Iterable<string>,
  tabFields: OrderManagementTabFields | null | undefined
): string[] {
  const out: string[] = [];
  for (const statusKey of selectedKeys) {
    let v: string | null = null;
    for (const opt of tabFields?.FilterOptions ?? []) {
      const cms = opt.fields?.Statuskey?.value ?? opt.fields?.StatusValue?.value;
      if (!cms || normalizeCmsStatusKeyToFilterKey(cms) !== statusKey) continue;
      v = opt.fields?.StatusValue?.value?.trim() ?? null;
      break;
    }
    if (!v) {
      for (const row of tabFields?.StatusItemsSelection ?? []) {
        if (row.fields?.Key?.value === statusKey) {
          v = row.fields?.Phrase?.value?.trim() ?? null;
          break;
        }
      }
    }
    out.push(v ?? fallbackApiOrderStatusFromStatusKey(statusKey));
  }
  return [...new Set(out)];
}

/** Line-item level AND across groups, OR within each group. */
export function orderMatchesBeltFilters(order: OrderRecord, belt: BeltSelections): boolean {
  const hasSeries = belt.series.size > 0;
  const hasStyle = belt.style.size > 0;
  const hasMaterial = belt.material.size > 0;
  const hasColor = belt.color.size > 0;
  if (!hasSeries && !hasStyle && !hasMaterial && !hasColor) return true;

  return order.lineItems.some((line) => {
    const okSeries = !hasSeries || (line.series && belt.series.has(line.series));
    const okStyle = !hasStyle || (line.style && belt.style.has(line.style));
    const okMat = !hasMaterial || (line.material && belt.material.has(line.material));
    const okColor = !hasColor || (line.color && belt.color.has(line.color));
    return okSeries && okStyle && okMat && okColor;
  });
}

export function extractBeltOptionSets(orders: OrderRecord[]): {
  series: string[];
  style: string[];
  material: string[];
  color: string[];
} {
  const series = new Set<string>();
  const style = new Set<string>();
  const material = new Set<string>();
  const color = new Set<string>();
  for (const o of orders) {
    for (const l of o.lineItems) {
      if (l.series) series.add(l.series);
      if (l.style) style.add(l.style);
      if (l.material) material.add(l.material);
      if (l.color) color.add(l.color);
    }
  }
  return {
    series: [...series].sort(),
    style: [...style].sort(),
    material: [...material].sort(),
    color: [...color].sort(),
  };
}

/**
 * Maps CMS `Statuskey` (e.g. PLACED) to internal filter keys used by API mapping (`order_placed`).
 */
export function normalizeCmsStatusKeyToFilterKey(cmsKey: string): string {
  const s = cmsKey.trim();
  if (!s) return "";
  const lower = s.toLowerCase();
  if (lower.startsWith("order_")) return lower.replace(/\s+/g, "_");
  const u = s.toUpperCase().replace(/\s+/g, "_");
  const map: Record<string, string> = {
    PLACED: "order_placed",
    SHIPPED: "order_shipped",
    CANCELLED: "order_cancelled",
    INVOICED: "invoice_invoiced",
    PAID: "invoice_paid",
  };
  if (map[u]) return map[u];
  return `order_${u.toLowerCase()}`;
}

/**
 * Map CMS filter option label to status key: prefers {@link OrderManagementTabFields.FilterOptions}
 * (`StatusValue` / `Statuskey`), then legacy {@link OrderManagementTabFields.StatusItemsSelection}.
 */
export function filterLabelToStatusKey(
  filterLabel: string,
  tabFields: OrderManagementTabFields | null | undefined
): string | null {
  const t = filterLabel.trim().toLowerCase();
  for (const opt of tabFields?.FilterOptions ?? []) {
    const statusVal = opt.fields?.StatusValue?.value?.trim().toLowerCase();
    const legacyVal = opt.fields?.Value?.value?.trim().toLowerCase();
    const dn = (opt.displayName ?? "").trim().toLowerCase();
    if (statusVal === t || legacyVal === t || dn === t) {
      const cmsKey = opt.fields?.Statuskey?.value ?? opt.fields?.StatusValue?.value;
      if (cmsKey) return normalizeCmsStatusKeyToFilterKey(cmsKey);
    }
  }
  for (const row of tabFields?.StatusItemsSelection ?? []) {
    const phrase = row.fields?.Phrase?.value?.trim().toLowerCase();
    if (phrase === t) return row.fields?.Key?.value ?? null;
  }
  return null;
}

/**
 * Maps CMS {@link OrderManagementTabFields.DefaultFilterSelection} to the same status key
 * used when the user toggles a filter in the UI. Returns empty when unset or unmatched.
 */
export function resolveDefaultStatusFilterKeysFromCms(
  tabFields: OrderManagementTabFields | null | undefined
): Set<string> {
  const raw = tabFields?.DefaultFilterSelection?.value?.trim();
  if (!raw || !tabFields) return new Set();
  const key = filterLabelToStatusKey(raw, tabFields);
  return key ? new Set([key]) : new Set();
}

export type StatusDisplayResolved = {
  label: string;
  labelField?: Field<string>;
  iconField?: ImageField;
};

/** Readable label when CMS has no row (e.g. `order_placed` → "Placed"). */
export function defaultLabelFromOrderStatusKey(statusKey: string): string {
  const k = statusKey.trim();
  if (k.startsWith("invoice_")) {
    const words = k.slice(8).split("_").filter(Boolean);
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }
  if (k.startsWith("order_")) {
    const words = k.slice(6).split("_").filter(Boolean);
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }
  return k;
}

/**
 * Label + icon for a row's `statusKey`, from CMS FilterOptions (StatusValue / StatusIcon / Statuskey).
 */
export function resolveStatusDisplayForOrderKey(
  statusKey: string,
  tabFields: OrderManagementTabFields | null | undefined
): StatusDisplayResolved {
  for (const opt of tabFields?.FilterOptions ?? []) {
    const cms = opt.fields?.Statuskey?.value ?? opt.fields?.StatusValue?.value;
    if (!cms) continue;
    if (normalizeCmsStatusKeyToFilterKey(cms) === statusKey) {
      return {
        label:
          opt.fields?.StatusValue?.value ??
          opt.displayName ??
          defaultLabelFromOrderStatusKey(statusKey),
        labelField: opt.fields?.StatusValue,
        iconField: opt.fields?.StatusIcon,
      };
    }
  }
  for (const row of tabFields?.StatusItemsSelection ?? []) {
    if (row.fields?.Key?.value === statusKey) {
      return { label: row.fields?.Phrase?.value ?? defaultLabelFromOrderStatusKey(statusKey) };
    }
  }
  return { label: defaultLabelFromOrderStatusKey(statusKey) };
}

export type SortColumnId =
  | "items"
  | "orderDate"
  | "total"
  | "trackingNumber"
  | "carrier"
  | "poNumber"
  | "orderNumber"
  | "shipDate"
  | "invoiceNumber"
  | "invoiceDate"
  | "dueIn"
  | "invoiceStatus"
  | "invoiceAmount"
  | "quoteId"
  | "quoteContactPerson"
  | "quoteStatus"
  | "quoteDate"
  | "quoteExpiresIn"
  | null;

/** Maps combined UI sort column to DXP orders list sort (shipments tab uses orders API). */
export function mapSortColumnIdToOrdersUiSort(
  column: SortColumnId
): "orderDate" | "items" | "total" {
  if (column === "items") return "items";
  if (column === "total") return "total";
  return "orderDate";
}

export function sortOrderRecords(
  orders: OrderRecord[],
  column: SortColumnId,
  direction: "asc" | "desc"
): OrderRecord[] {
  if (
    !column ||
    column === "carrier" ||
    column === "shipDate" ||
    column === "invoiceNumber" ||
    column === "invoiceDate" ||
    column === "dueIn" ||
    column === "poNumber" ||
    column === "orderNumber" ||
    column === "invoiceStatus" ||
    column === "invoiceAmount" ||
    column === "trackingNumber" ||
    column === "quoteId" ||
    column === "quoteContactPerson" ||
    column === "quoteStatus" ||
    column === "quoteDate" ||
    column === "quoteExpiresIn"
  ) {
    return [...orders];
  }
  const mul = direction === "asc" ? 1 : -1;
  const copy = [...orders];
  copy.sort((a, b) => {
    if (column === "items") return (a.itemCount - b.itemCount) * mul;
    if (column === "total") return (a.totalAmount - b.totalAmount) * mul;
    if (column === "orderDate")
      return (new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()) * mul;
    return 0;
  });
  return copy;
}

/** Client-side / API sort identity for the Invoices tab (desktop slot order 0–6). */
export type InvoiceSortColumnId =
  | "invoiceNumber"
  | "poNumber"
  | "orderNumber"
  | "invoiceStatus"
  | "invoiceDate"
  | "dueIn"
  | "invoiceAmount"
  | null;

/** Normalized header key for invoice grid columns — must match {@link InvoicesDesktopTable} identity. */
export function getInvoiceGridColumnNormalizedKey(col: OrderManagementGridColumnItem): string {
  return normalizeGridNameKey(gridColumnLabelTextForMatch(col));
}

/**
 * Design column index for Invoices tab (0–6). `null` = unrecognized; those sort after known columns.
 * Order: Invoice #, PO #, Order #, Status, Invoice Date, Due In, Invoice Amount.
 */
export function getInvoiceGridColumnDesignSlot(col: OrderManagementGridColumnItem): number | null {
  const k = getInvoiceGridColumnNormalizedKey(col);
  if (!k) return null;

  if (k.includes("INVOICE") && k.includes("DATE")) return 4;
  if (k.includes("DUE") || k.includes("ITEMS") || /\bITEM\b/.test(k)) return 5;
  if (k.includes("AMOUNT")) return 6;
  if (k.includes("STATUS")) return 3;
  const hasPo = /\bPO\b/.test(k) || k.includes("P.O");
  if (hasPo && !k.includes("ORDER")) return 1;

  const orderNumberCol =
    k.includes("ORDER") && (k.includes("#") || k.includes("NUMBER")) && !k.includes("DATE");
  if (orderNumberCol) return 2;

  const invoiceNumberCol =
    k.includes("INVOICE") &&
    !k.includes("DATE") &&
    !k.includes("AMOUNT") &&
    (k.includes("#") || k.includes("NUMBER") || k.includes("NO.") || k === "INVOICE");
  if (invoiceNumberCol) return 0;

  return null;
}

/** Default API/client sort field for each fixed Invoices grid column index (see desktop slot labels). */
export function getInvoiceSortColumnIdForDesignSlot(slot: number): SortColumnId {
  switch (slot) {
    case 0:
      return "invoiceNumber";
    case 1:
      return "poNumber";
    case 2:
      return "orderNumber";
    case 3:
      return "invoiceStatus";
    case 4:
      return "invoiceDate";
    case 5:
      return "dueIn";
    case 6:
      return "invoiceAmount";
    default:
      return null;
  }
}

export function invoiceGridColumnToSortColumnId(
  col: OrderManagementGridColumnItem
): InvoiceSortColumnId {
  const slot = getInvoiceGridColumnDesignSlot(col);
  if (slot === null) return null;
  return getInvoiceSortColumnIdForDesignSlot(slot) as InvoiceSortColumnId;
}

export function sortInvoiceRecords(
  rows: InvoiceRecord[],
  column: InvoiceSortColumnId,
  direction: "asc" | "desc"
): InvoiceRecord[] {
  if (!column) return [...rows];
  const mul = direction === "asc" ? 1 : -1;
  const copy = [...rows];
  copy.sort((a, b) => {
    if (column === "invoiceNumber") return a.invoiceNumber.localeCompare(b.invoiceNumber) * mul;
    if (column === "poNumber") return a.poNumber.localeCompare(b.poNumber) * mul;
    if (column === "orderNumber")
      return a.orderNumber.localeCompare(b.orderNumber, undefined, { numeric: true }) * mul;
    if (column === "invoiceStatus") return a.statusKey.localeCompare(b.statusKey) * mul;
    if (column === "invoiceDate")
      return (new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime()) * mul;
    if (column === "invoiceAmount") {
      if (a.amount !== b.amount) return (a.amount - b.amount) * mul;
      return a.currency.localeCompare(b.currency) * mul;
    }
    if (column === "dueIn") {
      const da = invoiceDueInCalendarDays(a);
      const db = invoiceDueInCalendarDays(b);
      if (da !== null && db !== null) return (da - db) * mul;
      if (da !== null) return -1 * mul;
      if (db !== null) return 1 * mul;
      return (
        (a.dueInDisplay ?? "").localeCompare(b.dueInDisplay ?? "", undefined, {
          numeric: true,
          sensitivity: "base",
        }) * mul
      );
    }
    return 0;
  });
  return copy;
}

export function sortQuoteRecords(
  rows: QuoteRecord[],
  column: SortColumnId,
  direction: "asc" | "desc"
): QuoteRecord[] {
  const col: SortColumnId = column === "orderDate" ? "quoteDate" : column;
  const quoteSortKeys: SortColumnId[] = [
    "quoteId",
    "quoteContactPerson",
    "items",
    "quoteStatus",
    "quoteDate",
    "quoteExpiresIn",
    "total",
  ];
  if (!col || !quoteSortKeys.includes(col)) return [...rows];
  const mul = direction === "asc" ? 1 : -1;
  const copy = [...rows];
  const quoteIdNum = (r: QuoteRecord) => {
    const n = Number.parseInt(String(r.quoteId).replace(/\D/g, ""), 10);
    return Number.isFinite(n) ? n : 0;
  };
  copy.sort((a, b) => {
    if (col === "quoteId") {
      const diff = quoteIdNum(a) - quoteIdNum(b);
      if (diff !== 0) return diff * mul;
      return a.quoteNumber.localeCompare(b.quoteNumber, undefined, { numeric: true }) * mul;
    }
    if (col === "quoteContactPerson") return a.contactPerson.localeCompare(b.contactPerson) * mul;
    if (col === "items") {
      const ac = a.itemCount;
      const bc = b.itemCount;
      if (ac == null && bc == null) return 0;
      if (ac == null) return 1 * mul;
      if (bc == null) return -1 * mul;
      return (ac - bc) * mul;
    }
    if (col === "quoteStatus") return a.statusKey.localeCompare(b.statusKey) * mul;
    if (col === "quoteDate")
      return (new Date(a.quoteDateIso).getTime() - new Date(b.quoteDateIso).getTime()) * mul;
    if (col === "quoteExpiresIn") {
      const ac = a.expiresInDays;
      const bc = b.expiresInDays;
      if (ac == null && bc == null) return 0;
      if (ac == null) return 1 * mul;
      if (bc == null) return -1 * mul;
      return (ac - bc) * mul;
    }
    if (col === "total") return (a.totalAmount - b.totalAmount) * mul;
    return 0;
  });
  return copy;
}

/** Canonical Quotes grid header text (desktop + mobile fallbacks). Order matches design. */
export const QUOTE_GRID_DESKTOP_SLOT_LABELS = [
  "QUOTE #",
  "CONTACT PERSON",
  "# ITEMS",
  "STATUS",
  "QUOTE DATE",
  "EXPIRES IN",
  "TOTAL AMOUNT",
] as const;

export function getQuoteGridColumnNormalizedKey(col: OrderManagementGridColumnItem): string {
  return normalizeGridNameKey(gridColumnLabelTextForMatch(col));
}

/**
 * Design column index for Quotes tab (0–6).
 * Order: Quote #, Contact Person, # Items, Status, Quote Date, Expires In, Total Amount.
 */
export function getQuoteGridColumnDesignSlot(col: OrderManagementGridColumnItem): number | null {
  const k = getQuoteGridColumnNormalizedKey(col);
  if (!k) return null;
  if (k.includes("QUOTE") && k.includes("DATE")) return 4;
  if (k.includes("EXPIRES")) return 5;
  if (k.includes("TOTAL") || k.includes("AMOUNT")) return 6;
  if (k.includes("STATUS")) return 3;
  if (k.includes("CONTACT")) return 1;
  if (k.includes("ITEMS") || (k.includes("ITEM") && k.includes("#"))) return 2;
  if (
    k.includes("QUOTE") &&
    (k.includes("#") || k.includes("NUMBER") || k.includes("NO.")) &&
    !k.includes("DATE")
  ) {
    return 0;
  }
  if (k === "QUOTE") return 0;
  return null;
}

/** Default client/API sort key per Quotes desktop column index (see {@link QUOTE_GRID_DESKTOP_SLOT_LABELS}). */
export function getQuoteSortColumnIdForDesignSlot(slot: number): SortColumnId {
  switch (slot) {
    case 0:
      return "quoteId";
    case 1:
      return "quoteContactPerson";
    case 2:
      return "items";
    case 3:
      return "quoteStatus";
    case 4:
      return "quoteDate";
    case 5:
      return "quoteExpiresIn";
    case 6:
      return "total";
    default:
      return null;
  }
}

/** Maps Quotes CMS grid columns to client/API sort keys. */
export function quoteGridColumnToSortColumnId(col: OrderManagementGridColumnItem): SortColumnId {
  const slot = getQuoteGridColumnDesignSlot(col);
  if (slot === null) return null;
  return getQuoteSortColumnIdForDesignSlot(slot);
}

/**
 * ISO anchor for Due In: API `dueDate` when present, otherwise `invoiceData`, then `invoiceDate`
 * (when backend does not send a dedicated due date).
 */
export function invoiceDueInAnchorDate(invoice: InvoiceRecord): string | null {
  if (invoice.statusKey === "invoice_paid") return null;
  const fromDue = invoice.dueDate?.trim();
  if (fromDue) return fromDue;
  const fromInvoiceData = invoice.invoiceData?.trim();
  if (fromInvoiceData) return fromInvoiceData;
  const fromInvoice = invoice.invoiceDate?.trim();
  return fromInvoice || null;
}

/** Display string aligned with the Due In column (including "Overdue" / "0 days"). */
export function formatInvoiceDueInFromCalendarDays(days: number): string {
  if (days < 0) return "Overdue";
  if (days === 0) return "0 days";
  if (days === 1) return "1 day";
  return `${days} days`;
}

/**
 * Parses API `dueIn` strings such as `"0 Days"`, `"10 days"`, `"-2 Days"` into a signed day count.
 * Returns null when the value is missing or not in an expected `…day(s)` form.
 */
export function parseInvoiceDueInDaysFromApiString(raw: string | null | undefined): number | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t) return null;
  const m = /^\s*(-?\d+)\s*days?\s*$/i.exec(t);
  if (!m) return null;
  return Number.parseInt(m[1], 10);
}

/**
 * Calendar-day delta until due (negative = overdue). Uses API `dueIn` when parseable on the record;
 * otherwise calendar math from due / invoice anchor dates. Null when paid or no usable source.
 */
export function invoiceDueInCalendarDays(
  invoice: InvoiceRecord,
  today = new Date()
): number | null {
  if (invoice.statusKey === "invoice_paid") return null;
  const fromApi = invoice.dueInDaysFromApi;
  if (typeof fromApi === "number" && Number.isFinite(fromApi)) {
    return fromApi;
  }
  const anchor = invoiceDueInAnchorDate(invoice);
  if (!anchor) return null;
  const due = new Date(anchor);
  if (Number.isNaN(due.getTime())) return null;
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const d0 = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  return Math.round((d0 - t0) / 86400000);
}

/** Normalizes CMS grid row `name` for comparison. */
export function normalizeGridNameKey(raw: string | undefined): string {
  return (raw ?? "").trim().toUpperCase().replace(/\s+/g, " ");
}

/** Which `OrderShipment` value a Sitecore “shipment detail” list item maps to. */
export type ShipmentDetailFieldSlot = "tracking" | "carrier" | "items" | "status" | "shippedDate";

export function getShipmentDetailItemLabel(item: OrderManagementShipmentDetailItem): string {
  const v = item.fields?.Value?.value;
  if (typeof v === "string" && v.trim()) return v.trim();
  if (typeof item.displayName === "string" && item.displayName.trim()) {
    return item.displayName.trim();
  }
  if (typeof item.name === "string" && item.name.trim()) return item.name.trim();
  return "";
}

/**
 * Binds a CMS item (url path and/or `Value` label) to a shipment data field. Prefer the URL last segment
 * (e.g. `.../tracking-number`) for stable mapping when labels are customized.
 */
export function resolveShipmentDetailFieldSlot(
  item: OrderManagementShipmentDetailItem
): ShipmentDetailFieldSlot | null {
  const url = (item.url ?? "").toLowerCase();
  const last = url.split("/").filter(Boolean).pop() ?? "";
  if (last) {
    if (last.includes("tracking")) return "tracking";
    if (last === "carrier" || last.endsWith("carrier")) return "carrier";
    if (last === "items" || last === "item" || last.endsWith("items")) return "items";
    if (last.includes("shipment-status") || last === "shipmentstatus" || last === "status") {
      return "status";
    }
    if (last.includes("shipped") || (last.includes("shipment") && last.includes("date"))) {
      return "shippedDate";
    }
  }

  const k = normalizeGridNameKey(getShipmentDetailItemLabel(item));
  if (!k) return null;
  if (k.includes("TRACKING")) return "tracking";
  if (k.includes("CARRIER")) return "carrier";
  if (k === "ITEMS" || k === "# ITEMS" || (k.startsWith("#") && k.includes("ITEM"))) {
    return "items";
  }
  if (k.includes("SHIPPED") && k.includes("DATE")) return "shippedDate";
  if (k.includes("SHIPMENT") && k.includes("DATE") && !k.includes("STATUS")) {
    return "shippedDate";
  }
  if (k.includes("STATUS") || (k.includes("SHIPMENT") && k.includes("STATUS"))) {
    return "status";
  }
  return null;
}

/**
 * Human-readable grid column text for matching (slot/sort/header lookup).
 * Mirrors list/table headers: {@link OrderManagementGridColumnItem.fields} `GridName` → `displayName` → `name`.
 * Sitecore often leaves `name` blank or sets it to an internal id; `??` does not skip `""`, so `name ?? GridName`
 * would incorrectly normalize to an empty string and break column → slot mapping.
 */
export function gridColumnLabelTextForMatch(col: OrderManagementGridColumnItem): string {
  const g = col.fields?.GridName?.value;
  if (typeof g === "string" && g.trim()) return g.trim();
  const d = col.displayName;
  if (typeof d === "string" && d.trim()) return d.trim();
  const n = col.name;
  if (typeof n === "string" && n.trim()) return n.trim();
  return "";
}

/**
 * Normalized key from `name` then `displayName` only (no `GridName`), skipping empty strings so
 * `name: ""` still falls through to `displayName` — unlike `name ?? displayName`, which keeps `""`.
 */
export function ordersGridColumnLegacyNormalizedKey(col: OrderManagementGridColumnItem): string {
  const n = col.name;
  const d = col.displayName;
  const raw =
    typeof n === "string" && n.trim()
      ? n.trim()
      : typeof d === "string" && d.trim()
        ? d.trim()
        : "";
  return normalizeGridNameKey(raw);
}

/**
 * Whether this CMS column is the PO # column on the Order Management **orders** desktop grid.
 * Matches legacy `PO`, visible labels like `PO #`, Sitecore ids like `PO_NUMBER` (where `\bPO\b` fails
 * because `_` counts as a word character), and {@link gridColumnLabelTextForMatch} when `GridName` carries the label.
 */
export function matchesOrdersTabPoGridColumn(col: OrderManagementGridColumnItem): boolean {
  const legacyNorm = ordersGridColumnLegacyNormalizedKey(col);
  const cmsNorm = normalizeGridNameKey(gridColumnLabelTextForMatch(col));
  const candidates = [legacyNorm, cmsNorm].filter((x) => x.length > 0);
  for (const x of candidates) {
    // Skip sales-order # headers, but not "purchase order" / "P.O." (they contain "ORDER" as substring).
    if (
      x.includes("ORDER") &&
      !x.includes("PURCHASE") &&
      !/\bPO\b/.test(x) &&
      !x.includes("P.O")
    ) {
      continue;
    }
    // "PO / ORDER #"–style combined headers: map to order # slot, not the PO column.
    if (/\bORDER\b/.test(x) && x.includes("#") && /\bPO\b/.test(x)) continue;
    if (x === "PO" || x === "PO #") return true;
    // Full phrase "Purchase order" normalizes to "PURCHASE ORDER" — no isolated \bPO\b token.
    if (x.includes("PURCHASE") && /\bORDER\b/.test(x)) return true;
    if (/\bPO\b/.test(x) || x.includes("P.O")) return true;
    // PO_NUMBER, PO-NUM, etc. (word-boundary PO pattern misses PO_… because _ is \w in JS)
    if (/^PO(?:_|#|\s|\.|-|\/|NUMBER)/i.test(x)) return true;
  }
  return false;
}

/** CMS sometimes sends booleans as strings; treat common truthy shapes as sortable. */
export function isGridColumnSortable(col: OrderManagementGridColumnItem): boolean {
  const v = col.fields?.Sortable?.value as unknown;
  if (v === true) return true;
  if (typeof v === "string") return v.trim().toLowerCase() === "true" || v.trim() === "1";
  if (typeof v === "number") return v === 1;
  return false;
}

/**
 * Maps a CMS grid column to client/API sort keys. Uses `GridName` when `name`/`displayName` omit labels (e.g. "# ITEMS").
 */
export function gridColumnToSortColumnId(col: OrderManagementGridColumnItem): SortColumnId {
  const k = normalizeGridNameKey(gridColumnLabelTextForMatch(col));
  if (!k) return null;
  if (k.includes("ITEMS") || (k.includes("ITEM") && k.includes("#"))) return "items";
  if (k.includes("ORDER") && k.includes("DATE")) return "orderDate";
  if (k.includes("TOTAL") || k.includes("AMOUNT")) return "total";
  return null;
}

/** Canonical Shipment grid header text (desktop + mobile); matches design column order. */
export const SHIPMENT_GRID_DESKTOP_SLOT_LABELS = [
  "TRACKING #",
  "CARRIER",
  "PO #",
  "ORDER #",
  "# ITEMS",
  "START DATE",
] as const;

/** Normalized header key for shipment grid columns — must match {@link ShipmentsDesktopTable} identity. */
export function getShipmentGridColumnNormalizedKey(col: OrderManagementGridColumnItem): string {
  return normalizeGridNameKey(gridColumnLabelTextForMatch(col));
}

/** DXP / CMS labels for the sales order number column (not order date, ship order, etc.). */
function isShipmentOrderNumberGridKey(k: string): boolean {
  if (!k.includes("ORDER")) return false;
  if (k.includes("DATE") || k.includes("SHIP") || k.includes("TRACKING") || k.includes("LINE")) {
    return false;
  }
  if (k.includes("ORDER STATUS")) return false;
  return (
    k.includes("#") ||
    k.includes("NUMBER") ||
    k.includes("ORDERID") ||
    /\bORDER\s+ID\b/.test(k) ||
    /\bORDER\s*NO\b/.test(k) ||
    /\bORD\s*#\b/.test(k) ||
    (k.includes("ORD") && k.includes("#"))
  );
}

/**
 * Default API/client sort field for each fixed Shipments grid column index (see {@link SHIPMENT_GRID_DESKTOP_SLOT_LABELS}).
 */
export function getShipmentSortColumnIdForDesignSlot(slot: number): ShipmentSortColumnId | null {
  switch (slot) {
    case 0:
      return "trackingNumber";
    case 1:
      return "carrier";
    case 2:
      return "poNumber";
    case 3:
      return "orderNumber";
    case 4:
      return "items";
    case 5:
      return "shipDate";
    default:
      return null;
  }
}

/**
 * Design column index for Shipments tab (0–5). Packing slip is synthetic (not from CMS).
 * Order: Tracking #, Carrier, PO #, Order #, # Items, Start / ship date.
 */
export function getShipmentGridColumnDesignSlot(col: OrderManagementGridColumnItem): number | null {
  const k = getShipmentGridColumnNormalizedKey(col);
  if (!k) return null;
  if (k.includes("TRACKING")) return 0;
  if (k.includes("CARRIER")) return 1;
  const hasPo = /\bPO\b/.test(k) || k.includes("P.O");
  if (hasPo && !k.includes("ORDER")) return 2;
  if (isShipmentOrderNumberGridKey(k)) return 3;
  if (k.includes("ITEMS") || (k.includes("ITEM") && k.includes("#"))) return 4;
  if ((k.includes("SHIP") && k.includes("DATE")) || (k.includes("START") && k.includes("DATE"))) {
    return 5;
  }
  return null;
}

/**
 * Maps Shipments CMS grid columns to client sort keys (client-side sort on flattened rows).
 */
export function shipmentGridColumnToSortColumnId(
  col: OrderManagementGridColumnItem
): ShipmentSortColumnId {
  const k = getShipmentGridColumnNormalizedKey(col);
  if (!k) return null;
  if (k.includes("TRACKING")) return "trackingNumber";
  if (k.includes("CARRIER")) return "carrier";
  const hasPo = /\bPO\b/.test(k) || k.includes("P.O");
  if (hasPo && !k.includes("ORDER")) return "poNumber";
  if (isShipmentOrderNumberGridKey(k)) return "orderNumber";
  if (k.includes("ITEMS") || (k.includes("ITEM") && k.includes("#"))) return "items";
  if ((k.includes("SHIP") && k.includes("DATE")) || (k.includes("START") && k.includes("DATE"))) {
    return "shipDate";
  }
  return null;
}

/**
 * Resolves the CMS grid column for a fixed design slot, including fallback when {@link getShipmentGridColumnDesignSlot}
 * does not match the CMS label but {@link shipmentGridColumnToSortColumnId} still maps the column (e.g. "Order ID").
 */
export function findShipmentGridColumnForDesignSlot(
  columns: OrderManagementGridColumnItem[],
  slot: number
): OrderManagementGridColumnItem | undefined {
  const direct = columns.find((c) => getShipmentGridColumnDesignSlot(c) === slot);
  if (direct) return direct;
  const want = getShipmentSortColumnIdForDesignSlot(slot);
  if (!want) return undefined;
  return columns.find((c) => shipmentGridColumnToSortColumnId(c) === want);
}

/**
 * Resolves the visible table header for a grid column — same logic as the desktop table
 * (`GridName` → `displayName` → `name`). Use {@link normalizeGridNameKey} on that label for matching,
 * identical to shipment/invoice/quote desktop tables.
 */
export function getGridColumnHeaderLabel(gridColumns: OrderManagementGridColumnItem[]): string {
  for (const col of gridColumns) {
    return col.fields?.GridName?.value ?? col.displayName ?? col.name ?? "";
  }
  return "";
}

export type OrderManagementMobileCardFieldKey =
  | "order"
  | "po"
  | "items"
  | "status"
  | "orderDate"
  | "total";

export function getOrderManagementGridColumnLabel(
  col: OrderManagementGridColumnItem
): string {
  return String(col.fields?.GridName?.value ?? col.displayName ?? col.name ?? "").trim();
}

export function resolveOrderManagementMobileCardFieldKey(
  col: OrderManagementGridColumnItem
): OrderManagementMobileCardFieldKey | null {
  const raw = getOrderManagementGridColumnLabel(col).toUpperCase().replace(/\s+/g, " ");
  if (!raw) return null;
  if (raw === "PO" || raw === "PO #" || raw.includes("PO")) return "po";
  if (raw === "ORDER" || raw === "ORDER #") return "order";
  if (raw === "STATUS") return "status";
  if (raw === "ITEMS" || raw === "# ITEMS" || (raw.includes("ITEM") && raw.includes("#"))) {
    return "items";
  }
  if (raw.includes("ORDER") && raw.includes("DATE")) return "orderDate";
  if (raw.includes("TOTAL") || raw.includes("AMOUNT")) return "total";
  return null;
}

/** @deprecated Use {@link tabHasRenderableGrid} — name was misleading (any tab with a grid matched). */
export function isOrdersTab(tab: OrderManagementTabItem): boolean {
  return tabHasRenderableGrid(tab);
}

export function hrefMatchesPath(pathname: string, href: string | undefined): boolean {
  if (!href) return false;
  const p = pathname.replace(/\/$/, "") || "/";
  const canonicalHref = resolveOrderManagementTabCanonicalPath(href) ?? href;
  const h = canonicalHref.replace(/\/$/, "") || "/";
  if (p === h) return true;
  const lowerP = p.toLowerCase();
  const lowerH = h.toLowerCase();
  if (lowerP.endsWith(lowerH)) return true;
  if (lowerP.includes(`${lowerH}/`)) return true;
  const pathKind = resolveOrderManagementTabKindFromPathname(p);
  const hrefKind = resolveOrderManagementTabKind(href);
  return pathKind !== "unknown" && pathKind === hrefKind;
}

/** Maximum page count used in UI math to avoid runaway values from bad API totals. */
const MAX_PAGINATION_PAGES = 1_000_000;

/**
 * Coerces list totals from API/CMS to a safe non-negative integer for pagination.
 */
export function normalizeListTotalRecords(value: unknown, fallbackLength = 0): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  const len = Number(fallbackLength);
  return Number.isFinite(len) && len >= 0 ? Math.floor(len) : 0;
}

/** Ensures page size is a positive finite integer (guards against NaN/0 from bad state). */
export function normalizeOrderManagementPageSize(pageSize: number, fallback = 10): number {
  if (typeof pageSize === "number" && Number.isFinite(pageSize) && pageSize > 0) {
    return Math.floor(pageSize);
  }
  const fb = Number(fallback);
  return Number.isFinite(fb) && fb > 0 ? Math.floor(fb) : 10;
}

/** Total page count for order-management style server-driven lists. */
export function computeOrderManagementTotalPages(totalRecords: number, pageSize: number): number {
  const total = normalizeListTotalRecords(totalRecords);
  const size = normalizeOrderManagementPageSize(pageSize);
  if (total <= 0) return 1;
  const pages = Math.ceil(total / size);
  if (!Number.isFinite(pages) || pages < 1) return 1;
  return Math.min(Math.floor(pages), MAX_PAGINATION_PAGES);
}

export function clampOrderManagementPageIndex(page: number, totalPages: number): number {
  const tp =
    Number.isFinite(totalPages) && totalPages >= 1
      ? Math.min(Math.floor(totalPages), MAX_PAGINATION_PAGES)
      : 1;
  const p = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  return Math.min(p, tp);
}

export function buildPageList(current: number, total: number): (number | "ellipsis")[] {
  const safeTotal =
    Number.isFinite(total) && total >= 1
      ? Math.min(Math.floor(total), MAX_PAGINATION_PAGES)
      : 1;
  const safeCurrent =
    Number.isFinite(current) && current >= 1
      ? Math.min(Math.floor(current), safeTotal)
      : 1;
  if (safeTotal <= 7) return Array.from({ length: safeTotal }, (_, i) => i + 1);
  const set = new Set<number>();
  set.add(1);
  set.add(safeTotal);
  for (let d = -1; d <= 1; d++) {
    const p = safeCurrent + d;
    if (p >= 1 && p <= safeTotal) set.add(p);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("ellipsis");
    out.push(sorted[i]);
  }
  return out;
}

export function startOfDayClone(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDayClone(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/**
 * `YYYY-MM-DD` in the user's local calendar (matches `<input type="date">` and range picker dates).
 * Prefer this for DXP request bodies instead of `toISOString().slice(0, 10)` — ahead of UTC that shifts the day.
 */
export function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Alias for {@link toYmd} — same local-calendar semantics. */
export function toLocalYmd(d: Date): string {
  return toYmd(d);
}

/** DXP list/facet request: start of selected calendar day (local), `YYYY-MM-DDTHH:mm:ss` (no space). */
export function toApiDateRangeStart(d: Date): string {
  return `${toYmd(d)}T00:00:00`;
}

/** DXP list/facet request: end of selected calendar day (local), `YYYY-MM-DDTHH:mm:ss` (no space). */
export function toApiDateRangeEnd(d: Date): string {
  return `${toYmd(d)}T23:59:59`;
}

/** Placeholder hint for date fields (order of day/month/year follows locale). */
export function getLocaleDatePlaceholder(locale: string): string {
  const sample = new Date(2000, 0, 2);
  try {
    return new Intl.DateTimeFormat(locale)
      .formatToParts(sample)
      .map((p) => {
        if (p.type === "day") return "DD";
        if (p.type === "month") return "MM";
        if (p.type === "year") return "YYYY";
        return p.value;
      })
      .join("");
  } catch {
    return "YYYY-MM-DD";
  }
}

/** Local calendar day at midnight (ignores time-of-day on `d`). */
function startOfLocalCalendarDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Validates `end` (calendar day) is not after the day **following** the `maxYears` anniversary of `start`.
 * Aligns with {@link getDefaultLast12MonthsRange} (end = today; start = same-day-last-year + 1 calendar day).
 */
export function isRangeWithinMaxYearsInclusive(start: Date, end: Date, maxYears: number): boolean {
  if (end < start) return false;
  const limitDay = new Date(start);
  limitDay.setFullYear(limitDay.getFullYear() + maxYears);
  limitDay.setDate(limitDay.getDate() + 1);
  return startOfLocalCalendarDay(end).getTime() <= startOfLocalCalendarDay(limitDay).getTime();
}

export const MAX_ORDER_DATE_RANGE_YEARS = 1;

/** PresentValue tokens that mean the previous completed calendar week (not rolling N days). */
const LAST_WEEK_PRESENT_VALUES = new Set(["week", "last_week", "lastweek", "calendar_week"]);

function calendarDateToLocalDate(cd: CalendarDate): Date {
  return new Date(cd.year, cd.month - 1, cd.day);
}

/**
 * Previous completed calendar week using locale week boundaries (same rules as
 * {@link OrderManagementRangeCalendar} / `startOfWeek`).
 */
export function getPreviousCalendarWeekRange(locale = "en"): DateRangeValue {
  const tz = getLocalTimeZone();
  const now = today(tz);
  const currentWeekStart = startOfWeek(now, locale);
  const lastWeekEnd = currentWeekStart.subtract({ days: 1 });
  const lastWeekStart = startOfWeek(lastWeekEnd, locale);
  return {
    start: startOfDayClone(calendarDateToLocalDate(lastWeekStart)),
    end: endOfDayClone(calendarDateToLocalDate(lastWeekEnd)),
  };
}

/**
 * True when the CMS row is "Last Week" (calendar week), not "Last 7 days" (rolling).
 * Matches explicit PresentValue tokens or label/name text (PresentValue may still be `7` in CMS).
 */
export function isLastWeekCalendarPresetItem(item: OrderManagementDatePresetItem): boolean {
  const present = String(item.fields?.PresentValue?.value ?? "")
    .trim()
    .toLowerCase();
  if (LAST_WEEK_PRESENT_VALUES.has(present)) {
    return true;
  }

  const labelSources = [item.fields?.PresentLabel?.value, item.displayName, item.name]
    .filter((s): s is string => Boolean(s?.trim()))
    .map((s) => s.trim().toLowerCase());

  return labelSources.some((text) => {
    const isWeekPreset =
      /\blast\s+week\b/.test(text) || /\bprevious\s+week\b/.test(text);
    if (!isWeekPreset) return false;
    if (/\b7\b/.test(text) || /\bseven\b/.test(text) || /\b7\s*days?\b/.test(text)) {
      return false;
    }
    return true;
  });
}

export type DateRangeFromPresetOptions = {
  /** BCP47 / next-intl locale — week boundaries for "Last Week". Defaults to `en`. */
  locale?: string;
};

/**
 * Maps a CMS preset to a concrete range. PresentValue "" = Custom (no auto range).
 * PresentValue is day offset: 0 = today only; N ≥ 1 = last N calendar days ending yesterday (today excluded).
 * "Last Week" uses {@link getPreviousCalendarWeekRange} (previous completed calendar week).
 */
export function dateRangeFromPresetItem(
  item: OrderManagementDatePresetItem,
  options?: DateRangeFromPresetOptions
): DateRangeValue | null {
  const raw = item.fields?.PresentValue?.value;
  if (raw === undefined || raw === null) return null;
  const v = String(raw).trim();
  if (v === "") return null;

  if (isLastWeekCalendarPresetItem(item)) {
    return getPreviousCalendarWeekRange(options?.locale ?? "en");
  }

  if (v === "365") {
    return getDefaultLast12MonthsRange();
  }

  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 0) return null;

  const now = new Date();

  if (n === 0) {
    const start = startOfDayClone(now);
    return { start, end: endOfDayClone(now) };
  }

  const start = startOfDayClone(now);
  start.setDate(start.getDate() - n);

  const yesterday = startOfDayClone(now);
  yesterday.setDate(yesterday.getDate() - 1);

  return { start, end: endOfDayClone(yesterday) };
}

/**
 * Finds a CMS date preset by {@link OrderManagementTabFields.DefaultSelection} (name / displayName).
 */
export function findDatePresetItemByDefaultSelectionName(
  presets: OrderManagementDatePresetItem[] | undefined,
  defaultNameRaw: string | undefined | null
): OrderManagementDatePresetItem | undefined {
  if (defaultNameRaw === undefined || defaultNameRaw === null) return undefined;
  const key = String(defaultNameRaw).trim().toLowerCase();
  if (!key) return undefined;
  return presets?.find(
    (p) => p.name?.trim().toLowerCase() === key || p.displayName?.trim().toLowerCase() === key
  );
}

export function resolveDefaultPresetFromCms(
  tabFields: {
    DatePickerSelection?: OrderManagementDatePresetItem[];
    DefaultSelection?: Field<string>;
  },
  options?: DateRangeFromPresetOptions
): { presetId: string; range: DateRangeValue } {
  const presets = tabFields.DatePickerSelection ?? [];

  const fromTabDefault = findDatePresetItemByDefaultSelectionName(
    presets,
    tabFields.DefaultSelection?.value
  );
  if (fromTabDefault) {
    if (isCustomPresetItem(fromTabDefault)) {
      /* Custom has no range until user picks dates — fall through to legacy defaults */
    } else {
      const range = dateRangeFromPresetItem(fromTabDefault, options);
      if (
        range &&
        isRangeWithinMaxYearsInclusive(range.start, range.end, MAX_ORDER_DATE_RANGE_YEARS)
      ) {
        return { presetId: fromTabDefault.id, range };
      }
    }
  }

  const last12 = presets.find((p) => String(p.fields?.PresentValue?.value).trim() === "365");
  if (last12) {
    const range = dateRangeFromPresetItem(last12, options);
    if (
      range &&
      isRangeWithinMaxYearsInclusive(range.start, range.end, MAX_ORDER_DATE_RANGE_YEARS)
    ) {
      return { presetId: last12.id, range };
    }
  }
  return { presetId: PRESET_LAST_12_MONTHS_ID, range: getDefaultLast12MonthsRange() };
}

/**
 * Parses `RollingDuration` (days backward from today, inclusive).
 */
export function parseRollingDurationDaysFromTab(
  tabFields: Pick<OrderManagementTabFields, "RollingDuration"> | null | undefined
): number | null {
  const raw = tabFields?.RollingDuration?.value;
  if (raw === undefined || raw === null) return null;
  const n = parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return n;
}

export type OrderManagementDateFieldSegmentTexts = {
  year: string;
  month: string;
  day: string;
};

/** True when the year segment shows a complete four-digit calendar year. */
export function isOrderManagementDateYearSegmentComplete(yearText: string): boolean {
  const digits = yearText.replace(/\D/g, "");
  if (digits.length !== 4) return false;
  const y = Number(digits);
  return Number.isFinite(y) && y >= 1000 && y <= 9999;
}

/**
 * True when a React Aria {@link DateField} value is a complete, valid calendar day (4-digit year).
 */
export function isValidOrderManagementDateFieldValue(
  value: { year: number; month: number; day: number } | null | undefined
): boolean {
  if (value == null) return false;
  if (value.year < 1000 || value.year > 9999) return false;
  if (value.month < 1 || value.month > 12 || value.day < 1 || value.day > 31) return false;
  const ymd = `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;
  return parseIsoYmdToLocalDate(ymd) != null;
}

/**
 * Validates a manual date field on blur: year segment must be complete and value must be a real date.
 */
export function isOrderManagementDateFieldCompleteOnBlur(
  value: { year: number; month: number; day: number } | null | undefined,
  segments: OrderManagementDateFieldSegmentTexts,
  interacted: boolean
): boolean {
  if (!interacted) return true;
  if (!isOrderManagementDateYearSegmentComplete(segments.year)) return false;
  return isValidOrderManagementDateFieldValue(value);
}

/** True when a draft YMD string is non-empty but not a valid `YYYY-MM-DD` calendar day. */
export function isInvalidOrderManagementDraftYmd(raw: string): boolean {
  const t = raw.trim();
  if (!t) return false;
  return parseIsoYmdToLocalDate(t) == null;
}

/**
 * Strict `YYYY-MM-DD` parsed as a local calendar date; rejects invalid calendar days.
 */
export function parseIsoYmdToLocalDate(raw: string): Date | null {
  const t = raw.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, mo - 1, d, 12, 0, 0, 0);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

/**
 * Inclusive number of calendar days from {@link start} through {@link end} (same day = 1).
 */
export function inclusiveCalendarDaysBetween(start: Date, end: Date): number {
  const s = startOfLocalCalendarDay(start).getTime();
  const e = startOfLocalCalendarDay(end).getTime();
  if (e < s) return 0;
  return Math.round((e - s) / 86400000) + 1;
}

/**
 * True when the selected calendar-day range contains more than {@link maxDays} inclusive days.
 */
export function rangeSpanExceedsMaxCalendarDays(
  start: Date,
  end: Date,
  maxDays: number
): boolean {
  if (end < start) return false;
  return inclusiveCalendarDaysBetween(start, end) > maxDays;
}

/**
 * True when {@link end} (calendar day) is after {@link start} + {@link maxMonths} whole months
 * (same calendar day one year later when maxMonths is 12). Equal to that boundary day is allowed.
 */
export function rangeSpanExceedsMaxCalendarMonths(
  start: Date,
  end: Date,
  maxMonths: number
): boolean {
  const s = startOfLocalCalendarDay(start).getTime();
  const e = startOfLocalCalendarDay(end).getTime();
  if (e < s) return false;
  const limit = new Date(s);
  limit.setMonth(limit.getMonth() + maxMonths);
  const limitT = startOfLocalCalendarDay(limit).getTime();
  return e > limitT;
}

/**
 * True when both start and end (calendar days) lie within [today − N days, today], inclusive.
 * Does **not** enforce maximum span; use {@link inclusiveCalendarDaysBetween} against rolling N for that.
 */
export function isDateRangeWithinCalendarBounds(
  start: Date,
  end: Date,
  maxDaysBackFromToday: number,
  now: Date = new Date()
): boolean {
  if (end < start) return false;
  const minStart = startOfDayClone(now);
  minStart.setDate(minStart.getDate() - maxDaysBackFromToday);
  const maxEndDay = startOfLocalCalendarDay(now).getTime();
  const s = startOfLocalCalendarDay(start).getTime();
  const e = startOfLocalCalendarDay(end).getTime();
  const lo = startOfLocalCalendarDay(minStart).getTime();
  return s >= lo && e <= maxEndDay;
}

/**
 * @deprecated Use {@link isDateRangeWithinCalendarBounds} plus span checks; name was ambiguous.
 */
export function isDateRangeWithinRollingWindow(
  start: Date,
  end: Date,
  maxDaysBackFromToday: number,
  now?: Date
): boolean {
  return isDateRangeWithinCalendarBounds(start, end, maxDaysBackFromToday, now);
}

export function isCustomPresetItem(item: OrderManagementDatePresetItem): boolean {
  return String(item.fields?.PresentValue?.value ?? "").trim() === "";
}

export function findPresetById(
  presets: OrderManagementDatePresetItem[] | undefined,
  id: string
): OrderManagementDatePresetItem | undefined {
  return presets?.find((p) => p.id === id);
}

/** Same calendar start/end days (uses {@link toYmd}). */
export function dateRangesEqualCalendar(a: DateRangeValue, b: DateRangeValue): boolean {
  return toYmd(a.start) === toYmd(b.start) && toYmd(a.end) === toYmd(b.end);
}

/**
 * Maps stored `selectedPresetId` + applied range to the CMS preset id that should drive labels and the
 * left-rail selection. Fixes cases where the id is still {@link PRESET_CUSTOM_ID} after Apply (flush) or
 * virtual {@link PRESET_LAST_12_MONTHS_ID} while the range matches a concrete CMS preset (Last 7 days, …).
 */
export function resolveAppliedDatePresetId(
  selectedPresetId: string,
  dateRange: DateRangeValue | null,
  presets: OrderManagementDatePresetItem[] | undefined,
  options?: DateRangeFromPresetOptions
): string {
  if (!dateRange) return selectedPresetId;

  const list = presets ?? [];
  const matchingIds: string[] = [];
  const seen = new Set<string>();

  for (const p of list) {
    if (isCustomPresetItem(p)) continue;
    const pr = dateRangeFromPresetItem(p, options);
    if (pr && dateRangesEqualCalendar(pr, dateRange) && !seen.has(p.id)) {
      seen.add(p.id);
      matchingIds.push(p.id);
    }
  }

  const last12Virtual = getDefaultLast12MonthsRange();
  if (dateRangesEqualCalendar(last12Virtual, dateRange)) {
    const cms365 = list.find((x) => String(x.fields?.PresentValue?.value).trim() === "365");
    if (cms365) {
      if (!seen.has(cms365.id)) {
        seen.add(cms365.id);
        matchingIds.push(cms365.id);
      }
    } else if (!seen.has(PRESET_LAST_12_MONTHS_ID)) {
      seen.add(PRESET_LAST_12_MONTHS_ID);
      matchingIds.push(PRESET_LAST_12_MONTHS_ID);
    }
  }

  if (matchingIds.length === 0) {
    const selectedItem = findPresetById(list, selectedPresetId);
    if (selectedItem && isCustomPresetItem(selectedItem)) return selectedPresetId;
    if (selectedPresetId === PRESET_CUSTOM_ID) return selectedPresetId;
    return PRESET_CUSTOM_ID;
  }

  if (matchingIds.includes(selectedPresetId)) return selectedPresetId;

  const cms365 = list.find((x) => String(x.fields?.PresentValue?.value).trim() === "365");
  if (cms365 && matchingIds.includes(cms365.id)) return cms365.id;

  return matchingIds[0]!;
}

/**
 * Toolbar label: CMS preset name (Today, Last 12 Months, …) when the applied selection is a non-custom
 * preset; date range text when the selection is Custom / {@link PRESET_CUSTOM_ID}.
 */
export function getOrderManagementDateTriggerLabel(
  selectedPresetId: string,
  dateRange: DateRangeValue | null,
  presets: OrderManagementDatePresetItem[] | undefined,
  locale: string
): string {
  if (!dateRange) return "";

  const effectivePresetId = resolveAppliedDatePresetId(selectedPresetId, dateRange, presets, {
    locale,
  });

  const rangeText = (): string =>
    `${formatLocaleDateShort(dateRange.start, locale)} – ${formatLocaleDateShort(dateRange.end, locale)}`;

  if (effectivePresetId === PRESET_CUSTOM_ID) {
    return rangeText();
  }

  const list = presets ?? [];
  const item = findPresetById(list, effectivePresetId);

  if (item && isCustomPresetItem(item)) {
    return rangeText();
  }

  if (effectivePresetId === PRESET_LAST_12_MONTHS_ID) {
    const last12 = list.find((p) => String(p.fields?.PresentValue?.value).trim() === "365");
    const label = last12?.fields?.PresentLabel?.value?.trim() || last12?.displayName?.trim();
    if (label) return label;
    return rangeText();
  }

  if (item && !isCustomPresetItem(item)) {
    const label = item.fields?.PresentLabel?.value?.trim() || item.displayName?.trim();
    if (label) return label;
  }

  return rangeText();
}
