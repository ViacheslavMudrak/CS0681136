import type { OrderManagementTabFields } from "@/components/core/OrderManagement/OrderManagement.type";
import { ORDERS_GENERIC_ERROR_MESSAGE } from "@/components/core/OrderManagement/orderManagementLabels";
import {
  getShipmentsList,
  resolveShipmentSearchInFromCmsSearchAttributes,
} from "@/lib/apis/shipments-api";
import {
  normalizeListTotalRecords,
  toApiDateRangeEnd,
  toApiDateRangeStart,
  type DateRangeValue,
  type SortColumnId,
} from "@/lib/orderManagementUtils";
import type { OrderManagementRemoteFetchPatch } from "./orderManagementRemoteTypes";

export async function fetchShipmentsTabRemote(params: {
  accountId: string | number;
  dateRange: DateRangeValue;
  tabFields: OrderManagementTabFields;
  currentPage: number;
  pageSize: number;
  sortColumn: SortColumnId;
  sortDir: "asc" | "desc";
  appliedSearch: string;
  orderHeaderId?: number;
}): Promise<OrderManagementRemoteFetchPatch> {
  const {
    accountId,
    dateRange,
    tabFields,
    currentPage,
    pageSize,
    sortColumn,
    sortDir,
    appliedSearch,
    orderHeaderId,
  } = params;

  const accountNum =
    typeof accountId === "number" ? accountId : Number.parseInt(String(accountId), 10);

  try {
    const res = await getShipmentsList({
      accountId: Number.isFinite(accountNum) ? accountNum : accountId,
      orderDateFrom: toApiDateRangeStart(dateRange.start),
      orderDateTo: toApiDateRangeEnd(dateRange.end),
      page: currentPage,
      pageSize,
      sortColumn,
      sortDirection: sortDir,
      search: appliedSearch,
      searchIn: resolveShipmentSearchInFromCmsSearchAttributes(tabFields?.SearchAttribute),
      shipmentStatus: [],
      ...(orderHeaderId != null && Number.isFinite(orderHeaderId) && orderHeaderId > 0
        ? { orderHeaderId }
        : {}),
    });
    const liveShip = res?.success && res.data?.orders != null ? res.data : null;
    if (liveShip) {
      return {
        remoteOrders: liveShip.orders,
        remoteInvoices: null,
        remoteQuotes: null,
        apiLive: true,
        apiTotalRecords: normalizeListTotalRecords(
          liveShip?.totalRecords,
          liveShip?.orders?.length
        ),
        loadError: null,
      };
    }
    return {
      remoteOrders: null,
      remoteInvoices: null,
      remoteQuotes: null,
      apiLive: false,
      apiTotalRecords: 0,
      loadError: !res
        ? (tabFields?.OrdersApiErrorMessage?.value ?? ORDERS_GENERIC_ERROR_MESSAGE)
        : (res.message ?? tabFields?.OrdersApiErrorMessage?.value ?? ORDERS_GENERIC_ERROR_MESSAGE),
    };
  } catch {
    return {
      remoteOrders: null,
      remoteInvoices: null,
      remoteQuotes: null,
      apiLive: false,
      apiTotalRecords: 0,
      loadError: tabFields?.OrdersApiErrorMessage?.value ?? ORDERS_GENERIC_ERROR_MESSAGE,
    };
  }
}
