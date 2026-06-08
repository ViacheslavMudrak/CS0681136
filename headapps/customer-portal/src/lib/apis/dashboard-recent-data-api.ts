import type { OrdersApiOrderListShippingDetail } from "@/lib/apis/orders-api";
import { API_ROUTES } from "@/lib/apis/api-routes";
import { request } from "@/lib/apis/api-service";

/** Amount shape on recent dashboard rows (orders + quotes). */
export interface DashboardRecentAmount {
  value: number;
  currency: string;
  displayValue?: string;
}

/** One order row from GET `/dashboard/recentdata`. */
export interface DashboardRecentOrderRow {
  orderId: number;
  orderHeaderId: number;
  poNumber: string;
  orderNumber: number;
  itemsCount: number;
  orderDate: string;
  orderStatus: string;
  totalAmount: DashboardRecentAmount;
  shippingDetails?: OrdersApiOrderListShippingDetail[];
}

export interface DashboardRecentOrdersBlock {
  page?: number;
  pageSize?: number;
  totalRecords?: number;
  orders: DashboardRecentOrderRow[];
}

/**
 * One quote row from GET `/dashboard/recentdata` (normalized).
 * Display uses {@link DashboardRecentQuoteRow.quoteId}; navigation prefers {@link DashboardRecentQuoteRow.quoteHeaderId}.
 */
export interface DashboardRecentQuoteRow {
  quoteId: string;
  quoteHeaderId?: string;
  quoteDate: string;
  /** e.g. `Ready`, `Expired` */
  status: string;
  contactPersonName?: string;
  /** Fallback label when contact name is absent (legacy / list APIs). */
  description?: string;
  itemCount?: number;
  totalAmount: DashboardRecentAmount;
  documentUrl?: string;
  /** When API sends days-until-expiry (optional). */
  expiresInDays?: number | null;
  /**
   * Preferred ISO date for "Expired Mon D, YYYY" when status is Expired.
   * Falls back to {@link quoteDate} in UI if omitted.
   */
  expirationDate?: string | null;
}

export interface DashboardRecentQuotesBlock {
  pagination?: { page?: number; pageSize?: number };
  totalRecords?: number;
  quotes: DashboardRecentQuoteRow[];
}

export interface DashboardRecentDataPayload {
  accountId?: number;
  recentDays?: number;
  dateFrom?: string;
  dateTo?: string;
  generatedAtUtc?: string;
  orders: DashboardRecentOrdersBlock;
  quotes: DashboardRecentQuotesBlock;
}

export interface DashboardRecentDataEnvelope {
  success: boolean;
  statusCode: number;
  methodName?: string;
  message: string;
  data: DashboardRecentDataPayload | null;
  errors: unknown;
}

export interface FetchDashboardRecentDataParams {
  accountId: number;
  orderCount: number;
  quoteCount: number;
  orderDays: number;
  quoteDays: number;
}

function readAmount(raw: unknown): DashboardRecentAmount {
  if (!raw || typeof raw !== "object") {
    return { value: 0, currency: "USD", displayValue: "0.00" };
  }
  const a = raw as { value?: unknown; currency?: unknown; displayValue?: unknown };
  const value = typeof a.value === "number" ? a.value : Number.parseFloat(String(a.value ?? "0"));
  return {
    value: Number.isFinite(value) ? value : 0,
    currency: String(a.currency ?? "USD"),
    displayValue: a.displayValue != null ? String(a.displayValue) : undefined,
  };
}

/** Coerce DXP quote rows to a stable dashboard shape (string ids, `status`, `totalAmount`, etc.). */
export function normalizeDashboardRecentQuoteRow(raw: unknown): DashboardRecentQuoteRow {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const quoteId = String(r.quoteId ?? "").trim();
  const quoteHeaderIdRaw = r.quoteHeaderId;
  const quoteHeaderId =
    quoteHeaderIdRaw != null && String(quoteHeaderIdRaw).trim() !== ""
      ? String(quoteHeaderIdRaw).trim()
      : undefined;
  const status = String(r.status ?? r.quoteStatus ?? "").trim();
  const itemRaw = r.itemCount;
  const itemCountParsed =
    typeof itemRaw === "number" ? itemRaw : Number.parseInt(String(itemRaw ?? ""), 10);
  const itemCount = Number.isFinite(itemCountParsed) ? itemCountParsed : undefined;

  const expRaw =
    r.expirationDate ?? r.expiryDate ?? r.quoteExpiryDate ?? r.expiresOn ?? r.expiration ?? null;
  const expirationDate =
    expRaw != null && String(expRaw).trim() !== "" ? String(expRaw).trim() : undefined;

  const expiresRaw = r.expiresInDays;
  let expiresInDays: number | null = null;
  if (expiresRaw != null && expiresRaw !== "") {
    const n = typeof expiresRaw === "number" ? expiresRaw : Number.parseInt(String(expiresRaw), 10);
    if (Number.isFinite(n)) expiresInDays = n;
  }

  return {
    quoteId: quoteId || "—",
    quoteHeaderId,
    quoteDate: String(r.quoteDate ?? "").trim(),
    status,
    contactPersonName:
      r.contactPersonName != null && String(r.contactPersonName).trim() !== ""
        ? String(r.contactPersonName).trim()
        : undefined,
    description:
      r.description != null && String(r.description).trim() !== ""
        ? String(r.description).trim()
        : undefined,
    itemCount,
    totalAmount: readAmount(r.totalAmount ?? r.amount),
    documentUrl: r.documentUrl != null ? String(r.documentUrl) : undefined,
    expiresInDays,
    expirationDate,
  };
}

function normalizeDashboardRecentPayload(
  data: DashboardRecentDataPayload
): DashboardRecentDataPayload {
  const quotesIn = (data.quotes?.quotes ?? []) as unknown[];
  return {
    ...data,
    quotes: {
      ...data.quotes,
      quotes: quotesIn.map((q) => normalizeDashboardRecentQuoteRow(q)),
    },
  };
}

/**
 * Loads recent orders + quotes for the dashboard from GET `/dashboard/recentdata`.
 */
export async function fetchDashboardRecentData(
  params: FetchDashboardRecentDataParams
): Promise<DashboardRecentDataPayload> {
  const envelope = await request<DashboardRecentDataEnvelope>({
    method: "GET",
    path: API_ROUTES.DASHBOARD_RECENT_DATA,
    params: {
      accountId: String(params.accountId),
      orderCount: String(params.orderCount),
      quoteCount: String(params.quoteCount),
      orderRecentDays: String(params.orderDays),
      quoteRecentDays: String(params.quoteDays),
    },
  });

  if (!envelope.success || !envelope.data) {
    const msg = envelope.message?.trim() || "Failed to load dashboard recent data.";
    throw new Error(msg);
  }

  return normalizeDashboardRecentPayload(envelope.data);
}
