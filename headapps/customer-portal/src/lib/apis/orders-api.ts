import { API_ROUTES } from "@/lib/apis/api-routes";
import { request } from "@/lib/apis/api-service";
import { buildQuoteRequestLineId } from "@/lib/quote-request/quote-line-id";

/** DXP `searchIn` field names for order list search. */
export type OrdersApiSearchField =
  | "poNumber"
  | "orderNumber"
  | "intraloxPartNumber"
  | "partDescription";

/** Belt / line-item attribute filters for POST /orders. */
export interface OrdersListProductAttributes {
  series: string[];
  style: string[];
  material: string[];
  color: string[];
}

/** Request body for POST /orders (DXP GetOrders). */
export interface OrdersListRequestBody {
  accountId: number;
  orderDateFrom: string;
  orderDateTo: string;
  search?: string;
  searchIn?: string[];
  orderStatus?: string[];
  productAttributes?: OrdersListProductAttributes;
  pagination: {
    page: number;
    pageSize: number;
  };
  sorting: Array<{
    sortBy: string;
    sortDirection: string;
  }>;
}

/** Amount object on each order row from DXP. */
export interface OrdersApiAmount {
  value: number;
  currency: string;
  displayValue?: string;
}

/** Attribute row on list/shipping line items from DXP (e.g. COLOR, MATERIAL, SERIES). */
export interface OrdersApiOrderListShippingLineProductAttribute {
  key?: string;
  value?: string;
  unit?: string;
}

/** Line item nested under `shippingDetails[].lineItems` on POST /orders (search / belt responses). */
export interface OrdersApiOrderListShippingLineItem {
  customerPartNumber?: string;
  productType?: string;
  partDescription?: { value?: string; language?: string } | string;
  quantity?: { value?: number; unit?: string } | number;
  intraloxPartNumber?: string;
  productAttributes?: OrdersApiOrderListShippingLineProductAttribute[];
}

/** One shipment group from `shippingDetails` on a list order row. */
export interface OrdersApiOrderListShippingDetail {
  trackingNumber?: string;
  carrier?: string;
  itemCount?: number | null;
  shipmentStatus?: string;
  shippingMethod?: string;
  shippedDate?: string;
  /** When set, used as the tracking link (e.g. GET /orders/shipments). */
  trackingUrl?: string | null;
  lineItems?: OrdersApiOrderListShippingLineItem[];
}

/** Single order row as returned by POST /orders (before UI mapping). */
export interface OrdersApiOrderRow {
  orderId: number;
  orderHeaderId: number;
  poNumber: string;
  orderNumber: number;
  itemsCount: number;
  orderDate: string;
  orderStatus: string;
  totalAmount: OrdersApiAmount;
  /** Present when the API returns shipment groups (e.g. search or belt filter). */
  shippingDetails?: OrdersApiOrderListShippingDetail[];
}

/** Envelope from POST /orders. */
export interface OrdersApiResponse {
  success: boolean;
  statusCode: number;
  methodName?: string;
  message: string;
  data: {
    totalRecords: number;
    orders: OrdersApiOrderRow[];
  } | null;
  errors: unknown;
}

/**
 * Query for {@link getOrdersList}: date range, paging, and sort mapped to the DXP contract.
 */
export interface OrdersListQueryParams {
  accountId: string | number;
  orderDateFrom: string;
  orderDateTo: string;
  search: string;
  searchIn: OrdersApiSearchField[];
  orderStatus: string[];
  productAttributes: OrdersListProductAttributes;
  page: number;
  pageSize: number;
  /** UI sort column — mapped to API `sortBy` via {@link mapSortColumnToApiSortBy}. */
  sortColumn: OrdersUiSortColumn | null;
  sortDirection: "asc" | "desc";
}

/** Sortable columns supported in the UI (aligned with grid / API). */
export type OrdersUiSortColumn = "orderDate" | "items" | "total";

