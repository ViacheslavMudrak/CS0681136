import type { OrderManagementSearchAttributeItem } from "@/components/core/OrderManagement/OrderManagement.type";
import { API_ROUTES } from "@/lib/apis/api-routes";
import { request } from "@/lib/apis/api-service";
import type { SortColumnId } from "@/lib/orderManagementUtils";
import {
  mapApiOrderRowToListItem,
  mapOrderStatusToKey,
  type GetOrdersListResult,
  type OrderListItem,
  type OrdersApiOrderRow,
} from "@/lib/apis/orders-api";

/** DXP shipment search columns for `searchIn` (align with {@link mapSortColumnToShipmentsApiSort} / list row). */
export const SHIPMENTS_API_SEARCH_IN_FIELD_NAMES = [
  "trackingNumber",
  "carrierName",
  "poNumber",
  "orderNumber",
  "orderId",
  "orderHeaderId",
  "items",
  "shipmentDate",
] as const;

// TODO: Remove after Packing Slip download validation; production should use API-provided documentUrl only.
const TEMP_PACKING_SLIP_DOCUMENT_URL =
  "https://objectstorage.us-ashburn-1.oraclecloud.com/AccountingInvoice/2620867_3701533.pdf";

export type ShipmentsApiSearchInField = (typeof SHIPMENTS_API_SEARCH_IN_FIELD_NAMES)[number];

/** POST `/Shipments/search` request body (aligns with backend contract). */
export interface ShipmentsSearchRequestBody {
  pagination: {
    page: number;
    pageSize: number;
  };
  accountId: number;
  /** When set (e.g. from `?orderHeaderId=` on Shipments tab), scopes search to that order header. */
  orderHeaderId?: number;
  search: string;
  /** API fields to apply `search` against (same role as orders list `searchIn`). */
  searchIn?: string[];
  shipmentStatus: string[];
  shipmentDateFrom: string;
  shipmentDateTo: string;
  sorting: Array<{
    sortBy: string;
    direction: "asc" | "desc";
  }>;
}

/**
 * One row from `data.records` in the Shipment search response.
 */
export interface DxpShipmentSearchRecord {
  shipmentId?: string | number;
  trackingNumber?: string;
  trackingUrl?: string;
  carrierName?: string;
  carrier?: string;
  poNumber?: string;
  orderNumber?: number | string;
  orderHeaderId?: number;
  orderId?: number;
  items?: number;
  itemsCount?: number;
  shipmentDate?: string;
  shippedDate?: string;
  orderDate?: string;
  statusLabel?: string;
  /** Packing slip / document URL from Shipment search (camelCase). */
  documentUrl?: string | null;
  /** Same as {@link documentUrl} when the API returns PascalCase JSON. */
  DocumentUrl?: string | null;
  /** Alternate casing used by some API serializers. */
  documentURL?: string | null;
  /** Transitional aliases until the Shipment search contract is finalized. */
  downloadUrl?: string | null;
  packingSlipDocumentUrl?: string | null;
  packingSlipUrl?: string | null;
}

export interface DxpShipmentSearchApiResponse {
  success: boolean;
  statusCode: number;
  methodName?: string;
  message: string;
  data: {
    page?: number;
    pageSize?: number;
    totalRecords: number;
    records: DxpShipmentSearchRecord[];
    /** Legacy shapes kept optional for transitional gateways. */
    orders?: OrdersApiOrderRow[];
    shipments?: DxpShipmentSearchRecord[];
  } | null;
  totalRecords?: number;
  errors: unknown;
}

export interface ShipmentsListQueryParams {
  accountId: string | number;
  orderDateFrom: string;
  orderDateTo: string;
  page: number;
  pageSize: number;
  sortDirection: "asc" | "desc";
  sortColumn: SortColumnId;
  /** Free-text search sent as `search` in the request body. */
  search?: string;
  /** API field names for `search` (orders list: `searchIn`). */
  searchIn?: string[];
  /** Defaults to empty until shipment-status dropdown integration. */
  shipmentStatus?: string[];
  /** Parsed from OM URL `orderHeaderId` when present (Shipments tab only). */
  orderHeaderId?: number;
}

const CMS_SHIPMENT_SEARCH_LABEL_TO_FIELD: Record<string, ShipmentsApiSearchInField> = {
  "tracking number": "trackingNumber",
  tracking: "trackingNumber",
  carrier: "carrierName",
  "carrier name": "carrierName",
  "po number": "poNumber",
  po: "poNumber",
  "order number": "orderNumber",
  order: "orderNumber",
  "order id": "orderId",
  "order header id": "orderHeaderId",
  items: "items",
  "item count": "items",
  "ship date": "shipmentDate",
  "shipment date": "shipmentDate",
  shipped: "shipmentDate",
};

function cmsShipmentSearchLabelToField(label: string): ShipmentsApiSearchInField | null {
  const key = label.trim().toLowerCase().replace(/\s+/g, " ");
  return CMS_SHIPMENT_SEARCH_LABEL_TO_FIELD[key] ?? null;
}

/**
 * Builds `searchIn` from tab SearchAttribute in CMS order (deduped).
 */
export function resolveShipmentSearchInFromCmsSearchAttributes(
  attrs: OrderManagementSearchAttributeItem[] | undefined | null
): ShipmentsApiSearchInField[] {
  const out: ShipmentsApiSearchInField[] = [];
  for (const a of attrs ?? []) {
    const raw = a.fields?.Value?.value ?? a.displayName ?? "";
    const field = cmsShipmentSearchLabelToField(String(raw));
    if (field && !out.includes(field)) out.push(field);
  }
  return out;
}

