import type { Field, ImageField } from "@sitecore-content-sdk/nextjs";

import type { OrderManagementDatePresetItem } from "@/components/core/OrderManagement/OrderManagement.type";
import type { DashboardRecentOrderRow, DashboardRecentQuoteRow } from "@/lib/apis/dashboard-recent-data-api";
import { getOrderDetail } from "@/lib/apis/order-detail-api";
import {
  mapApiOrderRowToListItem,
  mapOrderStatusToKey,
  type OrderLineItem,
  type OrderListItem,
  type OrdersApiOrderRow,
} from "@/lib/apis/orders-api";
import { parseQuoteRouteIdToOrderHeaderId } from "@/lib/apis/quote-detail-api";
import { mapOrderDetailApiToOrderListItemAndLines } from "@/lib/orderDetailUtils";
import {
  resolveOrderDetailHeaderStatusVariant,
  type OrderDetailHeaderStatusVariant,
} from "@/lib/orderDetailUtils";
import {
  findDatePresetItemByDefaultSelectionName,
} from "@/lib/orderManagementUtils";

export const DEFAULT_RECENT_WIDGET_DAYS = 365;

/** Date preset fields on a tab item inside `DateDefaultSelectionCriteria`. */
export interface RecentWidgetDateRangeTabFields {
  DefaultSelection?: Field<string>;
  DatePickerSelection?: OrderManagementDatePresetItem[];
}

/** One Sitecore row in `DateDefaultSelectionCriteria` (e.g. Orders Tab, Quotes Tab). */
export interface RecentWidgetDateDefaultSelectionCriteriaItem {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: RecentWidgetDateRangeTabFields;
}

/** CMS date-range fields on recent order/quote dashboard widgets. */
export interface RecentWidgetDateRangeFields {
  DateDefaultSelectionCriteria?: RecentWidgetDateDefaultSelectionCriteriaItem[];
}

export interface ResolvedRecentWidgetDateRange {
  days: number;
  label: string;
}

function extractTabDateRangeFields(
  fields: RecentWidgetDateRangeFields | null | undefined
): RecentWidgetDateRangeTabFields | undefined {
  const criteria = fields?.DateDefaultSelectionCriteria;
  if (!criteria?.length) return undefined;
  return criteria[0]?.fields;
}

/**
 * Resolves API day count from `DatePickerSelection` + UI label from `DefaultSelection`.
 * Reads from `DateDefaultSelectionCriteria[0].fields` (tab datasource from Sitecore).
 */
export function resolveRecentWidgetDateRangeFromCms(
  fields: RecentWidgetDateRangeFields | null | undefined
): ResolvedRecentWidgetDateRange {
  const tabFields = extractTabDateRangeFields(fields);
  const presets = tabFields?.DatePickerSelection ?? [];
  const defaultSelectionRaw = tabFields?.DefaultSelection?.value;
  const defaultSelection =
    defaultSelectionRaw != null ? String(defaultSelectionRaw).trim() : "";

  const matched = findDatePresetItemByDefaultSelectionName(presets, defaultSelection);

  const label =
    defaultSelection ||
    matched?.fields?.PresentLabel?.value?.trim() ||
    matched?.displayName?.trim() ||
    "Last 12 Months";

  let days = DEFAULT_RECENT_WIDGET_DAYS;
  if (matched) {
    const presentValue = String(matched.fields?.PresentValue?.value ?? "").trim();
    if (presentValue !== "") {
      const parsed = Number.parseInt(presentValue, 10);
      if (Number.isFinite(parsed) && parsed >= 0) {
        days = parsed;
      }
    }
  }

  return { days, label };
}

/** Maps order status variant to aside row tone (CSS module maps in the widget). */
export type RecentOrderAsideStatusTone = "shipped" | "cancelled" | "muted";

/** Default quote validity window (days from quote date) when API does not send `expiresInDays`. Align with DXP if exposed later. */
export const RECENT_QUOTE_READY_VALIDITY_DAYS = 30;

function startOfLocalDay(d: Date): Date {
  const x = new Date(d.getTime());
  x.setHours(0, 0, 0, 0);
  return x;
}

function addLocalCalendarDays(d: Date, days: number): Date {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + days);
  return x;
}

/**
 * Calendar days from start of today until the quote’s default expiry (quote date + validity window).
 * Used for Ready/Open quotes when `expiresInDays` is not returned by the API.
 */
