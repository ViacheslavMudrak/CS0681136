import type {
  OrderDetailApiData,
  OrderDetailLineItem,
  OrderDetailMoney,
  OrderDetailOrderSummary,
} from "@/components/core/OrderDetail/OrderDetail.type";
import { mapOrderStatusToKey } from "@/lib/apis/orders-api";
import { buildLineItemRowKey } from "@/lib/orderDetailUtils";

/** Pricing summary for quote detail; each slice may be absent when DXP omits values. */
export type QuoteDetailPricingSummary = {
  subTotal?: OrderDetailMoney;
  tax?: OrderDetailMoney;
  totalAmount?: OrderDetailMoney;
};

/** Normalized quote detail for the portal UI (independent of raw DXP naming). */
export interface QuoteDetailViewData {
  quoteId: string;
  quoteNumber: string;
  statusKey: string;
  createdDateIso: string;
  expiryDateIso: string;
  contactName: string;
  contactEmail: string;
  lineItems: OrderDetailLineItem[];
  orderSummary?: QuoteDetailPricingSummary;
}

function moneyFromUnknown(
  value: unknown,
  currency: string | undefined,
  displayValue?: unknown
): OrderDetailMoney | undefined {
  const num = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(num)) return undefined;
  const cur = (currency ?? "USD").trim() || "USD";
  return {
    value: num,
    currency: cur,
    displayValue: typeof displayValue === "string" ? displayValue : "",
  };
}

function firstStringValue(...values: unknown[]): string | undefined {
  for (const value of values) {
    const text = typeof value === "string" ? value.trim() : "";
    if (text) return text;
  }
  return undefined;
}

function moneyWithCurrencyFallback(
  money: OrderDetailMoney | undefined,
  currencyFallback: string | undefined
): OrderDetailMoney | undefined {
  if (!money) return undefined;
  const currency = money.currency?.trim() || currencyFallback?.trim() || "USD";
  return { ...money, currency };
}

function lineFromLoose(row: Record<string, unknown>, index: number): OrderDetailLineItem {
  const qtyRaw = row.quantity ?? row.quantityEach ?? row.qty ?? row.QuantityEach;
  const qtyNum =
    typeof qtyRaw === "number" && Number.isFinite(qtyRaw)
      ? qtyRaw
      : Number.parseFloat(String(qtyRaw ?? "")) || 0;
  const desc = String(
    row.description ?? row.beltDescription ?? row.partDescription ?? row.fullDescription ?? ""
  ).trim();
  const item: OrderDetailLineItem = {
    customerPartNumber:
      String(row.customerPartNumber ?? row.customerPart ?? "").trim() || undefined,
    intraloxPartNumber:
      String(row.intraloxPartNumber ?? row.intraloxPart ?? "").trim() || undefined,
    partDescription: { value: desc, language: "en-US" },
    quantity: { value: qtyNum, unit: "pieces" },
    netUnitPrice: moneyFromUnknown(
      row.netUnitPrice ?? row.netUnit,
      String(row.currency ?? "USD"),
      row.netUnitPriceDisplay
    ),
    extendedNetPrice: moneyFromUnknown(
      row.extendedNetPrice ?? row.extendedNet,
      String(row.currency ?? "USD"),
      row.extendedNetPriceDisplay
    ),
  };
  void index;
  return item;
}

/**
 * Maps a DXP quote-detail payload to {@link QuoteDetailViewData}.
 * Supports: (1) same envelope shape as {@link OrderDetailApiData} under `data`, (2) a flat quote object with common field aliases.
 */