/** Single order row after mapping for Order Management UI. */
export interface OrderListItem {
  /** Unique header id from DXP — use for React keys and row identity. */
  orderHeaderId: string;
  orderId: string;
  poNumber: string;
  orderNumber: string;
  itemCount: number;
  statusKey: string;
  orderDate: string;
  totalAmount: number;
  currency: string;
  lineItems: OrderLineItem[];
  shipments: OrderShipment[];
  /** Original API status label when needed for display. */
  orderStatusLabel?: string;
}

export interface OrderLineItem {
  id: string;
  customerPartNumber?: string;
  intraloxPartNumber: string;
  description: string;
  quantity: number;
  series?: string;
  style?: string;
  material?: string;
  color?: string;
  productType?: string;
  /** Parent shipment from list `shippingDetails` (e.g. `list-{orderHeaderId}-{index}`). */
  shipmentId?: string;
}

export interface OrderShipment {
  id: string;
  trackingNumber: string;
  trackingUrl: string;
  carrier: string;
  itemCount: number;
  statusLabel: string;
  shippedDate: string;
  /** Packing slip / document link when the shipments API provides it. */
  documentUrl?: string | null;
}

/** Normalized response for callers (mapped orders + total for pagination). */
export interface GetOrdersListResult {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    totalRecords: number;
    orders: OrderListItem[];
  } | null;
  errors: unknown;
}

/**
 * Maps UI sort column to DXP `sortBy` field names (adjust if backend uses different names).
 */
export function mapSortColumnToApiSortBy(column: OrdersUiSortColumn | null): string {
  if (column === "items") return "ItemsCount";
  if (column === "total") return "TotalAmount";
  return "OrderDate";
}

function mapSortDirectionToApi(direction: "asc" | "desc"): string {
  return direction === "asc" ? "Asc" : "Desc";
}

/**
 * Maps API `orderStatus` text to CMS status keys used by filters (e.g. order_cancelled).
 */
export function mapOrderStatusToKey(orderStatus: string): string {
  const t = orderStatus.trim().toLowerCase();
  if (t === "cancelled") return "order_cancelled";
  if (t === "shipped") return "order_shipped";
  if (t === "placed") return "order_placed";
  return `order_${t.replace(/\s+/g, "_")}`;
}

function partDescriptionFromApi(
  partDescription: OrdersApiOrderListShippingLineItem["partDescription"]
): string {
  if (partDescription == null) return "";
  if (typeof partDescription === "string") return partDescription.trim();
  return String(partDescription.value ?? "").trim();
}

function customerPartFromApi(line: OrdersApiOrderListShippingLineItem): string {
  const legacy = line as OrdersApiOrderListShippingLineItem & {
    customerPart?: unknown;
    customerPartNo?: unknown;
  };
  return String(
    line.customerPartNumber ?? legacy.customerPart ?? legacy.customerPartNo ?? ""
  ).trim();
}

function beltFieldsFromProductAttributes(
  productAttributes: OrdersApiOrderListShippingLineItem["productAttributes"]
): Pick<OrderLineItem, "series" | "style" | "material" | "color"> {
  if (!Array.isArray(productAttributes)) return {};
  const byKey: Record<string, string> = {};
  for (const entry of productAttributes) {
    if (entry == null || typeof entry !== "object") continue;
    const row = entry as { key?: string; value?: string };
    const key = String(row.key ?? "")
      .trim()
      .toUpperCase();
    if (!key) continue;
    byKey[key] = String(row.value ?? "").trim();
  }
  return {
    series: byKey.SERIES || undefined,
    style: byKey.STYLE || undefined,
    material: byKey.MATERIAL || undefined,
    color: byKey.COLOR || undefined,
  };
}

function mapListShippingLineToOrderLineItem(
  line: OrdersApiOrderListShippingLineItem,
  stableId: string
): OrderLineItem {
  const qty = line.quantity;
  const quantity =
    typeof qty === "number" && Number.isFinite(qty)
      ? qty
      : typeof qty === "object" && qty != null && typeof qty.value === "number"
        ? qty.value
        : 0;
  return {
    id: stableId,
    customerPartNumber: customerPartFromApi(line),
    intraloxPartNumber: String(line.intraloxPartNumber ?? "").trim(),
    description: partDescriptionFromApi(line.partDescription),
    quantity,
    productType: line.productType,
    ...beltFieldsFromProductAttributes(line.productAttributes),
  };
}

