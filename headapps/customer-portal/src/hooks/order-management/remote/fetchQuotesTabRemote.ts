import type { OrderManagementTabFields } from "@/components/core/OrderManagement/OrderManagement.type";
import { ORDERS_GENERIC_ERROR_MESSAGE } from "@/components/core/OrderManagement/orderManagementLabels";
import { isApiRequestError } from "@/lib/apis/api-service";
import { getQuotesList, resolveQuoteSearchInFromCmsSearchAttributes } from "@/lib/apis/quotes-api";
import {
  normalizeListTotalRecords,
  orderStatusFilterKeysToApiValues,
  toApiDateRangeEnd,
  toApiDateRangeStart,
  type DateRangeValue,
  type SortColumnId,
} from "@/lib/orderManagementUtils";
import type { OrderManagementRemoteFetchPatch } from "./orderManagementRemoteTypes";

const FORBIDDEN_ERROR_MESSAGE = "You do not have permission to view these records.";

export async function fetchQuotesTabRemote(params: {
  accountId: string | number;
  dateRange: DateRangeValue;
  tabFields: OrderManagementTabFields;
  currentPage: number;
  pageSize: number;
  sortColumn: SortColumnId;
  sortDir: "asc" | "desc";
  appliedSearch: string;
  statusSelections: Set<string>;
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
  } = params;

  const accountNum =
    typeof accountId === "number" ? accountId : Number.parseInt(String(accountId), 10);
  const quoteSortColumns: SortColumnId[] = [
    "quoteId",
    "quoteContactPerson",
    "items",
    "quoteStatus",
    "quoteDate",
    "quoteExpiresIn",
    "total",
    "orderDate",
  ];
  const sortCol: SortColumnId = quoteSortColumns.includes(sortColumn) ? sortColumn : "quoteDate";

  try {
    const res = await getQuotesList({
      accountId: Number.isFinite(accountNum) ? accountNum : accountId,
      quoteDateFrom: toApiDateRangeStart(dateRange.start),
      quoteDateTo: toApiDateRangeEnd(dateRange.end),
      page: currentPage,
      pageSize,
      sortColumn: sortCol,
      sortDirection: sortDir,
      search: appliedSearch.trim(),
      searchIn: resolveQuoteSearchInFromCmsSearchAttributes(tabFields?.SearchAttribute),
      quoteStatus: orderStatusFilterKeysToApiValues(statusSelections, tabFields),
    });

    if (res?.success && res.data?.quotes != null) {
      return {
        remoteOrders: null,
        remoteInvoices: null,
        remoteQuotes: res.data.quotes,
        apiLive: true,
        apiTotalRecords: normalizeListTotalRecords(
          res?.data?.totalRecords,
          res?.data?.quotes?.length
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
        res == null
          ? (tabFields?.OrdersApiErrorMessage?.value ?? ORDERS_GENERIC_ERROR_MESSAGE)
          : (res.message ??
            tabFields?.OrdersApiErrorMessage?.value ??
            ORDERS_GENERIC_ERROR_MESSAGE),
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
