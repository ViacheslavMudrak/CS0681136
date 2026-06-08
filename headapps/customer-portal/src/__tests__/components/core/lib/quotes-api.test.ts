import { describe, expect, it } from "vitest";

import { mapQuoteApiRowToRecord, type DxpQuotesApiQuoteRow } from "@/lib/apis/quotes-api";
import { quoteDetailRouteId } from "@/lib/orderManagementUtils";

const LIVE_API_ROW: DxpQuotesApiQuoteRow = {
  quoteId: "3750326",
  contactPersonName: "Martinez, Terri Lynn",
  itemCount: 1,
  status: "Ready",
  quoteDate: "2026-01-23T16:02:55.000-06:00",
  expiresInDays: 47,
  quoteHeaderId: "22605550",
  totalAmount: {
    value: 5000,
    currency: "USD",
    displayValue: "5,000.00",
  },
  documentUrl: "",
};

describe("mapQuoteApiRowToRecord", () => {
  it("maps display quoteId and navigation quoteHeaderId from live API shape", () => {
    const record = mapQuoteApiRowToRecord(LIVE_API_ROW);

    expect(record.quoteId).toBe("3750326");
    expect(record.quoteNumber).toBe("3750326");
    expect(record.quoteHeaderId).toBe("22605550");
    expect(record.orderHeaderId).toBe(22605550);
    expect(record.contactPerson).toBe("Martinez, Terri Lynn");
    expect(record.totalAmount).toBe(5000);
  });

  it("does not replace quoteId with orderHeaderId when only legacy orderHeaderId is present", () => {
    const record = mapQuoteApiRowToRecord({
      quoteId: "3750326",
      orderHeaderId: 22605550,
    });

    expect(record.quoteId).toBe("3750326");
    expect(record.quoteHeaderId).toBe("22605550");
  });

  it("falls back to quoteNumber for display when quoteId is absent", () => {
    const record = mapQuoteApiRowToRecord({
      quoteNumber: "Q-100",
      quoteHeaderId: "99",
    });

    expect(record.quoteId).toBe("Q-100");
    expect(record.quoteNumber).toBe("Q-100");
    expect(record.quoteHeaderId).toBe("99");
  });
});

describe("quoteDetailRouteId", () => {
  it("prefers quoteHeaderId over display quoteId", () => {
    const routeId = quoteDetailRouteId({
      quoteId: "3750326",
      quoteHeaderId: "22605550",
    });

    expect(routeId).toBe("22605550");
  });

  it("falls back to quoteId when quoteHeaderId is missing", () => {
    expect(quoteDetailRouteId({ quoteId: "3750326" })).toBe("3750326");
  });

  it("builds quote detail href segment from mapped live API row", () => {
    const record = mapQuoteApiRowToRecord(LIVE_API_ROW);
    const href = `/orders-management/quotes/${encodeURIComponent(quoteDetailRouteId(record))}`;

    expect(href).toBe("/orders-management/quotes/22605550");
  });
});
