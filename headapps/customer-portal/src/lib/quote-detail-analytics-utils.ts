import type { QuoteDetailEntryPoint } from "@/lib/quote-detail-entry-point";
import type { QuoteDetailQuoteStatus, QuoteDetailUserType } from "@/lib/types/EventTypes";

export function mapQuoteStatus(statusKey: string): QuoteDetailQuoteStatus {
  return statusKey === "order_ready" ? "ready" : "expired";
}

export function resolveQuoteDetailUserType(
  loggedInEmail: string | undefined,
  accountRepEmail: string | undefined
): QuoteDetailUserType {
  const user = (loggedInEmail ?? "").trim().toLowerCase();
  const rep = (accountRepEmail ?? "").trim().toLowerCase();
  if (!user || !rep) return "external";
  return user === rep ? "internal" : "external";
}

export interface QuoteDetailAnalyticsContext {
  quoteNumber: string;
  quoteStatus: QuoteDetailQuoteStatus;
  userType: QuoteDetailUserType;
  itemsCount: number;
}

export function buildQuoteDetailAnalyticsContext(params: {
  quoteNumber: string;
  statusKey: string;
  itemsCount: number;
  loggedInEmail?: string;
  accountRepEmail?: string;
}): QuoteDetailAnalyticsContext {
  return {
    quoteNumber: params.quoteNumber,
    quoteStatus: mapQuoteStatus(params.statusKey),
    userType: resolveQuoteDetailUserType(params.loggedInEmail, params.accountRepEmail),
    itemsCount: params.itemsCount,
  };
}

export type { QuoteDetailEntryPoint };
