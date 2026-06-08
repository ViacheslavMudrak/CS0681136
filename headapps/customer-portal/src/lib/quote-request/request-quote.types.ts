/**
 * Types for Request Quote draft (DXP + client queue).
 * Aligns with backend contract; `orderQuote` holds full-order line groups (e.g. Order Detail “Create quote from order”).
 */

export interface QuoteRequestLocalizedString {
  value: string;
  language: string;
}

export interface QuoteRequestQuantity {
  value: number;
  unit: string;
}

/** General (blank) request row from header. */
export interface QuoteRequestGeneralQuoteItem {
  quoteGeneralItemId?: number;
  application: string;
  productDetails: string;
  comments: string;
  sequence: number;
}

export interface QuoteRequestSingleLinePartDescription {
  value: string;
  language: string;
}

/** Single line item row (from orders list / order detail line). */
export interface QuoteRequestSingleLineQuoteItem {
  quoteSingleLineItemId?: number;
  /** Client identity: `${orderHeaderId}|${lineId}` for queue matching. */
  lineItemKey?: string;
  poNumber: string;
  orderNumber: string;
  orderHeaderId: number;
  customerPartNumber: string;
  productType: string;
  intraloxPartNumber: string;
  comments: string;
  partDescription: QuoteRequestSingleLinePartDescription;
  quantity: QuoteRequestQuantity;
  sequence: number;
}

export interface QuoteRequestOrderQuoteLineItem {
  quoteOrderLineItemId?: number;
  lineItemKey: string;
  customerPartNumber: string;
  productType: string;
  partDescription: QuoteRequestLocalizedString;
  quantity: QuoteRequestQuantity;
  intraloxPartNumber: string;
  comments: string;
}

export interface QuoteRequestOrderQuoteItem {
  quoteOrderItemId?: number;
  poNumber: string;
  orderNumber: string;
  orderHeaderId: number;
  sequence: number;
  lineItems: QuoteRequestOrderQuoteLineItem[];
}

/** Full draft payload from GET/POST DXP quotes API. */
export interface QuoteRequestDraftDto {
  /** Logged-in user email (query on GET, field on POST). */
  email?: string;
  /** Server id after first save; required for submit (`POST /quotes/{quoteRequestId}`). */
  quoteRequestId?: number;
  accountID: number;
  status: string;
  additionalComments: string;
  general: {
    quoteItems: QuoteRequestGeneralQuoteItem[];
  };
  singleLineItem: {
    quoteItems: QuoteRequestSingleLineQuoteItem[];
  };
  orderQuote: {
    quoteItems: QuoteRequestOrderQuoteItem[];
  };
}
