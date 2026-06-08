/**
 * Request Quote draft helpers: CMS merge, queue renumbering, DTO utilities, and API-adjacent builders.
 */

import type {
  OrderManagementQuoteSelection,
  QuoteSelectionFieldSource,
} from "@/components/core/OrderManagement/OrderManagement.type";
import type { QuoteRequestCmsFields } from "@/components/core/OrderManagement/OrderManagementQuoteRequest.type";
import type { OrderLineItem, OrderListItem } from "@/lib/apis/orders-api";
import type {
  QuoteRequestDraftDto,
  QuoteRequestGeneralQuoteItem,
  QuoteRequestOrderQuoteItem,
  QuoteRequestOrderQuoteLineItem,
  QuoteRequestSingleLineQuoteItem,
} from "@/lib/quote-request/request-quote.types";

export { buildQuoteRequestLineId } from "@/lib/quote-request/quote-line-id";

/** `name` / `displayName` on the multilist item that carries Request Quote drawer copy. */
export const QUOTE_REQUEST_SELECTION_ITEM_NAME = "Quote Request";

/** Document request panel item in the same `QuoteSelection` multilist (Order Management / Order Detail). */
export const DOCUMENT_REQUEST_SELECTION_ITEM_NAME = "Document Request";

function normalizeQuoteSelectionList(
  raw: QuoteSelectionFieldSource["QuoteSelection"]
): OrderManagementQuoteSelection[] {
  if (raw == null) return [];
  return Array.isArray(raw) ? raw : [raw];
}

/** All `QuoteSelection` rows (Order Management / Order Detail). */
export function listQuoteSelectionItems(
  sc: QuoteSelectionFieldSource
): OrderManagementQuoteSelection[] {
  return normalizeQuoteSelectionList(sc.QuoteSelection);
}

function selectionItemMatchesName(
  item: OrderManagementQuoteSelection,
  matchName: string
): boolean {
  const key = matchName.trim().toLowerCase();
  if (!key) return false;
  const n = item.name?.trim().toLowerCase();
  const d = item.displayName?.trim().toLowerCase();
  return n === key || d === key;
}

export interface GetQuoteRequestCmsFieldsOptions {
  /** Defaults to {@link QUOTE_REQUEST_SELECTION_ITEM_NAME}. */
  itemName?: string;
}

/**
 * Resolves `QuoteRequestCmsFields` from Order Management `QuoteSelection` (multilist or legacy single item)
 * by matching `name` or `displayName` to the quote item (default: "Quote Request").
 */
export function getQuoteRequestCmsFields(
  sc: QuoteSelectionFieldSource,
  options?: GetQuoteRequestCmsFieldsOptions
): QuoteRequestCmsFields {
  const itemName = options?.itemName ?? QUOTE_REQUEST_SELECTION_ITEM_NAME;
  const list = listQuoteSelectionItems(sc);
  const item = list.find((x) => selectionItemMatchesName(x, itemName));
  return item?.fields ?? {};
}

export function isQuoteRequestSelectionItem(
  item: OrderManagementQuoteSelection
): boolean {
  return selectionItemMatchesName(item, QUOTE_REQUEST_SELECTION_ITEM_NAME);
}

export function isDocumentRequestSelectionItem(
  item: OrderManagementQuoteSelection
): boolean {
  return selectionItemMatchesName(item, DOCUMENT_REQUEST_SELECTION_ITEM_NAME);
}

const DEFAULT_ORDER_HEADER_REVIEW_INTRO =
  "Review items from PO: {PO_NUMBER} | Order: {ORDER_NUMBER} to be included in this quote.";

export type OrderHeaderReviewIntroSegment =
  | { kind: "text"; value: string }
  | { kind: "po"; value: string }
  | { kind: "order"; value: string };

/**
 * Splits the CMS `OrderHeaderReviewIntroPattern` into static text and PO / Order placeholders
 * for rich rendering (e.g. bold values with labels in the review step).
 */
export function getOrderHeaderReviewIntroSegments(
  pattern: string | undefined,
  poNumber: string,
  orderNumber: string
): OrderHeaderReviewIntroSegment[] {
  const raw = (pattern?.trim() || DEFAULT_ORDER_HEADER_REVIEW_INTRO).replace(/\r\n/g, "\n");
  const re = /(\{PO_NUMBER\}|\{ORDER_NUMBER\})/gi;
  const out: OrderHeaderReviewIntroSegment[] = [];
  let last = 0;
  const po = (poNumber ?? "").trim();
  const ord = (orderNumber ?? "").trim();
  for (const m of raw.matchAll(re)) {
    const index = m.index ?? 0;
    if (index > last) {
      out.push({ kind: "text", value: raw.slice(last, index) });
    }
    if (m[1].toUpperCase() === "{PO_NUMBER}") {
      out.push({ kind: "po", value: po });
    } else {
      out.push({ kind: "order", value: ord });
    }
    last = index + m[0].length;
  }
  if (last < raw.length) {
    out.push({ kind: "text", value: raw.slice(last) });
  }
  return out;
}

