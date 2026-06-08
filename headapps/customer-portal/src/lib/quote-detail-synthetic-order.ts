import type { OrderLineItem, OrderListItem } from "@/lib/apis/orders-api";

/** Stable positive numeric header id for RFQ draft grouping when the source is a quote (not an order). */
export function quoteSyntheticOrderHeaderId(quoteId: string): number {
  const n = Number(quoteId);
  if (Number.isFinite(n) && n > 0) return Math.floor(n);
  let h = 0;
  for (let i = 0; i < quoteId.length; i++) {
    h = (h * 31 + quoteId.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 1;
}

export function buildSyntheticOrderListItemForQuoteRequest(
  quoteId: string,
  quoteNumber: string,
  lineCount: number
): OrderListItem {
  const hid = quoteSyntheticOrderHeaderId(quoteId);
  return {
    orderHeaderId: String(hid),
    orderId: quoteNumber,
    poNumber: "",
    orderNumber: quoteNumber,
    itemCount: lineCount,
    statusKey: "order_expired",
    orderDate: "",
    totalAmount: 0,
    currency: "USD",
    lineItems: [],
    shipments: [],
  };
}

export function quoteDetailLinesToOrderLineItems(
  lines: Array<{
    id?: string;
    customerPartNumber?: string;
    intraloxPartNumber?: string;
    description?: string;
    quantityEach?: number;
  }>
): OrderLineItem[] {
  return lines.map((li, i) => ({
    id: String(li.id ?? `qli-${i}`),
    customerPartNumber: li.customerPartNumber,
    intraloxPartNumber: (li.intraloxPartNumber ?? "").trim() || "—",
    description: li.description ?? "",
    quantity: Number.isFinite(li.quantityEach) ? Number(li.quantityEach) : 0,
  }));
}
