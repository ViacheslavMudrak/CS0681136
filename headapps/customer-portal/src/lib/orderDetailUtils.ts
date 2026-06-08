import type { Field, LinkField } from "@sitecore-content-sdk/nextjs";

import type {
  IOrderDetailFields,
  OrderDetailApiData,
  OrderDetailBillingAddress,
  OrderDetailContact,
  OrderDetailDocument,
  OrderDetailDocumentEntryItem,
  OrderDetailLineItem,
  OrderDetailMoney,
  OrderDetailNameValueItem,
  OrderDetailOrderHeader,
} from "@/components/core/OrderDetail/OrderDetail.type";
import type { OrderListItem, OrderLineItem } from "@/lib/apis/orders-api";
import { mapOrderStatusToKey } from "@/lib/apis/orders-api";
import { formatCurrencyAmount } from "@/lib/orderManagementUtils";
import { buildQuoteRequestLineId } from "@/lib/quote-request/quote-line-id";
import {
  isDocumentRequestSelectionItem,
  isQuoteRequestSelectionItem,
  listQuoteSelectionItems,
} from "@/lib/quote-request/quote-request-utils";

/** Default mobile stack when {@link MobileSectionOrderSelection} is empty. */
export const DEFAULT_MOBILE_SECTION_ORDER = ["billing", "shipment", "documents", "items"] as const;

export type MobileSectionKey = (typeof DEFAULT_MOBILE_SECTION_ORDER)[number];

/**
 * Parses multilist rows whose `Value` holds a section key (billing | shipment | documents | items).
 */
export function parseMobileSectionOrder(
  items: OrderDetailNameValueItem[] | undefined
): MobileSectionKey[] {
  const allowed = new Set<string>(DEFAULT_MOBILE_SECTION_ORDER);
  const out: MobileSectionKey[] = [];
  for (const row of items ?? []) {
    const v = row.fields?.Value?.value?.trim().toLowerCase();
    if (v && allowed.has(v) && !out.includes(v as MobileSectionKey)) {
      out.push(v as MobileSectionKey);
    }
  }
  for (const k of DEFAULT_MOBILE_SECTION_ORDER) {
    if (!out.includes(k)) out.push(k);
  }
  return out;
}

export function resolveSectionTitlePattern(
  pattern: Field<string> | undefined,
  count: number
): string {
  const raw = pattern?.value ?? "";
  return raw.replace(/\{count\}/gi, `(${String(count)})`);
}

export function formatPartLabelLine(
  labelField: Field<string> | undefined,
  value: string | undefined
): string | null {
  const label = (labelField?.value ?? "").trim();
  const v = (value ?? "").trim();
  if (!v) return null;
  if (!label) return v;
  return `${label} #${v}`;
}