function mapListShippingDetailToOrderShipment(
  detail: OrdersApiOrderListShippingDetail,
  orderHeaderId: string,
  index: number
): OrderShipment {
  const lines = detail.lineItems ?? [];
  const count = detail.itemCount;
  const itemCount =
    count != null && Number.isFinite(Number(count)) ? Number(count) : lines.length;
  const apiTrackingUrl =
    typeof detail.trackingUrl === "string" ? detail.trackingUrl.trim() : "";
  return {
    id: `list-${orderHeaderId}-${index}`,
    trackingNumber: detail.trackingNumber ?? "",
    trackingUrl: apiTrackingUrl,
    carrier: detail.carrier ?? "",
    itemCount,
    statusLabel: detail.shipmentStatus ?? "",
    shippedDate: detail.shippedDate ?? "",
  };
}

/**
 * Maps `shippingDetails` to UI shipments and line items with stable `list-{orderHeaderId}-{index}` ids.
 */
export function mapShippingDetailsToShipmentsAndLines(
  orderHeaderId: string,
  details: OrdersApiOrderListShippingDetail[]
): { shipments: OrderShipment[]; lineItems: OrderLineItem[] } {
  const hid = String(orderHeaderId);
  const shipments: OrderShipment[] = [];
  const lineItems: OrderLineItem[] = [];
  let orderLineIndex = 0;
  details.forEach((sd, sIdx) => {
    const shipment = mapListShippingDetailToOrderShipment(sd, hid, sIdx);
    shipments.push(shipment);
    (sd.lineItems ?? []).forEach((li) => {
      const lineId = buildQuoteRequestLineId(
        {
          intraloxPartNumber: String(li.intraloxPartNumber ?? ""),
          customerPartNumber: customerPartFromApi(li),
        },
        orderLineIndex
      );
      orderLineIndex += 1;
      lineItems.push({
        ...mapListShippingLineToOrderLineItem(li, lineId),
        shipmentId: shipment.id,
      });
    });
  });
  return { shipments, lineItems };
}

/**
 * Converts a DXP order row into the shape expected by Order Management.
 * Populates `lineItems` / `shipments` from `shippingDetails` when the API includes them (e.g. search or belt filter).
 */
export function mapApiOrderRowToListItem(row: OrdersApiOrderRow): OrderListItem {
  const amt = row.totalAmount?.value ?? 0;
  const currency = row.totalAmount?.currency ?? "USD";
  const hid = String(row.orderHeaderId);
  const { shipments, lineItems } = mapShippingDetailsToShipmentsAndLines(
    hid,
    row.shippingDetails ?? []
  );
  return {
    orderHeaderId: hid,
    orderId: String(row.orderId),
    poNumber: row.poNumber ?? "",
    orderNumber: String(row.orderNumber),
    itemCount: row.itemsCount ?? 0,
    statusKey: mapOrderStatusToKey(row.orderStatus ?? ""),
    orderDate: row.orderDate,
    totalAmount: amt,
    currency,
    lineItems,
    shipments,
    orderStatusLabel: row.orderStatus,
  };
}

function buildRequestBody(params: OrdersListQueryParams): OrdersListRequestBody {
  const accountNum =
    typeof params.accountId === "number" ? params.accountId : Number.parseInt(String(params.accountId), 10);
  const sortBy = mapSortColumnToApiSortBy(params.sortColumn);
  const sortDirection = mapSortDirectionToApi(params.sortDirection);
  return {
    accountId: Number.isFinite(accountNum) ? accountNum : 0,
    orderDateFrom: params.orderDateFrom,
    orderDateTo: params.orderDateTo,
    search: params.search ?? "",
    searchIn: params.searchIn ?? [],
    orderStatus: params.orderStatus ?? [],
    productAttributes: params.productAttributes ?? {
      series: [],
      style: [],
      material: [],
      color: [],
    },
    pagination: {
      page: Math.max(1, params.page),
      pageSize: Math.max(1, params.pageSize),
    },
    sorting: [{ sortBy, sortDirection }],
  };
}

