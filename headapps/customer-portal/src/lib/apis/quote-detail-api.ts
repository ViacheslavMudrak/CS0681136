"use client";

import type { QuoteDetailViewData } from "@/lib/quote-detail-mapper";
import { mapOrderDetailApiDataToQuoteDetail } from "@/lib/quote-detail-mapper";
import { getOrderDetail } from "@/lib/apis/order-detail-api";

export interface GetQuoteDetailParams {
  /** Route segment from `/orders-management/quotes/{id}` — parsed as `orderHeaderId` for GET order detail. */
  quoteId: string;
  accountId: number;
}

export interface QuoteDetailApiEnvelope {
  success: boolean;
  data: QuoteDetailViewData | null;
  /** When the API reports success but the quote is unknown for the account. */
  notFound?: boolean;
}

/**
 * Parses the URL segment into the numeric `orderHeaderId` used by {@link getOrderDetail}.
 */
export function parseQuoteRouteIdToOrderHeaderId(quoteId: string): number | null {
  const t = String(quoteId).trim();
  if (!t) return null;
  const direct = Number.parseInt(t, 10);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const digits = t.match(/\d+/);
  if (!digits) return null;
  const n = Number.parseInt(digits[0], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Loads quote detail via the same GET as order detail (`/orders?orderHeaderId=&accountId=`),
 * then maps {@link OrderDetailApiData} to {@link QuoteDetailViewData}.
 */
export async function getQuoteDetail({
  quoteId,
  accountId,
}: GetQuoteDetailParams): Promise<QuoteDetailApiEnvelope> {
  const trimmedQuoteId = String(quoteId).trim();
  const account = String(accountId).trim();

  if (!trimmedQuoteId || !account) {
    return { success: false, data: null };
  }

  const orderHeaderId = parseQuoteRouteIdToOrderHeaderId(trimmedQuoteId);
  if (orderHeaderId === null) {
    return { success: false, data: null, notFound: true };
  }

  const acctNum = Number.parseInt(account, 10);
  if (!Number.isFinite(acctNum)) {
    return { success: false, data: null };
  }

  const res = await getOrderDetail({ orderHeaderId, accountId: acctNum });

  if (res.notFound) {
    return { success: false, data: null, notFound: true };
  }

  if (!res.success || !res.data) {
    if (res.success && !res.data) {
      return { success: false, data: null, notFound: true };
    }
    return { success: false, data: null };
  }

  if (!res.data.order || typeof res.data.order !== "object") {
    return { success: false, data: null, notFound: true };
  }

  if (res.data.order.orderHeaderId !== orderHeaderId) {
    return { success: false, data: null, notFound: true };
  }

  const mapped = mapOrderDetailApiDataToQuoteDetail(trimmedQuoteId, res.data);
  if (!mapped) {
    return { success: false, data: null, notFound: true };
  }

  return { success: true, data: mapped };
}
