import type { OrderManagementTabFields } from "@/components/core/OrderManagement/OrderManagement.type";
import { ORDERS_GENERIC_ERROR_MESSAGE } from "@/components/core/OrderManagement/orderManagementLabels";
import { isApiRequestError } from "@/lib/apis/api-service";
import { getOrdersList } from "@/lib/apis/orders-api";
import {
  beltSelectionsToProductAttributes,
  mapSortColumnIdToOrdersUiSort,
  normalizeListTotalRecords,
  orderStatusFilterKeysToApiValues,
  resolveApiSearchInFromCmsSearchAttributes,
  toApiDateRangeEnd,
  toApiDateRangeStart,
  type BeltSelections,
  type DateRangeValue,
  type SortColumnId,
} from "@/lib/orderManagementUtils";
import type { OrderManagementRemoteFetchPatch } from "./orderManagementRemoteTypes";

const FORBIDDEN_ERROR_MESSAGE = "You do not have permission to view these records.";

export async function fetchOrdersTabRemote(params: {
  accountId: string | number;
  dateRange: DateRangeValue;
  tabFields: OrderManagementTabFields;
  currentPage: number;
  pageSize: number;
  sortColumn: SortColumnId;
  sortDir: "asc" | "desc";
  appliedSearch: string;
  statusSelections: Set<string>;
  beltApplied: BeltSelections;
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
    statusSelections,
    beltApplied,
  } = params;

  const accountNum =
    typeof accountId === "number" ? accountId : Number.parseInt(String(accountId), 10);

  try {
    const res = await getOrdersList({
      accountId: Number.isFinite(accountNum) ? accountNum : accountId,
      orderDateFrom: toApiDateRangeStart(dateRange.start),
      orderDateTo: toApiDateRangeEnd(dateRange.end),
      search: appliedSearch.trim(),
      searchIn: resolveApiSearchInFromCmsSearchAttributes(tabFields?.SearchAttribute),
      orderStatus: orderStatusFilterKeysToApiValues(statusSelections, tabFields),
      productAttributes: beltSelectionsToProductAttributes(beltApplied),
      page: currentPage,
      pageSize,
      sortColumn: mapSortColumnIdToOrdersUiSort(sortColumn),
      sortDirection: sortDir,
    });
    const liveOrders = res?.success && res.data?.orders != null ? res.data : null;
    if (liveOrders) {
      return {
        remoteOrders: liveOrders.orders,
        remoteInvoices: null,
        remoteQuotes: null,
        apiLive: true,
        apiTotalRecords: normalizeListTotalRecords(
          liveOrders?.totalRecords,
          liveOrders?.orders?.length
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
      loadError:
        res?.message ?? tabFields?.OrdersApiErrorMessage?.value ?? ORDERS_GENERIC_ERROR_MESSAGE,
    };
  } catch (error) {
    const loadError =
      isApiRequestError(error) && error.status === 403
        ? FORBIDDEN_ERROR_MESSAGE
        : (tabFields?.OrdersApiErrorMessage?.value ?? ORDERS_GENERIC_ERROR_MESSAGE);
    return {
      remoteOrders: null,
      remoteInvoices: null,
      remoteQuotes: null,
      apiLive: false,
      apiTotalRecords: 0,
      loadError,
    };
  }
}