/**
 * Fetches a page of orders via POST /orders (GetOrders).
 * When {@link NEXT_PUBLIC_BASE_API_URL} is not configured, returns null.
 * @param params - Account id, date range, pagination, and sort
 */
export async function getOrdersList(params: OrdersListQueryParams): Promise<GetOrdersListResult | null> {
  const body = buildRequestBody(params);

  const raw = await request<OrdersApiResponse>({
    method: "POST",
    path: API_ROUTES.ORDERS_LIST,
    body
  });

  const rows = raw.data?.orders ?? [];
  const mapped = rows.map(mapApiOrderRowToListItem);

  return {
    success: raw.success,
    statusCode: raw.statusCode,
    message: raw.message,
    data: raw.data
      ? {
          totalRecords: raw.data.totalRecords,
          orders: mapped,
        }
      : null,
    errors: raw.errors,
  };
}

// --- GET order shipments (expanded row) — /orders/shipments ---

/** One row from `data.shippingDetails` (GetShipments). */
export interface ShipmentsApiShippingDetail {
  trackingNumber: string;
  carrier: string;
  itemCount: number;
  shipmentStatus: string;
  shippedDate: string;
  /** When set, used as the tracking link (e.g. non-parcel carriers not in CMS CarrierSelection). */
  trackingUrl?: string | null;
  lineItems?: OrdersApiOrderListShippingLineItem[];
}

export interface ShipmentsApiData {
  orderHeaderId: number;
  shippingDetails: ShipmentsApiShippingDetail[];
}

export interface ShipmentsApiResponse {
  success: boolean;
  statusCode: number;
  methodName?: string;
  message: string;
  data: ShipmentsApiData | null;
  totalRecords: number | null;
  errors: unknown;
}

export interface GetOrderShipmentsParams {
  orderHeaderId: string | number;
  accountId: string | number;
}

export interface GetOrderShipmentsResult {
  shipments: OrderShipment[];
  lineItems: OrderLineItem[];
}

const EMPTY_ORDER_SHIPMENTS_RESULT: GetOrderShipmentsResult = {
  shipments: [],
  lineItems: [],
};

function shipmentsApiDetailToListDetail(
  detail: ShipmentsApiShippingDetail | OrdersApiOrderListShippingDetail
): OrdersApiOrderListShippingDetail {
  const row = detail as OrdersApiOrderListShippingDetail;
  return {
    trackingNumber: detail.trackingNumber ?? row.trackingNumber,
    carrier: detail.carrier ?? row.carrier,
    itemCount: detail.itemCount ?? row.itemCount,
    shipmentStatus: detail.shipmentStatus ?? row.shipmentStatus,
    shippedDate: detail.shippedDate ?? row.shippedDate,
    shippingMethod: row.shippingMethod,
    trackingUrl: detail.trackingUrl ?? row.trackingUrl,
    lineItems: detail.lineItems ?? row.lineItems,
  };
}

/** Normalize GET /orders/shipments payloads (envelope or raw `shippingDetails` array). */
function shippingDetailsFromShipmentsApiRaw(raw: unknown): OrdersApiOrderListShippingDetail[] {
  if (raw == null) return [];

  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((row) =>
      shipmentsApiDetailToListDetail(row as ShipmentsApiShippingDetail)
    );
  }

  if (typeof raw !== "object") return [];

  const envelope = raw as ShipmentsApiResponse & {
    shippingDetails?: ShipmentsApiShippingDetail[];
  };

  if (envelope.success === false) return [];

  const data = envelope.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const nested = (data as ShipmentsApiData).shippingDetails;
    if (Array.isArray(nested) && nested.length > 0) {
      return nested.map(shipmentsApiDetailToListDetail);
    }
  }

  if (Array.isArray(data) && data.length > 0) {
    return data.map((row) => shipmentsApiDetailToListDetail(row as ShipmentsApiShippingDetail));
  }

  if (Array.isArray(envelope.shippingDetails) && envelope.shippingDetails.length > 0) {
    return envelope.shippingDetails.map(shipmentsApiDetailToListDetail);
  }

  return [];
}

/**
 * GET /orders/shipments?orderHeaderId=&accountId= (GetShipments).
 * Returns mapped UI shipments and line items; on failure or empty data returns empty arrays.
 */
