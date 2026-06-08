import { describe, expect, it } from "vitest";

import type { OrderDetailApiData } from "@/components/core/OrderDetail/OrderDetail.type";

import {
  mapOrderDetailApiDataToQuoteDetail,
  mapUnknownToQuoteDetailView,
  quoteViewLinesToOrderLineItems,
} from "@/lib/quote-detail-mapper";

describe("mapUnknownToQuoteDetailView", () => {
  it("maps flat quote payload with lineItems", () => {
    const view = mapUnknownToQuoteDetailView("url-id", {
      quoteNumber: "999",
      status: "Expired",
      createdDate: "2024-06-01",
      expiryDate: "2024-07-01",
      contactPersonName: "A",
      contactPersonEmail: "a@b.com",
      lineItems: [{ intraloxPartNumber: "P1", quantityEach: 3, description: "D1", currency: "USD" }],
    });
    expect(view).not.toBeNull();
    expect(view?.quoteId).toBe("url-id");
    expect(view?.quoteNumber).toBe("999");
    expect(view?.statusKey).toBe("order_expired");
    expect(view?.lineItems[0]?.quantity?.value).toBe(3);
    expect(view?.lineItems[0]?.partDescription?.value).toBe("D1");
  });

  it("returns null for non-object payload", () => {
    expect(mapUnknownToQuoteDetailView("x", null)).toBeNull();
    expect(mapUnknownToQuoteDetailView("x", "str")).toBeNull();
  });

  it("builds partial orderSummary when only some pricing fields exist", () => {
    const view = mapUnknownToQuoteDetailView("q1", {
      quoteNumber: "1",
      status: "Ready",
      subtotal: 100,
      total: 110,
      currency: "USD",
    });
    expect(view?.orderSummary).toBeDefined();
    expect(view?.orderSummary?.subTotal?.value).toBe(100);
    expect(view?.orderSummary?.tax).toBeUndefined();
    expect(view?.orderSummary?.totalAmount?.value).toBe(110);
  });

  it("maps provisional QuoteExpiryDate into expiryDateIso", () => {
    const view = mapUnknownToQuoteDetailView("q2", {
      quoteNumber: "2",
      status: "Ready",
      QuoteExpiryDate: "2026-02-15",
    });

    expect(view?.expiryDateIso).toBe("2026-02-15");
  });
});

describe("mapOrderDetailApiDataToQuoteDetail", () => {
  it("maps pricing summary from order detail envelope", () => {
    const data: OrderDetailApiData = {
      order: {
        orderId: 333,
        orderHeaderId: 42,
        accountId: 1,
        orderDate: "2024-01-01",
        orderStatus: "READY",
      },
      contacts: { customer: [] },
      lineItems: [],
      shipments: [],
      billingAddress: {},
      orderSummary: {
        subTotal: { value: 10, currency: "USD", displayValue: "" },
        tax: { value: 1, currency: "USD", displayValue: "" },
        totalAmount: { value: 11, currency: "USD", displayValue: "" },
      },
      invoices: [],
      documents: [],
    };
    const view = mapOrderDetailApiDataToQuoteDetail("42", data);
    expect(view.quoteNumber).toBe("333");
    expect(view.orderSummary?.totalAmount?.value).toBe(11);
  });
});

describe("quoteViewLinesToOrderLineItems", () => {
  it("maps line items to OrderLineItem ids", () => {
    const lines = quoteViewLinesToOrderLineItems(
      [
        {
          intraloxPartNumber: "IX",
          customerPartNumber: "C1",
          partDescription: { value: "Desc", language: "en-US" },
          quantity: { value: 1, unit: "pieces" },
        },
      ],
      "hdr"
    );
    expect(lines).toHaveLength(1);
    expect(lines[0]?.intraloxPartNumber).toBe("IX");
    expect(lines[0]?.quantity).toBe(1);
    expect(lines[0]?.id.length).toBeGreaterThan(0);
  });
});