function normalizeShipmentSortColumn(column: SortColumnId): SortColumnId {
  if (
    column === "trackingNumber" ||
    column === "carrier" ||
    column === "poNumber" ||
    column === "orderNumber" ||
    column === "items" ||
    column === "shipDate"
  ) {
    return column;
  }
  return "shipDate";
}

/**
 * Maps Shipments grid sort to API `sortBy` (camelCase per search contract).
 */
export function mapSortColumnToShipmentsApiSort(column: SortColumnId): string {
  const c = normalizeShipmentSortColumn(column);
  if (c === "trackingNumber") return "trackingNumber";
  if (c === "carrier") return "carrierName";
  if (c === "poNumber") return "poNumber";
  if (c === "orderNumber") return "orderNumber";
  if (c === "items") return "items";
  return "shipmentDate";
}

function firstNonEmptyDocumentUrl(...urls: (string | null | undefined)[]): string | null {
  for (const url of urls) {
    const trimmed = typeof url === "string" ? url.trim() : "";
    if (trimmed) return trimmed;
  }
  return null;
}

function resolveShipmentPackingSlipDocumentUrl(row: DxpShipmentSearchRecord): string | null {
  return firstNonEmptyDocumentUrl(
    row.documentUrl,
    row.DocumentUrl,
    row.documentURL,
    row.downloadUrl,
    row.packingSlipDocumentUrl,
    row.packingSlipUrl
  );
}

/**
 * Maps a Shipment search record to the order-management list item shape (one shipment line per row).
 */
export function mapShipmentSearchRecordToListItem(row: DxpShipmentSearchRecord): OrderListItem {
  const headerId = row.orderHeaderId ?? row.orderId;
  const headerIdStr = headerId != null ? String(headerId) : "";
  const shipIdRaw = row.shipmentId ?? headerId;
  const shipmentId = shipIdRaw != null ? String(shipIdRaw) : `${headerIdStr || "row"}-s`;
  const orderKey = headerIdStr || shipmentId;
  const itemCount = row.items ?? row.itemsCount ?? 0;
  const shipDate = row.shipmentDate ?? row.shippedDate ?? row.orderDate ?? "";
  const carrier = row.carrierName ?? row.carrier ?? "";
  const doc = resolveShipmentPackingSlipDocumentUrl(row);

  return {
    orderHeaderId: orderKey,
    orderId: String(row.orderId ?? orderKey),
    poNumber: row.poNumber ?? "",
    orderNumber: String(row.orderNumber ?? ""),
    itemCount,
    statusKey: mapOrderStatusToKey("shipped"),
    orderDate: shipDate,
    totalAmount: 0,
    currency: "USD",
    lineItems: [],
    shipments: [
      {
        id: shipmentId,
        trackingNumber: row.trackingNumber ?? "",
        trackingUrl: row.trackingUrl ?? "",
        carrier,
        itemCount,
        statusLabel: row.statusLabel ?? "Shipped",
        shippedDate: shipDate,
        documentUrl: doc ?? undefined,
      },
    ],
    orderStatusLabel: row.statusLabel ?? "Shipped",
  };
}

function buildShipmentsSearchRequestBody(
  params: ShipmentsListQueryParams
): ShipmentsSearchRequestBody {
  const accountNum =
    typeof params.accountId === "number"
      ? params.accountId
      : Number.parseInt(String(params.accountId), 10);
  const sortBy = mapSortColumnToShipmentsApiSort(normalizeShipmentSortColumn(params.sortColumn));
  const direction = params.sortDirection;
  const status = params.shipmentStatus ?? [];

  const body: ShipmentsSearchRequestBody = {
    accountId: Number.isFinite(accountNum) ? accountNum : 0,
    search: params.search?.trim() ?? "",
    searchIn: params.searchIn ?? [],
    shipmentStatus: status,
    shipmentDateFrom: params.orderDateFrom,
    shipmentDateTo: params.orderDateTo,
    pagination: {
      page: Math.max(1, params.page),
      pageSize: Math.max(1, params.pageSize),
    },
    sorting: [{ sortBy, direction }],
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

function mapShipmentSearchResponseToResult(
  raw: DxpShipmentSearchApiResponse
): GetOrdersListResult | null {
  if (!raw.data) {
    return {
      success: raw.success,
      statusCode: raw.statusCode,
      message: raw.message,
      data: null,
      errors: raw.errors,
    };
  }

  let mapped: OrderListItem[] = [];

  if (raw.data.records?.length) {
    mapped = raw.data.records.map(mapShipmentSearchRecordToListItem);
  } else if (raw.data.shipments?.length) {
    mapped = raw.data.shipments.map(mapShipmentSearchRecordToListItem);
  } else if (raw.data.orders?.length) {
    mapped = raw.data.orders.map(mapApiOrderRowToListItem);
  }

  const totalRecords =
    raw.data.totalRecords ??
    (typeof raw.totalRecords === "number" ? raw.totalRecords : mapped.length);

  return {
    success: raw.success,
    statusCode: raw.statusCode,
    message: raw.message,
    data: {
      totalRecords,
      orders: mapped,
    },
    errors: raw.errors,
  };
}

/**
 * Fetches Shipments via POST {@link API_ROUTES.SHIPMENTS_LIST}.
 * Prefers `data.records`; falls back to `data.shipments` or `data.orders`.
 */
export async function getShipmentsList(
  params: ShipmentsListQueryParams
): Promise<GetOrdersListResult | null> {
  const body = buildShipmentsSearchRequestBody(params);

  const raw = await request<DxpShipmentSearchApiResponse>({
    method: "POST",
    path: API_ROUTES.SHIPMENTS_LIST,
    body,
    options: {
      headers: {
        requestId: "1",
        language: "1",
        Accept: "application/json",
      },
    },
  });

  return mapShipmentSearchResponseToResult(raw);
}
