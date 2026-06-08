import type { OrderDetailLineItem } from "@/components/core/OrderDetail/OrderDetail.type";
import type { OrderLineItem } from "@/lib/apis/orders-api";
import type { DocumentRequestUiLine } from "@/lib/document-request-panel-types";
import type { ProfileAccount } from "@/lib/types/user-profile";

/**
 * Maps an order-list line (from `shippingDetails[].lineItems`) to the document-request UI/API line shape.
 */
export function orderListLineToDocumentRequestUiLine(line: OrderLineItem): DocumentRequestUiLine {
  return {
    lineId: line.id,
    customerPartNumber: line.customerPartNumber ?? "",
    intraloxPartNumber: line.intraloxPartNumber ?? "",
    description: line.description ?? "",
    quantity: Number.isFinite(line.quantity) ? line.quantity : 0,
  };
}

/** Maps order-management / dashboard list lines to document-request panel rows. */
export function orderListLinesToDocumentRequestUiLines(lines: OrderLineItem[]): DocumentRequestUiLine[] {
  return lines.map(orderListLineToDocumentRequestUiLine);
}

/**
 * Maps an order-detail line to the document-request UI/API line shape.
 * Uses a stable surrogate `lineId` until DXP exposes real line ids.
 */
export function orderDetailLineToDocumentRequestUiLine(
  item: OrderDetailLineItem,
  index: number,
  orderHeaderId: string
): DocumentRequestUiLine {
  const qty = item.quantity?.value;
  const quantity =
    typeof qty === "number" && Number.isFinite(qty) ? qty : Number.parseFloat(String(qty ?? "")) || 0;
  return {
    lineId: `${orderHeaderId}-d${index}`,
    customerPartNumber: String(item.customerPartNumber ?? "").trim(),
    intraloxPartNumber: String(item.intraloxPartNumber ?? "").trim(),
    description: String(item.partDescription?.value ?? "").trim(),
    quantity,
  };
}

export function orderDetailLinesToDocumentRequestUiLines(
  items: OrderDetailLineItem[],
  orderHeaderId: string
): DocumentRequestUiLine[] {
  return items.map((item, index) => orderDetailLineToDocumentRequestUiLine(item, index, orderHeaderId));
}

/** Quote detail → document request lines (multi / single item entry points). */
export function quoteDetailLinesToDocumentRequestUiLines(
  items: OrderDetailLineItem[],
  quoteId: string
): DocumentRequestUiLine[] {
  const prefix = `quote-${quoteId}`;
  return items.map((item, index) => orderDetailLineToDocumentRequestUiLine(item, index, prefix));
}

/** Display name + address for the read-only “Submitting As” block (aligned with `ProfileAccount`). */
export function formatSubmittingAsLines(account: ProfileAccount | null): { title: string; body: string } {
  if (!account) {
    return { title: "", body: "" };
  }
  const title = String(account.companyName ?? "").trim();
  const body = String(account.address ?? "").trim();
  return { title, body };
}

/** Portal account `id` — same identifier as Orders/Quotes/Dashboard DXP APIs. */
export function resolveAccountIdForDocumentRequest(account: ProfileAccount | null): string {
  if (!account) return "";
  return String(account.id ?? "").trim();
}
