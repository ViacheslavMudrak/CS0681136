import type { OrderManagementTabFields, OrderManagementValueItem } from "../../OrderManagement.type";
import {
  mergeTabFilterOptionsAppendUnknownStatuses,
  normalizeTabFilterFieldsWithLooseShape,
} from "../../tabFilterLooseFields";
import type { QuoteRecord } from "@/lib/orderManagementUtils";

/** No fabricated status rows when Sitecore omits {@link OrderManagementTabFields.FilterOptions}. */
const FALLBACK_QUOTE = { filterLabel: "", filterOptions: [] as OrderManagementValueItem[] };

export function normalizeQuoteTabFilterFields(
  tabFields: OrderManagementTabFields | undefined | null
): OrderManagementTabFields | undefined | null {
  return normalizeTabFilterFieldsWithLooseShape(tabFields, FALLBACK_QUOTE);
}

export function mergeQuoteFilterOptionsWithListStatuses(
  tabFields: OrderManagementTabFields | undefined | null,
  remoteQuotes: QuoteRecord[] | null
): OrderManagementTabFields | undefined | null {
  return mergeTabFilterOptionsAppendUnknownStatuses(tabFields, remoteQuotes, "__quote-status");
}