export function parsePositiveIntField(field: Field<string> | undefined, fallback: number): number {
  const n = parseInt(String(field?.value ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** CMS multilist rows whose `fields.Value` is a positive page size (Order Detail, Order Management, etc.). */
export function parseCmsPageSizeMultilist(
  list: ReadonlyArray<{ fields?: { Value?: Field<string> } }> | undefined
): number[] {
  if (!list?.length) return [];
  const nums = list
    .map((item) => parseInt(String(item.fields?.Value?.value ?? "").trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  return [...new Set(nums)].sort((a, b) => a - b);
}

/** @see {@link parseCmsPageSizeMultilist} */
export function parseOrderDetailPageSizeOptionList(
  list: OrderDetailNameValueItem[] | undefined
): number[] {
  return parseCmsPageSizeMultilist(list);
}

export function buildLineItemRowKey(item: OrderDetailLineItem, index: number): string {
  return buildQuoteRequestLineId(item, index);
}

/**
 * Builds the orders-list shapes used by the request-quote drawer for “Create quote from order” (all lines, same `line.id` as order detail kebab / row keys).
 */
export function mapOrderDetailApiToOrderListItemAndLines(
  data: OrderDetailApiData
): { order: OrderListItem; lines: OrderLineItem[] } {
  const o = data.order;
  const order: OrderListItem = {
    orderHeaderId: String(o.orderHeaderId),
    orderId: String(o.orderId),
    poNumber: o.poNumber ?? "",
    orderNumber: String(o.orderId),
    itemCount: data.lineItems?.length ?? 0,
    statusKey: mapOrderStatusToKey(o.orderStatus),
    orderDate: o.orderDate,
    totalAmount: 0,
    currency: "USD",
    lineItems: [],
    shipments: [],
  };
  const lineItems = data.lineItems ?? [];
  const lines: OrderLineItem[] = lineItems.map((li, i) => ({
    id: buildLineItemRowKey(li, i),
    intraloxPartNumber: li.intraloxPartNumber ?? "",
    description: li.partDescription?.value ?? "",
    quantity: li.quantity?.value ?? 0,
    customerPartNumber: li.customerPartNumber,
    productType: li.productType,
  }));
  return { order, lines };
}

export function sortInvoiceLanguageCodes(
  urls: Record<string, string>,
  preferredLanguageCode: string
): string[] {
  const keys = Object.keys(urls).filter((k) => Boolean(urls[k]?.trim()));
  const upperPreferred = preferredLanguageCode.trim().toUpperCase();
  const set = new Set(keys.map((k) => k.toUpperCase()));
  const ordered: string[] = [];
  const pushIfPresent = (code: string) => {
    const u = code.toUpperCase();
    if (!set.has(u)) return;
    const original = keys.find((k) => k.toUpperCase() === u);
    if (original && !ordered.includes(original)) ordered.push(original);
  };
  pushIfPresent(upperPreferred || "EN");
  pushIfPresent("EN");
  const rest = keys
    .filter((k) => !ordered.includes(k))
    .sort((a, b) => a.toUpperCase().localeCompare(b.toUpperCase()));
  return [...ordered, ...rest];
}

/**
 * Replaces `{Language}` / `{LanguageCode}` with the uppercase language code (e.g. EN, TR) for invoice menu labels.
 */
export function applyInvoiceDownloadLabelPattern(
  pattern: Field<string> | undefined,
  languageCode: string
): string {
  const raw = pattern?.value ?? "";
  const code = languageCode.trim().toUpperCase();
  return raw.replace(/\{LanguageCode\}/gi, code).replace(/\{Language\}/gi, code);
}

/**
 * Replaces `{Language}` / `{LanguageCode}` with the uppercase language code (e.g. EN, TR), same as invoice menus.
 */
export function applyPackingSlipLabelPattern(
  pattern: Field<string> | undefined,
  languageCode: string
): string {
  const raw = pattern?.value ?? "";
  const code = languageCode.trim().toUpperCase();
  return raw.replace(/\{LanguageCode\}/gi, code).replace(/\{Language\}/gi, code);
}

/** Same ordering rules as invoice downloads: preferred first, EN second, then A–Z. */
export const sortPackingSlipLanguageCodes = sortInvoiceLanguageCodes;

export function formatBillingAddressLines(addr: OrderDetailBillingAddress): string[] {
  const line1 = [addr?.street, addr?.city].filter(Boolean).join(", ");
  const line2 = [addr?.state, addr?.postalCode, addr?.country].filter(Boolean).join(" ");
  return [line1, line2].filter((s) => s.trim().length > 0);
}

export function firstCustomerContact(
  contacts: OrderDetailApiData["contacts"]
): OrderDetailContact | undefined {
  return contacts?.customer?.[0];
}

/**
 * Normalizes strings for matching API document keys (documentType / documentName) to CMS item
 * `name`, `displayName`, or {@link OrderDetailDocumentEntryItem} labels (spaces/punctuation/case-insensitive).
 */
export function normalizeOrderDetailDocumentMatchKey(raw: string | undefined): string {
  return (raw ?? "")
    .normalize("NFKD")
    .replace(/[\s\u200B\-_/]+/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
}

/**
 * Picks the API row whose type/name keys best match a Sitecore related-document multilist item.
 * Tries documentName and documentType against item name, displayName, and DocumentLabel.
 */
export function findMatchingOrderDetailApiDocument(
  entry: OrderDetailDocumentEntryItem,
  documents: ReadonlyArray<OrderDetailDocument> | undefined
): OrderDetailDocument | undefined {
  if (!documents?.length) return undefined;

  const candidateKeys = [
    entry.name,
    entry.displayName,
    entry.fields?.DocumentLabel?.value,
  ]
    .map((s) => normalizeOrderDetailDocumentMatchKey(String(s ?? "")))
    .filter(Boolean);

  const seen = new Set<string>();
  const uniqueCandidates = candidateKeys.filter((k) => {
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  for (const doc of documents) {
    const nameKey = normalizeOrderDetailDocumentMatchKey(doc.documentName);
    const typeKey = normalizeOrderDetailDocumentMatchKey(doc.documentType);
    const combined = `${typeKey}${nameKey}`;

    const docKeys = [nameKey, typeKey, combined].filter(Boolean);

    for (const dKey of docKeys) {
      for (const cKey of uniqueCandidates) {
        if (!dKey || !cKey) continue;
        if (dKey === cKey) return doc;
        if (dKey.length >= 4 && cKey.length >= 4 && (dKey.includes(cKey) || cKey.includes(dKey))) {
          return doc;
        }
      }
    }
  }

  return undefined;
}

/**
 * Prefer Content Hub asset URL, then direct document URL, for opening related documents.
 */
export function resolveOrderDetailDocumentOpenUrl(doc: OrderDetailDocument | undefined): string | null {
  if (!doc) return null;
  const asset = (doc.assetDetailsUrl ?? "").trim();
  if (asset) return asset;
  const direct = (doc.documentUrl ?? "").trim();
  if (direct) return direct;
  return null;
}

export function normalizeColumnValueKey(raw: string | undefined): string {
  return (raw ?? "").trim().toUpperCase().replace(/\s+/g, " ");
}

function removeDollarCountryPrefix(value: string): string {
  return value.replace(/\b[A-Z]{1,3}\$/g, "$");
}

/** Prefer API `displayValue` when it includes a currency symbol; otherwise format with locale. */
export function formatOrderDetailMoneyForDisplay(
  money: OrderDetailMoney | undefined,
  locale: string
): string {
  if (!money) return "—";
  const displayValue = (money.displayValue ?? "").trim();
  if (displayValue && /[$€£¥]/.test(displayValue)) {
    return removeDollarCountryPrefix(displayValue);
  }
  return removeDollarCountryPrefix(formatCurrencyAmount(money.value, money.currency, locale));
}

/** Matches ActiveColumns `Value` for extended net (e.g. Extended Net Price, EXTENDED_NET_PRICE). */
export function isOrderDetailExtendedNetPriceColumnKey(keyNorm: string): boolean {
  return (
    keyNorm.includes("EXTENDED NET") ||
    keyNorm.includes("EXTENDED_NET") ||
    (keyNorm.includes("EXTENDED") && keyNorm.includes("NET") && keyNorm.includes("PRICE"))
  );
}

/** Matches ActiveColumns `Value` for net unit price (e.g. Net Unit Price, NET_UNIT_PRICE). */
export function isOrderDetailNetUnitPriceColumnKey(keyNorm: string): boolean {
  if (keyNorm.includes("EXTENDED")) return false;
  return keyNorm.includes("NET UNIT") || keyNorm.includes("NET_UNIT");
}

export type QuoteDetailColumnWidthKind = "qty" | "price" | "priceWide" | "default";

/** Maps a normalized CMS column key to fixed table column width (Quote Detail grid). */
export function quoteDetailColumnWidthKind(keyNorm: string): QuoteDetailColumnWidthKind {
  if (keyNorm.includes("QUANTITY") || keyNorm === "QTY") return "qty";
  if (isOrderDetailExtendedNetPriceColumnKey(keyNorm)) return "priceWide";
  if (isOrderDetailNetUnitPriceColumnKey(keyNorm)) return "price";
  return "default";
}

export type QuoteDetailColumnAlignKind = "center" | "right" | "left";

/** Horizontal alignment for Quote Detail data columns (Figma: qty center, prices right). */
export function quoteDetailColumnAlignKind(keyNorm: string): QuoteDetailColumnAlignKind {
  const widthKind = quoteDetailColumnWidthKind(keyNorm);
  if (widthKind === "qty") return "center";
  if (widthKind === "price" || widthKind === "priceWide") return "right";
  return "left";
}

/** Tailwind text-align utility for order/quote detail table headers and cells. */
export function orderDetailColumnTextAlignClass(keyNorm: string): string {
  switch (quoteDetailColumnAlignKind(keyNorm)) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    default:
      return "text-left";
  }
}

/** Active quote-detail columns with price fields removed for expired quotes. */
export function filterQuoteDetailActiveColumnsForExpired<
  T extends { fields?: { Value?: { value?: string } }; displayName?: string },
>(columns: T[]): T[] {
  return columns.filter((col) => {
    const k = normalizeColumnValueKey(col.fields?.Value?.value ?? col.displayName);
    return !isOrderDetailNetUnitPriceColumnKey(k) && !isOrderDetailExtendedNetPriceColumnKey(k);
  });
}

export function getLinkFieldHref(link?: LinkField): string | null {
  const raw = link?.value;
  if (!raw || typeof raw !== "object") return null;
  const href = (raw as { href?: string }).href?.trim();
  return href || null;
}

/**
 * Normalizes a CMS label for analytics event parameters (underscores, trimmed).
 */
export function normalizeOrderDetailEventLabel(value: string): string {
  return value.trim().replace(/\s+/g, "_");
}

/**
 * Derives a file identifier from a Sitecore link field href (last path segment, query stripped).
 */
export function resolveOrderDetailDocumentFileNameFromLink(link: LinkField): string {
  const href = getLinkFieldHref(link) ?? "";
  const withoutQuery = href.split("?")[0] ?? "";
  const lastSegment = withoutQuery.split("/").filter(Boolean).pop() ?? "";
  return decodeURIComponent(lastSegment || "document");
}

/** Respects Sitecore General Link: external, absolute http(s), or target _blank → new tab. */
export function shouldOpenLinkFieldInNewTab(link?: LinkField): boolean {
  const raw = link?.value;
  if (!raw || typeof raw !== "object") return false;
  const v = raw as { href?: string; linktype?: string; target?: string };
  if (!v.href) return false;
  const linktype = String(v.linktype ?? "").toLowerCase();
  const target = String(v.target ?? "");
  if (linktype === "external") return true;
  if (/^https?:\/\//i.test(v.href)) return true;
  if (target === "_blank") return true;
  return false;
}

/**
 * Opens a CMS General Link: new tab for external / blank targets; client navigation for app paths.
 */
export function openLinkField(link: LinkField | undefined, navigate: (path: string) => void): void {
  const href = getLinkFieldHref(link);
  if (!href) return;
  if (shouldOpenLinkFieldInNewTab(link)) {
    window.open(href, "_blank", "noopener,noreferrer");
    return;
  }
  if (href.startsWith("/")) {
    navigate(href);
    return;
  }
  window.location.assign(href);
}

/**
 * Support mailto: account email from profile wins; otherwise CMS fallback field.
 */
export function resolveOrderDetailSupportMailto(
  accountSupportEmail: string | undefined,
  fallbackEmailField: Field<string> | undefined
): string | undefined {
  const fromAccount = accountSupportEmail?.trim();
  if (fromAccount) return `mailto:${fromAccount}`;
  const fb = (fallbackEmailField?.value ?? "").trim();
  if (fb) return `mailto:${fb}`;
  return undefined;
}

/**
 * Badge variant for the order detail header status chip (icon + colors).
 * Keys match `mapOrderStatusToKey` in `@/lib/apis/orders-api` (e.g. `order_shipped`, `order_placed`, `order_cancelled`).
 */
export type OrderDetailHeaderStatusVariant = "shipped" | "placed" | "cancelled" | "default";

/**
 * Resolves which badge variant to show for a normalized order status key.
 * Uses exact keys only so values like `order_not_shipped` do not pick the shipped style.
 * US/UK spelling for cancelled is handled when the mapper emits either key.
 */
export function resolveOrderDetailHeaderStatusVariant(statusKey: string): OrderDetailHeaderStatusVariant {
  const k = statusKey.trim().toLowerCase();
  switch (k) {
    case "order_shipped":
      return "shipped";
    case "order_placed":
      return "placed";
    case "order_cancelled":
    case "order_canceled":
      return "cancelled";
    default:
      return "default";
  }
}

export type OrderDetailLineMenuItemKind = "quote" | "document";

export interface OrderDetailLineMenuItemTemplate {
  id: string;
  kind: OrderDetailLineMenuItemKind;
  label: string;
}

const QUOTE_REQUEST_ITEM_ID = "bd8899f9-7528-4a7a-9677-77f3f9f31042";
const DOCUMENT_REQUEST_ITEM_ID = "89838e01-1fd8-4eb9-ae2e-01f872026522";

const getLabelFromFields = (fields: IOrderDetailFields, id: string) => {
  if (id === QUOTE_REQUEST_ITEM_ID) {
    return fields.KebabRequestNewQuoteLabel?.value ?? "";
  }
  if (id === DOCUMENT_REQUEST_ITEM_ID) {
    return fields.KebabRequestDocumentLabel?.value ?? "";
  }
  return "";
};
/**
 * Resolves line-item kebab menu entries from `QuoteSelection` (same multilist as Order Management)
 * with legacy fallback to `RequestNewQuoteLabel` / `RequestDocumentLabel`.
 */
export function buildOrderDetailLineMenuItemTemplates(
  fields: IOrderDetailFields,
  canRequestDocumentation: boolean,
  canInitiateRfq: boolean
): OrderDetailLineMenuItemTemplate[] {
  const fromList = listQuoteSelectionItems(fields);
  const out: OrderDetailLineMenuItemTemplate[] = [];
  for (const item of fromList) {
    const label = getLabelFromFields(fields, item.id ?? "");
    if (isQuoteRequestSelectionItem(item) && canInitiateRfq && label) {
      out.push({ id: item.id ?? "quote-request", kind: "quote", label });
    } else if (isDocumentRequestSelectionItem(item) && canRequestDocumentation && label) {
      out.push({ id: item.id ?? "document-request", kind: "document", label });
    }
  }
  if (out.length > 0) return out;
  if (canInitiateRfq && fields.RequestNewQuoteLabel?.value) {
    out.push({
      id: "legacy-quote",
      kind: "quote",
      label: String(fields.RequestNewQuoteLabel.value).trim(),
    });
  }
  if (canRequestDocumentation && fields.RequestDocumentLabel?.value) {
    out.push({
      id: "legacy-doc",
      kind: "document",
      label: String(fields.RequestDocumentLabel.value).trim(),
    });
  }
  return out;
}

/**
 * Maps an order detail line to {@link OrderListItem} + {@link OrderLineItem} for the request-quote flow
 * (same `openFromLineItem` as Order Management’s orders list).
 */
export function mapOrderDetailToQuoteOrderAndLine(
  order: OrderDetailOrderHeader,
  orderNumberDisplay: string,
  lineItem: OrderDetailLineItem,
  stableLineId: string
): { order: OrderListItem; line: OrderLineItem } {
  const line: OrderLineItem = {
    id: stableLineId,
    intraloxPartNumber: lineItem.intraloxPartNumber ?? "",
    description: lineItem.partDescription?.value ?? "",
    quantity: lineItem.quantity?.value ?? 0,
    customerPartNumber: lineItem.customerPartNumber,
    productType: lineItem.productType,
  };
  const orderList: OrderListItem = {
    orderHeaderId: String(order.orderHeaderId),
    orderId: String(order.orderId),
    poNumber: order.poNumber ?? "",
    orderNumber: orderNumberDisplay,
    itemCount: 0,
    statusKey: mapOrderStatusToKey(order.orderStatus),
    orderDate: order.orderDate,
    totalAmount: 0,
    currency: "USD",
    lineItems: [],
    shipments: [],
  };
  return { order: orderList, line };
}