export function computeReadyQuoteExpiresInCalendarDays(
  quoteDateIso: string,
  validityDays: number = RECENT_QUOTE_READY_VALIDITY_DAYS
): number {
  const quoteDate = new Date(quoteDateIso);
  if (Number.isNaN(quoteDate.getTime())) return 0;
  const quoteDay = startOfLocalDay(quoteDate);
  const expiryDay = addLocalCalendarDays(quoteDay, validityDays);
  const today = startOfLocalDay(new Date());
  const diffMs = expiryDay.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / 86400000));
}

/**
 * Formats the `YYYY-MM-DD` prefix from an API datetime string (no timezone conversion).
 */
function formatApiResponseDateShort(iso: string, locale: string): string {
  const trimmed = String(iso ?? "").trim();
  if (!trimmed) return "";

  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return "";

  const year = Number.parseInt(match[1], 10);
  const monthIndex = Number.parseInt(match[2], 10) - 1;
  const day = Number.parseInt(match[3], 10);
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || !Number.isFinite(day)) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, monthIndex, day, 12, 0, 0)));
  } catch {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
}

export function formatPlacedLabel(iso: string, locale: string): string {
  const formatted = formatApiResponseDateShort(iso, locale);
  return formatted ? `Placed ${formatted}` : "Placed —";
}

/** Figma: subtitle next to section title (e.g. "Last 12 months"). */
export function formatRecentWindowLabel(recentDays: number | undefined): string {
  const d = typeof recentDays === "number" && Number.isFinite(recentDays) && recentDays > 0 ? recentDays : 365;
  if (d >= 335) return "Last 12 months";
  if (d >= 60) return `Last ${Math.round(d / 30)} months`;
  if (d >= 28) return "Last 1 month";
  return `Last ${d} days`;
}

