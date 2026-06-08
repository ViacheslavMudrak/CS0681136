import {
  getInvoicesList,
  type GetInvoicesListResult,
  type InvoicesListQueryParams,
} from "@/lib/apis/invoices-api";
import {
  getOrdersList,
  type GetOrdersListResult,
  type OrdersListQueryParams,
} from "@/lib/apis/orders-api";
import {
  getQuotesList,
  type GetQuotesListResult,
  type QuotesListQueryParams,
} from "@/lib/apis/quotes-api";
import {
  getShipmentsList,
  type ShipmentsListQueryParams,
} from "@/lib/apis/shipments-api";
import type { OrderManagementTabKind } from "@/lib/orderManagementUtils";

/**
 * Orders tab list fetcher (POST `/orders`). Shipments and invoices use dedicated modules.
 */
export async function fetchOrderManagementList(
  tabKind: OrderManagementTabKind,
  params: OrdersListQueryParams
): Promise<GetOrdersListResult | null> {
  switch (tabKind) {
    case "orders":
      return getOrdersList(params);
    case "shipments":
    case "invoices":
    case "quotes":
    case "unknown":
    default:
      return null;
  }
}

export async function fetchShipmentManagementList(
  params: ShipmentsListQueryParams
): Promise<GetOrdersListResult | null> {
  return getShipmentsList(params);
}

export async function fetchInvoiceManagementList(
  params: InvoicesListQueryParams
): Promise<GetInvoicesListResult | null> {
  return getInvoicesList(params);
}

/** Quotes tab list fetcher — POST `/quotes` when DXP exposes the endpoint. */
export async function fetchQuoteManagementList(
  params: QuotesListQueryParams
): Promise<GetQuotesListResult | null> {
  return getQuotesList(params);
}
