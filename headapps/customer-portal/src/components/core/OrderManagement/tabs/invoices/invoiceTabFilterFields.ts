import type { OrderManagementTabFields, OrderManagementValueItem } from "../../OrderManagement.type";
import {
  mergeTabFilterOptionsAppendUnknownStatuses,
  normalizeTabFilterFieldsWithLooseShape,
} from "../../tabFilterLooseFields";
import type { InvoiceRecord } from "@/lib/apis/invoices-api";

/** No fabricated invoice statuses when Sitecore omits multilist items. */
const FALLBACK_INVOICE = { filterLabel: "", filterOptions: [] as OrderManagementValueItem[] };

/**
 * Ensures Invoices tab status filter reads CMS data whether fields are PascalCase or camelCase.
 * When {@link OrderManagementTabFields.FilterOptions} is absent in Sitecore, options stay empty.
 */
export function normalizeInvoiceTabFilterFields(
  tabFields: OrderManagementTabFields | undefined | null
): OrderManagementTabFields | undefined | null {
  return normalizeTabFilterFieldsWithLooseShape(tabFields, FALLBACK_INVOICE);
}

export function mergeInvoiceFilterOptionsWithListStatuses(
  tabFields: OrderManagementTabFields | undefined | null,
  remoteInvoices: InvoiceRecord[] | null
): OrderManagementTabFields | undefined | null {
  return mergeTabFilterOptionsAppendUnknownStatuses(tabFields, remoteInvoices, "__invoice-status");
}