export async function getOrderShipments(
  params: GetOrderShipmentsParams
): Promise<GetOrderShipmentsResult> {
  const orderHeaderId = String(params.orderHeaderId).trim();
  const accountId = String(params.accountId).trim();
  if (!orderHeaderId || !accountId) {
    return EMPTY_ORDER_SHIPMENTS_RESULT;
  }

  try {
    const raw = await request<ShipmentsApiResponse>({
      method: "GET",
      path: API_ROUTES.ORDERS_SHIPMENTS,
      params: { orderHeaderId, accountId },
      options: {
        headers: {
          requestId: "1",
          language: "1",
          Accept: "application/json",
        },
      },
    });

    const listDetails = shippingDetailsFromShipmentsApiRaw(raw);
    if (!listDetails.length) {
      return EMPTY_ORDER_SHIPMENTS_RESULT;
    }

    return mapShippingDetailsToShipmentsAndLines(orderHeaderId, listDetails);
  } catch {
    return EMPTY_ORDER_SHIPMENTS_RESULT;
  }
}

// --- Order facets (belt dimensions + order status) — POST /orders/facet ---

/** Request body for POST /orders/facet (PostOrderFacets). */
export interface OrderFacetsRequestBody {
  accountId: number;
  orderDateFrom: string;
  orderDateTo: string;
  search?: string;
  searchIn?: OrdersApiSearchField[];
  orderStatus?: string[];
}

export interface OrderFacetValuePair {
  value: string;
  displayValue: string;
}

/** One belt line-item combination from facet data (`data.ssmc`). */
export interface OrderFacetSsmcRow {
  series: OrderFacetValuePair;
  style: OrderFacetValuePair;
  material: OrderFacetValuePair;
  color: OrderFacetValuePair;
}

export interface OrderFacetStatusOption {
  value: string;
  displayValue: string;
}

export interface OrderFacetsData {
  ssmc: OrderFacetSsmcRow[];
  orderStatus: OrderFacetStatusOption[];
}

export interface OrderFacetsEnvelope {
  success: boolean;
  statusCode: number;
  methodName?: string;
  message: string;
  data: OrderFacetsData | null;
  totalRecords: number | null;
  errors: unknown;
}

function facetCellLabel(cell: OrderFacetValuePair | undefined): string {
  const s = cell?.displayValue?.trim() || cell?.value?.trim() || "";
  return s;
}

/**
 * Builds unique sorted option lists per belt dimension from `data.ssmc` (display labels for UI/filter matching).
 */
export function buildBeltOptionsFromSsmc(
  ssmc: OrderFacetSsmcRow[] | undefined | null
): {
  series: string[];
  style: string[];
  material: string[];
  color: string[];
} {
  const series = new Set<string>();
  const style = new Set<string>();
  const material = new Set<string>();
  const color = new Set<string>();
  for (const row of ssmc ?? []) {
    const s = facetCellLabel(row.series);
    const st = facetCellLabel(row.style);
    const m = facetCellLabel(row.material);
    const c = facetCellLabel(row.color);
    if (s) series.add(s);
    if (st) style.add(st);
    if (m) material.add(m);
    if (c) color.add(c);
  }
  const sortStr = (a: string, b: string) =>
    a.localeCompare(b, undefined, { sensitivity: "base" });
  return {
    series: [...series].sort(sortStr),
    style: [...style].sort(sortStr),
    material: [...material].sort(sortStr),
    color: [...color].sort(sortStr),
  };
}

export async function postOrderFacets(
  body: OrderFacetsRequestBody
): Promise<OrderFacetsEnvelope | null> {
  try {
    return await request<OrderFacetsEnvelope>({
      method: "POST",
      path: API_ROUTES.ORDERS_FACET,
      body: {
        accountId: body.accountId,
        orderDateFrom: body.orderDateFrom,
        orderDateTo: body.orderDateTo,
        search: body.search ?? "",
        searchIn: body.searchIn ?? [],
        orderStatus: body.orderStatus ?? [],
      },
    });
  } catch {
    return null;
  }
}