/**
 * Merges trailing "PO: " / " | Order: " (or "Order: ") in text with the next placeholder
 * so labels and numbers are emphasized together, matching the default review intro layout.
 */
export type OrderHeaderReviewIntroDisplayPart =
  | { kind: "text"; value: string }
  | { kind: "emphasis"; value: string };

export function getOrderHeaderReviewIntroDisplayParts(
  pattern: string | undefined,
  poNumber: string,
  orderNumber: string
): OrderHeaderReviewIntroDisplayPart[] {
  const segs = getOrderHeaderReviewIntroSegments(pattern, poNumber, orderNumber);
  const out: OrderHeaderReviewIntroDisplayPart[] = [];
  let i = 0;
  while (i < segs.length) {
    const cur = segs[i];
    if (cur == null) break;
    if (cur.kind === "text") {
      const next = segs[i + 1];
      if (next?.kind === "po") {
        const poM = /^([\s\S]*?)(\bPO:\s*)$/.exec(cur.value);
        if (poM) {
          if (poM[1]) {
            out.push({ kind: "text", value: poM[1] });
          }
          out.push({ kind: "emphasis", value: `${poM[2]}${next.value}` });
          i += 2;
          continue;
        }
        out.push({ kind: "text", value: cur.value });
        out.push({ kind: "emphasis", value: next.value });
        i += 2;
        continue;
      }
      if (next?.kind === "order") {
        const t = cur.value;
        const pipeM = /^([\s\S]*?)(\s*\|\s*Order:\s*)$/.exec(t);
        if (pipeM) {
          if (pipeM[1]) {
            out.push({ kind: "text", value: pipeM[1] });
          }
          out.push({ kind: "emphasis", value: `${pipeM[2]}${next.value}` });
          i += 2;
          continue;
        }
        const orderM = /^([\s\S]*?)(\bOrder:\s*)$/.exec(t);
        if (orderM) {
          if (orderM[1]) {
            out.push({ kind: "text", value: orderM[1] });
          }
          out.push({ kind: "emphasis", value: `${orderM[2]}${next.value}` });
          i += 2;
          continue;
        }
        out.push({ kind: "text", value: cur.value });
        out.push({ kind: "emphasis", value: next.value });
        i += 2;
        continue;
      }
      out.push({ kind: "text", value: cur.value });
      i += 1;
      continue;
    }
    out.push({ kind: "emphasis", value: cur.value });
    i += 1;
  }
  return out;
}

/** CMS `OrderHeaderReviewIntroPattern` with `{PO_NUMBER}` and `{ORDER_NUMBER}`. */
export function formatOrderHeaderReviewIntro(
  pattern: string | undefined,
  poNumber: string,
  orderNumber: string
): string {
  return getOrderHeaderReviewIntroSegments(pattern, poNumber, orderNumber)
    .map((s) => s.value)
    .join("");
}

export function renumberGeneral(
  items: QuoteRequestGeneralQuoteItem[]
): QuoteRequestGeneralQuoteItem[] {
  return items.map((x, i) => ({ ...x, sequence: i + 1 }));
}

export function renumberLineItems(
  items: QuoteRequestSingleLineQuoteItem[]
): QuoteRequestSingleLineQuoteItem[] {
  return items.map((x, i) => ({ ...x, sequence: i + 1 }));
}

export function nextSequence(d: QuoteRequestDraftDto): number {
  const g = d.general.quoteItems.map((x) => x.sequence);
  const s = d.singleLineItem.quoteItems.map((x) => x.sequence);
  const all = [...g, ...s];
  return (all.length ? Math.max(...all) : 0) + 1;
}

/** New {@link QuoteRequestOrderQuoteItem} block `sequence` (one per order group). */
export function nextOrderQuoteBlockSequence(d: QuoteRequestDraftDto): number {
  const seqs = d.orderQuote.quoteItems.map((x) => x.sequence);
  return (seqs.length ? Math.max(...seqs) : 0) + 1;
}

