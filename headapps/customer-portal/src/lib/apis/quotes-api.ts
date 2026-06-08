import type { OrderManagementSearchAttributeItem } from "@/components/core/OrderManagement/OrderManagement.type";
import { API_ROUTES } from "@/lib/apis/api-routes";
import { request } from "@/lib/apis/api-service";
import {
  normalizeCmsStatusKeyToFilterKey,
  type QuoteRecord,
  type SortColumnId,
} from "@/lib/orderManagementUtils";

/** DXP quote list columns for `searchIn` (align with quote row + sort fields). */
export const QUOTES_API_SEARCH_IN_FIELD_NAMES = [
  "quoteId",
  "quoteNumber",
  "contactPersonName",
  "itemCount",
  "status",
  "quoteDate",
  "expiresInDays",
  "totalAmount",
] as const;

export type QuotesApiSearchInField = (typeof QUOTES_API_SEARCH_IN_FIELD_NAMES)[number];

/** Request body for POST quotes list (DXP — quote date range fields, not order dates). */
export interface QuotesListRequestBody {
  accountId: number;
  quoteDateFrom: string;
  quoteDateTo: string;
  search: string;
  searchIn?: string[];
  /** Selected quote statuses for server-side filtering (same role as `orderStatus` / `invoiceStatus`). */
  quoteStatus?: string[];
  pagination: {
    page: number;
    pageSize: number;
  };
  sorting: Array<{
    sortBy: QuotesApiSortByField;
    sortDirection: string;
  }>;
}

/** Raw quote row from DXP (`PostQuoteSearch`). */
export interface DxpQuotesApiQuoteRow {
  quoteId?: number | string;
  /** Route + GET order detail key (`/orders?orderHeaderId=`). */
  quoteHeaderId?: number | string;
  /** Legacy alias when DXP returns `orderHeaderId` instead of `quoteHeaderId`. */
  orderHeaderId?: number | string;
  quoteNumber?: number | string;
  contactPerson?: string;
  contactPersonName?: string;
  contactName?: string;
  itemCount?: number | null;
  itemsCount?: number | null;
  status?: string;
  statusKey?: string;
  quoteDate?: string;
  expiresInDays?: number | null;
  totalAmount?: number | string;
  amount?: number | string;
  currency?: string;
  documentUrl?: string;
  downloadUrl?: string;
}

export interface DxpQuotesApiResponse {
  success: boolean;
  statusCode: number;
  methodName?: string;
  message: string;
  data: {
    totalRecords: number;
    quotes?: DxpQuotesApiQuoteRow[];
  } | null;
  errors: unknown;
}

export interface QuotesListQueryParams {
  accountId: string | number;
  quoteDateFrom: string;
  quoteDateTo: string;
  page: number;
  pageSize: number;
  sortDirection: "asc" | "desc";
  sortColumn: SortColumnId;
  /** Free-text search sent to DXP `search`. */
  search?: string;
  /** API field names for `search` (orders list: `searchIn`). */
  searchIn?: string[];
  /** Status filter values for DXP (orders: `orderStatus`, invoices: `invoiceStatus`). */
  quoteStatus?: string[];
}

const CMS_QUOTE_SEARCH_LABEL_TO_FIELD: Record<string, QuotesApiSearchInField> = {
  "quote id": "quoteId",
  quote: "quoteId",
  "quote number": "quoteNumber",
  "contact name": "contactPersonName",
  "contact person": "contactPersonName",
  contact: "contactPersonName",
  items: "itemCount",
  "item count": "itemCount",
  "quote status": "status",
  status: "status",
  "quote date": "quoteDate",
  "expires in": "expiresInDays",
  expires: "expiresInDays",
  total: "totalAmount",
  "total amount": "totalAmount",
};

function cmsQuoteSearchLabelToField(label: string): QuotesApiSearchInField | null {
  const key = label.trim().toLowerCase().replace(/\s+/g, " ");
  return CMS_QUOTE_SEARCH_LABEL_TO_FIELD[key] ?? null;
}

/**
 * Builds `searchIn` from tab SearchAttribute in CMS order (deduped).
 */
export function resolveQuoteSearchInFromCmsSearchAttributes(
  attrs: OrderManagementSearchAttributeItem[] | undefined | null
): QuotesApiSearchInField[] {
  const fromCms: QuotesApiSearchInField[] = [];
  for (const a of attrs ?? []) {
    const raw = a.fields?.Value?.value ?? a.displayName ?? "";
    const field = cmsQuoteSearchLabelToField(String(raw));
    if (field && !fromCms.includes(field)) fromCms.push(field);
  }
  return fromCms;
}

export interface GetQuotesListResult {
  success: boolean;
  statusCode: number;
  message: string;
  data: { totalRecords: number; quotes: QuoteRecord[] } | null;
  errors: unknown;
}

function mapSortDirectionToApi(direction: "asc" | "desc"): string {
  return direction === "asc" ? "Asc" : "Desc";
}

