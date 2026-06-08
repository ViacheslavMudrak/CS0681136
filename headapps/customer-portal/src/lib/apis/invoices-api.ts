import type { OrderManagementSearchAttributeItem } from "@/components/core/OrderManagement/OrderManagement.type";
import { API_ROUTES } from "@/lib/apis/api-routes";
import { request } from "@/lib/apis/api-service";
import {
  formatInvoiceDueInFromCalendarDays,
  invoiceDueInCalendarDays,
  normalizeListTotalRecords,
  parseInvoiceDueInDaysFromApiString,
} from "@/lib/orderManagementUtils";

/**
 * Invoice list API table fields used for full-text search and for `sorting[].sortBy`
 * (POST /invoices — align with backend column names).
 */
export const INVOICES_API_TABLE_FIELD_NAMES = [
  "invoiceID",
  "invoiceNum",
  "poNumber",
  "orderId",
  "orderHeaderId",
  "invoiceDate",
  "dueIn",
  "invoiceStatus",
  "amountDue",
] as const;

export type InvoicesApiTableFieldName = (typeof INVOICES_API_TABLE_FIELD_NAMES)[number];

/** Value for POST /invoices `sorting[].sortBy` — must match an API table column name. */
export type InvoicesApiSortByField = InvoicesApiTableFieldName;

/** Request body for POST /invoices (DXP list — contract TBD until backend ships). */
export interface InvoicesListRequestBody {
  accountId: number;
  invoiceDateFrom: string;
  invoiceDateTo: string;
  /** When set (e.g. from `?orderHeaderId=` on Invoices tab), scopes list to that order header. */
  orderHeaderId?: number;
  search: string;
  /** Columns the API applies `search` against (same shape as POST /orders `searchIn`). */
  searchIn?: string[];
  /** Filter values for server-side status filtering (same shape as POST /orders `orderStatus`). */
  invoiceStatus?: string[];
  pagination: {
    page: number;
    pageSize: number;
  };
  sorting: Array<{
    sortBy: InvoicesApiSortByField;
    sortDirection: string;
  }>;
}

export interface DxpInvoicesApiAmount {
  value: number;
  currency: string;
  displayValue?: string;
}

/**
 * One invoice row from POST /invoices — supports legacy DXP names and current API names
 * (`invoiceID`, `invoiceNum`, `amountDue`, `dueIn`, `documentUrl`, etc.).
 */
export interface DxpInvoicesApiInvoiceRow {
  invoiceId?: number;
  invoiceID?: number;
  invoiceNumber?: string;
  invoiceNum?: string;
  poNumber?: string;
  orderNumber?: number | string;
  orderId?: number;
  orderHeaderId?: number;
  invoiceStatus?: string;
  invoiceDate?: string;
  /** Some responses use this as the invoice / anchor date when `invoiceDate` is absent. */
  invoiceData?: string;
  /** ISO due date when provided. */
  dueDate?: string | null;
  /** Human-readable due window from API (e.g. `"30 Days"`) when `dueDate` is absent. */
  dueIn?: string;
  invoiceAmount?: DxpInvoicesApiAmount;
  amountDue?: DxpInvoicesApiAmount;
  downloadUrl?: string | null;
  /** Alternate download field from API — merged into {@link InvoiceRecord.downloadUrl}. */
  documentUrl?: string | null;
}

export interface DxpInvoicesApiResponse {
  success: boolean;
  statusCode: number;
  methodName?: string;
  message: string;
  data: {
    totalRecords?: number;
    invoices: DxpInvoicesApiInvoiceRow[];
  } | null;
  errors: unknown;
}

/** Sort keys for the Invoices tab (aligned with {@link InvoiceSortColumnId} in orderManagementUtils). */
export type InvoicesTabSortColumn =
  | "invoiceNumber"
  | "poNumber"
  | "orderNumber"
  | "invoiceStatus"
  | "invoiceDate"
  | "dueIn"
  | "invoiceAmount";

export interface InvoicesListQueryParams {
  accountId: string | number;
  invoiceDateFrom: string;
  invoiceDateTo: string;
  page: number;
  pageSize: number;
  sortDirection: "asc" | "desc";
  sortColumn: InvoicesTabSortColumn;
  /** Free-text search sent to DXP `search`. */
  search?: string;
  /** API field names for `search` (orders list: `searchIn`). */
  searchIn?: string[];
  /** Status filter values for DXP (orders list: `orderStatus`). */
  invoiceStatus?: string[];
  /** Parsed from OM URL `orderHeaderId` when present (Invoices tab only). */
  orderHeaderId?: number;
}