/** Figma primary line: `PO #283744  |  Order #3847239` */
export function formatPoLineForWidget(poRaw: string | undefined): string {
  const raw = (poRaw ?? "").trim();
  if (!raw) return "PO #—";
  if (/^po\s*#/i.test(raw)) return raw;
  const n = raw.replace(/^PO[-\s]*/i, "").replace(/^#/, "").trim();
  return n ? `PO #${n}` : "PO #—";
}

export function isShippedRow(row: DashboardRecentOrderRow): boolean {
  const st = row.orderStatus?.trim().toLowerCase() ?? "";
  if (st === "shipped") return true;
  return Boolean(
    row.shippingDetails?.some((s) => (s.shipmentStatus ?? "").trim().toLowerCase() === "shipped")
  );
}

export function orderBadgeVariant(row: DashboardRecentOrderRow): OrderDetailHeaderStatusVariant {
  if (isShippedRow(row)) return "shipped";
  const st = row.orderStatus?.trim().toUpperCase() ?? "";
  if (st === "BOOKED" || st === "PLACED" || st === "CONFIRMED") return "placed";
  return resolveOrderDetailHeaderStatusVariant(mapOrderStatusToKey(row.orderStatus ?? ""));
}

export function orderBadgeLabel(row: DashboardRecentOrderRow): string {
  if (isShippedRow(row)) return "Shipped";
  const st = row.orderStatus?.trim().toUpperCase() ?? "";
  if (st === "BOOKED" || st === "PLACED") return "Placed";
  return row.orderStatus || "—";
}

export function getRecentOrderAsideStatusTone(variant: OrderDetailHeaderStatusVariant): RecentOrderAsideStatusTone {
  if (variant === "shipped") return "shipped";
  if (variant === "cancelled") return "cancelled";
  return "muted";
}

export function statusIconField(
  row: DashboardRecentOrderRow,
  placedIcon: ImageField | undefined,
  shippedIcon: ImageField | undefined
): ImageField | undefined {
  if (isShippedRow(row)) return shippedIcon;
  const v = orderBadgeVariant(row);
  if (v === "placed") return placedIcon;
  return undefined;
}

export function formatCreatedLabel(iso: string, locale: string): string {
  const formatted = formatApiResponseDateShort(iso, locale);
  return formatted ? `Created ${formatted}` : "Created —";
}

export function isQuoteExpiredRow(row: DashboardRecentQuoteRow): boolean {
  const st = (row.status ?? "").trim().toLowerCase();
  if (st.includes("expired")) return true;
  if (row.expiresInDays != null && row.expiresInDays < 0) return true;
  return false;
}

/** Ready/Open (active) quotes: show computed “Expires in …” when API omits `expiresInDays`. */
export function isQuoteReadyStatus(row: DashboardRecentQuoteRow): boolean {
  const s = (row.status ?? "").trim().toLowerCase();
  return s === "ready" || s === "open";
}

export function formatExpiredDateLabel(iso: string, locale: string): string {
  const formatted = formatApiResponseDateShort(iso, locale);
  return formatted ? `Expired ${formatted}` : "Expired —";
}

export function expiresSubline(row: DashboardRecentQuoteRow, locale: string): string | null {
  if (isQuoteExpiredRow(row)) {
    const iso = String(row.expirationDate ?? row.quoteDate ?? "").trim();
    if (!iso) return null;
    return formatExpiredDateLabel(iso, locale);
  }
  if (row.expiresInDays != null && row.expiresInDays >= 0) {
    return row.expiresInDays === 1 ? "Expires in 1 day" : `Expires in ${row.expiresInDays} days`;
  }
  if (isQuoteReadyStatus(row)) {
    const n = computeReadyQuoteExpiresInCalendarDays(row.quoteDate);
    if (n <= 0) return "Expires today";
    return n === 1 ? "Expires in 1 day" : `Expires in ${n} days`;
  }
  return null;
}

export function quoteWidgetStatusIconField(
  row: DashboardRecentQuoteRow,
  readyIcon: ImageField | undefined,
  expiredIcon: ImageField | undefined
): ImageField | undefined {
  return isQuoteExpiredRow(row) ? expiredIcon : readyIcon;
}

/** Figma-style `#` prefix for quote id / legacy quote number strings. */
export function formatQuoteNumberDisplay(raw: string | undefined): string {
  const t = (raw ?? "").trim();
  if (!t) return "#—";
  if (t.startsWith("#")) return t;
  return `#${t.replace(/^QT[-\s]*/i, "").trim() || t}`;
}

/**
 * Maps a dashboard recent-order API row to {@link OrderListItem}, including `lineItems`
 * flattened from `shippingDetails[].lineItems` (same contract as POST /orders list rows).
 */
/** Numeric `orderHeaderId` for GET order detail from a dashboard recent-quote row. */
export function resolveRecentQuoteOrderHeaderId(row: DashboardRecentQuoteRow): number | null {
  const routeId = (row.quoteHeaderId?.trim() || row.quoteId).trim();
  return parseQuoteRouteIdToOrderHeaderId(routeId);
}

/** Whether the row can load line items via order detail (menu + actions). */
export function recentQuoteRowCanLoadOrderLines(row: DashboardRecentQuoteRow): boolean {
  if (!resolveRecentQuoteOrderHeaderId(row)) return false;
  if (row.itemCount == null) return true;
  return row.itemCount > 0;
}

/** Loads order lines for a recent-quote row (same GET as quote detail). */
export async function fetchOrderLinesForRecentQuoteRow(
  row: DashboardRecentQuoteRow,
  accountId: number
): Promise<{ order: OrderListItem; lines: OrderLineItem[] } | null> {
  const orderHeaderId = resolveRecentQuoteOrderHeaderId(row);
  if (!orderHeaderId || !accountId) return null;
  const res = await getOrderDetail({ orderHeaderId, accountId });
  if (!res.success || !res.data) return null;
  const mapped = mapOrderDetailApiToOrderListItemAndLines(res.data);
  if (mapped.lines.length === 0) return null;
  return mapped;
}

export function mapDashboardRecentOrderRowToOrderListItem(row: DashboardRecentOrderRow): OrderListItem {
  const apiRow: OrdersApiOrderRow = {
    orderId: row.orderId,
    orderHeaderId: row.orderHeaderId,
    poNumber: row.poNumber,
    orderNumber: row.orderNumber,
    itemsCount: row.itemsCount,
    orderDate: row.orderDate,
    orderStatus: row.orderStatus,
    totalAmount: {
      value: row.totalAmount.value,
      currency: row.totalAmount.currency,
      displayValue: row.totalAmount.displayValue,
    },
    shippingDetails: row.shippingDetails,
  };
  return mapApiOrderRowToListItem(apiRow);
}