/** POST quotes `sorting[].sortBy` — camelCase field names from the quotes list API. */
export type QuotesApiSortByField =
  | "quoteId"
  | "contactPersonName"
  | "itemCount"
  | "status"
  | "quoteDate"
  | "expiresInDays"
  | "totalAmount";

/** Maps Quotes grid / UI {@link SortColumnId} to DXP `sortBy`. */
export function mapSortColumnToQuotesApiSort(column: SortColumnId): QuotesApiSortByField {
  if (!column) return "quoteDate";
  const c = column === "orderDate" ? "quoteDate" : column;
  const map: Partial<Record<Exclude<SortColumnId, null>, QuotesApiSortByField>> = {
    quoteId: "quoteId",
    quoteContactPerson: "contactPersonName",
    items: "itemCount",
    quoteStatus: "status",
    quoteDate: "quoteDate",
    quoteExpiresIn: "expiresInDays",
    total: "totalAmount",
    orderDate: "quoteDate",
  };
  return map[c] ?? "quoteDate";
}

function parseQuoteTotalAmount(value: number | string | { value?: number } | undefined | null): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "object" && "value" in value) {
    const v = value.value;
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  const s = String(value).trim();
  if (!s) return 0;
  const normalized = s.replace(/,/g, "");
  const n = Number.parseFloat(normalized.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function parsePositiveIntId(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const n = typeof value === "number" ? value : Number.parseInt(String(value).trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function mapQuoteApiRowToRecord(row: DxpQuotesApiQuoteRow, rowIndex = 0): QuoteRecord {
  const idPart = String(row.quoteId ?? "").trim();
  const numPart = String(row.quoteNumber ?? "").trim();
  const quoteId = idPart || numPart || `quote-row-${rowIndex}`;
  const quoteNumber = numPart || idPart || quoteId;
  const quoteHeaderIdRaw = String(row.quoteHeaderId ?? row.orderHeaderId ?? "").trim();
  const orderHeaderId = parsePositiveIntId(quoteHeaderIdRaw || row.orderHeaderId);
  const rawStatus = String(row.statusKey ?? row.status ?? "READY").trim();
  const itemsRaw = row.itemCount ?? row.itemsCount;
  const itemCountParsed =
    itemsRaw === undefined || itemsRaw === null ? null : Number(itemsRaw);
  return {
    quoteId,
    ...(quoteHeaderIdRaw ? { quoteHeaderId: quoteHeaderIdRaw } : {}),
    ...(orderHeaderId != null ? { orderHeaderId } : {}),
    quoteNumber,
    contactPerson:
      row.contactPersonName?.trim() ||
      row.contactPerson?.trim() ||
      row.contactName?.trim() ||
      "",
    itemCount: itemCountParsed !== null && Number.isFinite(itemCountParsed) ? itemCountParsed : null,
    statusKey: normalizeCmsStatusKeyToFilterKey(rawStatus || "READY"),
    quoteDateIso: row.quoteDate ?? "",
    expiresInDays: row.expiresInDays ?? null,
    totalAmount: parseQuoteTotalAmount(row.totalAmount ?? row.amount),
    currency: row.currency ?? "USD",
    downloadUrl: row.documentUrl?.trim() || row.downloadUrl?.trim() || undefined,
  };
}

function buildQuotesRequestBody(params: QuotesListQueryParams): QuotesListRequestBody {
  const accountNum =
    typeof params.accountId === "number" ? params.accountId : Number.parseInt(String(params.accountId), 10);
  const sortBy = mapSortColumnToQuotesApiSort(params.sortColumn);
  const sortDirection = mapSortDirectionToApi(params.sortDirection);
  return {
    accountId: Number.isFinite(accountNum) ? accountNum : 0,
    quoteDateFrom: params.quoteDateFrom,
    quoteDateTo: params.quoteDateTo,
    search: params.search?.trim() ?? "",
    searchIn: params.searchIn ?? [],
    quoteStatus: params.quoteStatus ?? [],
    pagination: {
      page: Math.max(1, params.page),
      pageSize: Math.max(1, params.pageSize),
    },
    sorting: [{ sortBy, sortDirection }],
  };
}

/**
 * Fetches quotes via POST {@link API_ROUTES.QUOTES_LIST}.
 * Returns `null` when the API base URL is missing or the request fails before a parseable envelope.
 */
export async function getQuotesList(params: QuotesListQueryParams): Promise<GetQuotesListResult | null> {
  const body = buildQuotesRequestBody(params);

  const raw = await request<DxpQuotesApiResponse>({
    method: "POST",
    path: API_ROUTES.QUOTES_LIST,
    body,
    options: {
      headers: {
        requestId: "1",
        language: "1",
        Accept: "application/json",
      },
    },
  });

  if (!raw || typeof raw.success !== "boolean") {
    return null;
  }

  const quotes = (raw.data?.quotes ?? []).map((r, i) => mapQuoteApiRowToRecord(r, i));

  return {
    success: raw.success,
    statusCode: raw.statusCode,
    message: raw.message,
    data: raw.data
      ? {
          totalRecords: raw.data.totalRecords,
          quotes,
        }
      : null,
    errors: raw.errors,
  };
}