export function mapUnknownToQuoteDetailView(
  quoteIdFromUrl: string,
  raw: unknown
): QuoteDetailViewData | null {
  if (!raw || typeof raw !== "object") return null;
  const root = raw as Record<string, unknown>;

  if ("order" in root && root.order && typeof root.order === "object") {
    return mapOrderDetailApiDataToQuoteDetail(
      quoteIdFromUrl,
      root as unknown as OrderDetailApiData
    );
  }

  const d = (
    "quote" in root && root.quote && typeof root.quote === "object"
      ? (root.quote as Record<string, unknown>)
      : root
  ) as Record<string, unknown>;

  const quoteNumber = String(d.quoteNumber ?? d.quoteId ?? quoteIdFromUrl).trim();
  if (!quoteNumber) return null;

  const statusRaw = String(d.status ?? d.quoteStatus ?? d.statusKey ?? "").trim();
  const statusKey =
    statusRaw.toUpperCase().includes("EXPIR") || statusRaw.toLowerCase() === "expired"
      ? "order_expired"
      : statusRaw.toUpperCase().includes("READY") || statusRaw.toLowerCase() === "ready"
        ? "order_ready"
        : statusRaw
          ? mapOrderStatusToKey(statusRaw)
          : "order_ready";

  const contactName = String(d.contactPersonName ?? d.contactName ?? d.contact ?? "").trim();
  const contactEmail = String(d.contactPersonEmail ?? d.contactEmail ?? d.email ?? "").trim();

  const createdDateIso = String(d.createdDate ?? d.quoteDate ?? d.created ?? "").trim();
  const expiryDateIso = String(
    d.QuoteExpiryDate ??
      d.quoteExpiryDate ??
      d.expiryDate ??
      d.expiresDate ??
      d.expirationDate ??
      ""
  ).trim();

  const rawLines = d.lineItems ?? d.lines ?? d.quoteLines;
  const lineItems: OrderDetailLineItem[] = Array.isArray(rawLines)
    ? (rawLines as Record<string, unknown>[]).map((row, i) => lineFromLoose(row, i))
    : [];

  const cur = String(d.currency ?? "USD");
  const sub = moneyFromUnknown(
    d.subtotal ?? d.subTotal,
    cur,
    firstStringValue(
      d.subtotalDisplay,
      d.subTotalDisplay,
      d.subtotalDisplayValue,
      d.subTotalDisplayValue
    )
  );
  const tax = moneyFromUnknown(
    d.tax ?? d.taxAmount,
    cur,
    firstStringValue(d.taxDisplay, d.taxAmountDisplay, d.taxDisplayValue, d.taxAmountDisplayValue)
  );
  const total = moneyFromUnknown(
    d.total ?? d.totalAmount,
    cur,
    firstStringValue(
      d.totalDisplay,
      d.totalAmountDisplay,
      d.totalDisplayValue,
      d.totalAmountDisplayValue
    )
  );

  let orderSummary: QuoteDetailPricingSummary | undefined;
  if (sub || tax || total) {
    orderSummary = { subTotal: sub, tax, totalAmount: total };
  }

  return {
    quoteId: quoteIdFromUrl,
    quoteNumber,
    statusKey,
    createdDateIso,
    expiryDateIso,
    contactName,
    contactEmail,
    lineItems,
    orderSummary,
  };
}

function pricingFromOrderDetailSummary(
  summary: OrderDetailOrderSummary | null | undefined
): QuoteDetailPricingSummary | undefined {
  if (!summary) return undefined;
  const { subTotal, tax, totalAmount } = summary;
  if (!subTotal && !tax && !totalAmount) return undefined;
  const currencyFallback = subTotal?.currency || totalAmount?.currency || tax?.currency || "USD";
  return {
    subTotal: moneyWithCurrencyFallback(subTotal, currencyFallback),
    tax: moneyWithCurrencyFallback(tax, currencyFallback),
    totalAmount: moneyWithCurrencyFallback(totalAmount, currencyFallback),
  };
}

export function mapOrderDetailApiDataToQuoteDetail(
  quoteIdFromUrl: string,
  data: OrderDetailApiData
): QuoteDetailViewData {
  const o = data.order;
  const contact = [...(data.contacts?.customer ?? []), ...(data.contacts?.csr ?? [])][0];
  const statusKey = mapOrderStatusToKey(o.orderStatus);
  return {
    quoteId: quoteIdFromUrl,
    quoteNumber: String(o.orderId ?? quoteIdFromUrl),
    statusKey,
    createdDateIso: o.orderDate ?? "",
    expiryDateIso: o.quoteExpiryDate ?? "",
    contactName: contact?.name ?? "",
    contactEmail: contact?.email ?? "",
    lineItems: data.lineItems ?? [],
    orderSummary: pricingFromOrderDetailSummary(data.orderSummary),
  };
}

export function quoteViewLineToOrderLineItem(
  item: OrderDetailLineItem,
  index: number,
  _quoteHeaderIdStr: string
): import("@/lib/apis/orders-api").OrderLineItem {
  const qty = item.quantity?.value;
  const quantity =
    typeof qty === "number" && Number.isFinite(qty)
      ? qty
      : Number.parseFloat(String(qty ?? "")) || 0;
  return {
    id: buildLineItemRowKey(item, index),
    customerPartNumber: item.customerPartNumber,
    intraloxPartNumber: (item.intraloxPartNumber ?? "").trim() || "—",
    description: item.partDescription?.value ?? "",
    quantity,
    productType: item.productType,
  };
}

export function quoteViewLinesToOrderLineItems(
  items: OrderDetailLineItem[],
  quoteHeaderIdStr: string
): import("@/lib/apis/orders-api").OrderLineItem[] {
  return items.map((li, i) => quoteViewLineToOrderLineItem(li, i, quoteHeaderIdStr));
}