export function buildLineQuoteItem(
  order: OrderListItem,
  line: OrderLineItem,
  sequence: number,
  comments: string
): QuoteRequestSingleLineQuoteItem {
  return {
    quoteSingleLineItemId: 0,
    lineItemKey: makeLineItemQueueKey(String(order.orderHeaderId), line.id),
    poNumber: order.poNumber ?? "",
    orderNumber: String(order.orderNumber ?? ""),
    orderHeaderId: Number(order.orderHeaderId) || 0,
    customerPartNumber: line.customerPartNumber ?? "",
    productType: line.productType ?? "",
    intraloxPartNumber: line.intraloxPartNumber ?? "",
    comments,
    partDescription: { value: line.description ?? "", language: "en-US" },
    quantity: { value: line.quantity ?? 0, unit: "pieces" },
    sequence,
  };
}

export function rowToFormLine(
  row: QuoteRequestSingleLineQuoteItem
): { order: OrderListItem; line: OrderLineItem } {
  const line: OrderLineItem = {
    id: row.lineItemKey?.split("|")[1] ?? "line",
    intraloxPartNumber: row.intraloxPartNumber,
    description: row.partDescription.value,
    quantity: row.quantity.value,
    customerPartNumber: row.customerPartNumber,
    productType: row.productType,
  };
  const order: OrderListItem = {
    orderHeaderId: String(row.orderHeaderId),
    orderId: "",
    poNumber: row.poNumber,
    orderNumber: row.orderNumber,
    itemCount: 0,
    statusKey: "",
    orderDate: "",
    totalAmount: 0,
    currency: "USD",
    lineItems: [],
    shipments: [],
  };
  return { order, line };
}

export function createEmptyQuoteRequestDraft(accountId: number): QuoteRequestDraftDto {
  return {
    email: "",
    accountID: accountId,
    status: "",
    additionalComments: "",
    general: { quoteItems: [] },
    singleLineItem: { quoteItems: [] },
    orderQuote: { quoteItems: [] },
  };
}

export function makeLineItemQueueKey(orderHeaderId: string, lineId: string): string {
  return `${orderHeaderId}|${lineId}`;
}

/**
 * Resolves a list / detail line to an `orderQuote` line index. Tries exact `lineItemKey` first,
 * then intralox + customer part + quantity (for drafts saved with older id formats).
 */
export function findOrderQuoteLineIndexForListLine(
  orderBlock: QuoteRequestOrderQuoteItem,
  listLineItemKey: string,
  line: OrderLineItem
): number {
  const byKey = orderBlock.lineItems.findIndex((li) => li.lineItemKey === listLineItemKey);
  if (byKey >= 0) return byKey;
  const tI = (line.intraloxPartNumber ?? "").trim();
  const tC = (line.customerPartNumber ?? "").trim();
  const tQ = line.quantity;
  return orderBlock.lineItems.findIndex(
    (li) =>
      (li.intraloxPartNumber ?? "").trim() === tI &&
      (li.customerPartNumber ?? "").trim() === tC &&
      (li.quantity?.value ?? 0) === tQ
  );
}

/**
 * Single-line queue row for this list line, by key or by order + part + qty (legacy keys).
 */
export function findSingleLineQuoteItemForListLine(
  items: QuoteRequestSingleLineQuoteItem[],
  orderHeaderIdNum: number,
  listLineItemKey: string,
  line: OrderLineItem
): QuoteRequestSingleLineQuoteItem | undefined {
  const byKey = items.find((q) => q.lineItemKey === listLineItemKey);
  if (byKey) return byKey;
  return items.find(
    (q) =>
      Number(q.orderHeaderId) === orderHeaderIdNum &&
      (q.intraloxPartNumber ?? "").trim() === (line.intraloxPartNumber ?? "").trim() &&
      (q.customerPartNumber ?? "").trim() === (line.customerPartNumber ?? "").trim() &&
      (q.quantity?.value ?? 0) === line.quantity
  );
}

export function lineItemKeyInDraft(draft: QuoteRequestDraftDto, lineItemKey: string): boolean {
  if (draft.singleLineItem.quoteItems.some((q) => q.lineItemKey === lineItemKey)) {
    return true;
  }
  return draft.orderQuote.quoteItems.some((o) =>
    o.lineItems.some((li) => li.lineItemKey === lineItemKey)
  );
}

