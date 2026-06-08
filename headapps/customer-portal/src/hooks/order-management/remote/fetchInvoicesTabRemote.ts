import type { OrderManagementTabFields } from "@/components/core/OrderManagement/OrderManagement.type";
import { ORDERS_GENERIC_ERROR_MESSAGE } from "@/components/core/OrderManagement/orderManagementLabels";
import { isApiRequestError } from "@/lib/apis/api-service";
import {
  getInvoicesList,
  resolveInvoiceSearchInFromCmsSearchAttributes,
  type InvoicesTabSortColumn,
} from "@/lib/apis/invoices-api";
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

export async function fetchInvoicesTabRemote(params: {
  accountId: string | number;
  dateRange: DateRangeValue;
  tabFields: OrderManagementTabFields;
  currentPage: number;
  pageSize: number;
  sortColumn: SortColumnId;
  sortDir: "asc" | "desc";
  appliedSearch: string;
  statusSelections: Set<string>;
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
    statusSelections,
    orderHeaderId,
  } = params;

  const accountNum =
    typeof accountId === "number" ? accountId : Number.parseInt(String(accountId), 10);
  const invoiceSortCol: InvoicesTabSortColumn =
    sortColumn === "invoiceNumber" ||
    sortColumn === "poNumber" ||
    sortColumn === "orderNumber" ||
    sortColumn === "invoiceStatus" ||
    sortColumn === "invoiceDate" ||
    sortColumn === "dueIn" ||
    sortColumn === "invoiceAmount"
      ? sortColumn
      : sortColumn === "items"
        ? "dueIn"
        : "invoiceDate";

  try {
    const res = await getInvoicesList({
      accountId: Number.isFinite(accountNum) ? accountNum : accountId,
      invoiceDateFrom: toApiDateRangeStart(dateRange.start),
      invoiceDateTo: toApiDateRangeEnd(dateRange.end),
      page: currentPage,
      pageSize,
      sortColumn: invoiceSortCol,
      sortDirection: sortDir,
      search: appliedSearch.trim(),
      searchIn: resolveInvoiceSearchInFromCmsSearchAttributes(tabFields?.SearchAttribute),
      invoiceStatus: orderStatusFilterKeysToApiValues(statusSelections, tabFields),
      ...(orderHeaderId != null && Number.isFinite(orderHeaderId) && orderHeaderId > 0
        ? { orderHeaderId }
        : {}),
    });
    const liveInv = res?.success && res.data?.invoices != null ? res.data : null;
    if (liveInv) {
      return {
        remoteOrders: null,
        remoteInvoices: liveInv.invoices,
        remoteQuotes: null,
        apiLive: true,
        apiTotalRecords: normalizeListTotalRecords(
          liveInv?.totalRecords,
          liveInv?.invoices?.length
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