export interface InvoiceRecord {
  invoiceId: string;
  invoiceNumber: string;
  poNumber: string;
  orderNumber: string;
  orderHeaderId: string;
  statusKey: string;
  invoiceDate: string;
  /** Optional DXP field used as due anchor when `dueDate` is missing (before `invoiceDate`). */
  invoiceData?: string | null;
  dueDate: string | null;
  /**
   * When API `dueIn` is parseable (e.g. `"0 Days"`, `"10 days"`), used as days-until-due for display/sort.
   * Otherwise `invoiceDueInCalendarDays` falls back to calendar math from due/invoice dates.
   */
  dueInDaysFromApi?: number;
  /**
   * Client-derived Due In label from calendar days (Due Date − Today, or Invoice Date − Today when API omits due date),
   * or API `dueIn` when no date anchor exists.
   */
  dueInDisplay?: string | null;
  amount: number;
  currency: string;
  /** Resolved from API `downloadUrl` and/or `documentUrl`. */
  downloadUrl?: string | null;
}

export interface GetInvoicesListResult {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    totalRecords?: number;
    invoices: InvoiceRecord[];
  } | null;
  errors: unknown;
}

export function mapInvoiceStatusToKey(invoiceStatus: string): string {
  const t = invoiceStatus.trim().toLowerCase();
  if (t === "invoiced" || t === "invoice_invoiced") return "invoice_invoiced";
  if (t === "paid" || t === "invoice_paid") return "invoice_paid";
  return `invoice_${t.replace(/\s+/g, "_")}`;
}

/** CMS SearchAttribute label → POST /invoices `searchIn` column (orders list uses different names, e.g. `orderId` not `orderNumber`). */
const CMS_INVOICE_SEARCH_LABEL_TO_FIELD: Record<string, InvoicesApiTableFieldName> = {
  "po number": "poNumber",
  po: "poNumber",
  "po #": "poNumber",
  "order number": "orderId",
  order: "orderId",
  "order #": "orderId",
  "order id": "orderId",
  "order header id": "orderHeaderId",
  "invoice number": "invoiceNum",
  "invoice #": "invoiceNum",
  "invoice id": "invoiceID",
  "invoice date": "invoiceDate",
  "due in": "dueIn",
  due: "dueIn",
  "invoice status": "invoiceStatus",
  "amount due": "amountDue",
  amount: "amountDue",
};

function cmsInvoiceSearchLabelToField(label: string): InvoicesApiTableFieldName | null {
  const key = label.trim().toLowerCase().replace(/\s+/g, " ");
  return CMS_INVOICE_SEARCH_LABEL_TO_FIELD[key] ?? null;
}

function resolveInvoiceSearchInFieldFromCmsAttribute(
  attr: OrderManagementSearchAttributeItem
): InvoicesApiTableFieldName | null {
  const valueLabel = attr.fields?.Value?.value?.trim() ?? "";
  const displayLabel = attr.displayName?.trim() ?? "";
  return (
    (valueLabel ? cmsInvoiceSearchLabelToField(valueLabel) : null) ??
    (displayLabel ? cmsInvoiceSearchLabelToField(displayLabel) : null)
  );
}

/**
 * Builds `searchIn` from tab SearchAttribute in CMS order (deduped).
 */
export function resolveInvoiceSearchInFromCmsSearchAttributes(
  attrs: OrderManagementSearchAttributeItem[] | undefined | null
): InvoicesApiTableFieldName[] {
  const out: InvoicesApiTableFieldName[] = [];
  for (const a of attrs ?? []) {
    const field = resolveInvoiceSearchInFieldFromCmsAttribute(a);
    if (field && !out.includes(field)) out.push(field);
  }
  return out;
}

/** Maps UI invoice sort keys to POST /invoices `sorting[].sortBy` (API table field names). */
export function mapSortColumnIdToInvoicesApiSort(column: InvoicesTabSortColumn): InvoicesApiSortByField {
  const map: Record<InvoicesTabSortColumn, InvoicesApiSortByField> = {
    invoiceNumber: "invoiceNum",
    poNumber: "poNumber",
    orderNumber: "orderId",
    invoiceStatus: "invoiceStatus",
    invoiceDate: "invoiceDate",
    dueIn: "dueIn",
    invoiceAmount: "amountDue",
  };
  return map[column];
}

function mapSortDirectionToApi(direction: "asc" | "desc"): string {
  return direction === "asc" ? "Asc" : "Desc";
}