/** One row of {@link QuoteRequestOrderQuoteLineItem} from the orders / order-detail line model. */
export function buildOrderQuoteLineFromOrderLine(
  line: OrderLineItem,
  lineItemKey: string,
  comments: string
): QuoteRequestOrderQuoteLineItem {
  return {
    quoteOrderLineItemId: 0,
    lineItemKey,
    customerPartNumber: line.customerPartNumber ?? "",
    productType: line.productType ?? "",
    intraloxPartNumber: line.intraloxPartNumber ?? "",
    partDescription: { value: line.description ?? "", language: "en-US" },
    quantity: { value: line.quantity ?? 0, unit: "pieces" },
    comments: comments ?? "",
  };
}

export function countQuoteQueueItems(draft: QuoteRequestDraftDto | null | undefined): number {
  if (!draft) return 0;
  const orderLines = (draft.orderQuote?.quoteItems ?? []).reduce(
    (acc, o) => acc + (o.lineItems?.length ?? 0),
    0
  );
  return (
    (draft.general?.quoteItems?.length ?? 0) +
    (draft.singleLineItem?.quoteItems?.length ?? 0) +
    orderLines
  );
}

/**
 * Comma-separated entry types present in the queue (analytics), in order: General, Line_Item, Order_Header.
 */
export function getQuoteRequestEntryTypesCsv(
  draft: QuoteRequestDraftDto | null | undefined
): string {
  if (!draft) return "";
  const parts: string[] = [];
  if ((draft.general?.quoteItems?.length ?? 0) > 0) parts.push("General");
  if ((draft.singleLineItem?.quoteItems?.length ?? 0) > 0) parts.push("Line_Item");
  const orderLineCount = (draft.orderQuote?.quoteItems ?? []).reduce(
    (acc, o) => acc + (o.lineItems?.length ?? 0),
    0
  );
  if (orderLineCount > 0) parts.push("Order_Header");
  return parts.join(",");
}

/** For review/OM: single-line DTO from an `orderQuote` line row (use order edit/delete handlers). */
export function orderQuoteLineToSingleLineItemForReview(
  o: QuoteRequestOrderQuoteItem,
  li: QuoteRequestOrderQuoteLineItem
): QuoteRequestSingleLineQuoteItem {
  return {
    quoteSingleLineItemId: 0,
    lineItemKey: li.lineItemKey,
    poNumber: o.poNumber,
    orderNumber: o.orderNumber,
    orderHeaderId: o.orderHeaderId,
    customerPartNumber: li.customerPartNumber,
    productType: li.productType,
    intraloxPartNumber: li.intraloxPartNumber,
    comments: li.comments ?? "",
    partDescription: {
      value: li.partDescription.value,
      language: li.partDescription.language,
    },
    quantity: { value: li.quantity.value, unit: li.quantity.unit },
    sequence: 0,
  };
}

/**
 * If `lineItemKey` exists in single-line queue, returns that row; if it only exists in an
 * `orderQuote` line, returns a single-line DTO for review/edit (sequence is 0; use order handlers).
 */
export function findOrProjectSingleLineItemByKey(
  draft: QuoteRequestDraftDto,
  lineItemKey: string
): QuoteRequestSingleLineQuoteItem | undefined {
  const s = draft.singleLineItem.quoteItems.find((q) => q.lineItemKey === lineItemKey);
  if (s) return s;
  for (const o of draft.orderQuote.quoteItems) {
    for (const li of o.lineItems) {
      if (li.lineItemKey === lineItemKey) {
        return orderQuoteLineToSingleLineItemForReview(o, li);
      }
    }
  }
  return undefined;
}

/** Build order + line for the line-item step from a stored order-quote row. */
export function orderQuoteLineToOrderAndLine(
  o: QuoteRequestOrderQuoteItem,
  li: QuoteRequestOrderQuoteLineItem
): { order: OrderListItem; line: OrderLineItem } {
  const lineId = li.lineItemKey?.split("|")[1] ?? "line";
  const order: OrderListItem = {
    orderHeaderId: String(o.orderHeaderId),
    orderId: o.orderNumber,
    poNumber: o.poNumber,
    orderNumber: o.orderNumber,
    itemCount: o.lineItems.length,
    statusKey: "",
    orderDate: "",
    totalAmount: 0,
    currency: "USD",
    lineItems: [],
    shipments: [],
  };
  const line: OrderLineItem = {
    id: lineId,
    intraloxPartNumber: li.intraloxPartNumber,
    description: li.partDescription.value,
    quantity: li.quantity.value,
    customerPartNumber: li.customerPartNumber,
    productType: li.productType,
  };
  return { order, line };
}