function firstNonEmptyUrl(...urls: (string | null | undefined)[]): string | null {
  for (const u of urls) {
    const t = typeof u === "string" ? u.trim() : "";
    if (t) return t;
  }
  return null;
}

export function mapApiInvoiceRowToRecord(row: DxpInvoicesApiInvoiceRow): InvoiceRecord {
  const id = row.invoiceID ?? row.invoiceId;
  const invNum = row.invoiceNum ?? row.invoiceNumber;
  const orderRef = row.orderNumber ?? row.orderId ?? row.orderHeaderId;
  const amountBlock = row.amountDue ?? row.invoiceAmount;
  const amt = amountBlock?.value ?? 0;
  const currency = amountBlock?.currency ?? "USD";
  const due = row.dueDate?.trim() ? row.dueDate.trim() : null;
  const dueInText =
    typeof row.dueIn === "string" && row.dueIn.trim() ? row.dueIn.trim() : null;
  const dueInDaysFromApi = parseInvoiceDueInDaysFromApiString(dueInText);
  const docUrl = firstNonEmptyUrl(row.documentUrl, row.downloadUrl);
  const invoiceData =
    typeof row.invoiceData === "string" && row.invoiceData.trim() ? row.invoiceData.trim() : null;

  const record: InvoiceRecord = {
    invoiceId: String(id ?? ""),
    invoiceNumber: String(invNum ?? ""),
    poNumber: row.poNumber ?? "",
    orderNumber: String(orderRef ?? ""),
    orderHeaderId: String(row.orderHeaderId ?? ""),
    statusKey: mapInvoiceStatusToKey(row.invoiceStatus ?? ""),
    invoiceDate: row.invoiceDate ?? "",
    invoiceData,
    dueDate: due,
    ...(dueInDaysFromApi !== null ? { dueInDaysFromApi } : {}),
    dueInDisplay: dueInText,
    amount: amt,
    currency,
    downloadUrl: docUrl,
  };

  const calcDays = invoiceDueInCalendarDays(record);
  if (calcDays !== null) {
    record.dueInDisplay = formatInvoiceDueInFromCalendarDays(calcDays);
  }

  return record;
}

function buildInvoicesRequestBody(params: InvoicesListQueryParams): InvoicesListRequestBody {
  const accountNum =
    typeof params.accountId === "number" ? params.accountId : Number.parseInt(String(params.accountId), 10);
  const sortBy = mapSortColumnIdToInvoicesApiSort(params.sortColumn);
  const sortDirection = mapSortDirectionToApi(params.sortDirection);
  const body: InvoicesListRequestBody = {
    accountId: Number.isFinite(accountNum) ? accountNum : 0,
    invoiceDateFrom: params.invoiceDateFrom,
    invoiceDateTo: params.invoiceDateTo,
    search: params.search?.trim() ?? "",
    searchIn: params.searchIn ?? [],
    invoiceStatus: params.invoiceStatus ?? [],
    pagination: {
      page: Math.max(1, params.page),
      pageSize: Math.max(1, params.pageSize),
    },
    sorting: [{ sortBy, sortDirection }],
  };
    if (
      params.orderHeaderId != null &&
      typeof params.orderHeaderId === "number" &&
      Number.isFinite(params.orderHeaderId) &&
      params.orderHeaderId > 0
    ) {
      body.orderHeaderId = params.orderHeaderId;
    }
  return body;
}

/**
 * Fetches a page of invoices via POST {@link API_ROUTES.INVOICES_LIST}.
 * Wire the route in the API gateway when the listing endpoint is available.
 */
export async function getInvoicesList(
  params: InvoicesListQueryParams
): Promise<GetInvoicesListResult | null> {
  const body = buildInvoicesRequestBody(params);

  const raw = await request<DxpInvoicesApiResponse>({
    method: "POST",
    path: API_ROUTES.INVOICES_LIST,
    body,
    options: {
      headers: {
        requestId: "1",
        language: "1",
        Accept: "application/json",
      },
    },
  });

  const rows = raw.data?.invoices ?? [];
  const mapped = rows.map(mapApiInvoiceRowToRecord);
  const totalRecords = normalizeListTotalRecords(raw.data?.totalRecords, mapped.length);

  return {
    success: raw.success,
    statusCode: raw.statusCode,
    message: raw.message,
    data: raw.data
      ? {
          totalRecords,
          invoices: mapped,
        }
      : null,
    errors: raw.errors,
  };
}
