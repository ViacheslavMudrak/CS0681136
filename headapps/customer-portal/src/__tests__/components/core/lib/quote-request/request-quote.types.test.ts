import { describe, it, expect } from "vitest";

import {
  countQuoteQueueItems,
  createEmptyQuoteRequestDraft,
  makeLineItemQueueKey,
} from "@/lib/quote-request/quote-request-utils";

describe("makeLineItemQueueKey", () => {
  it("joins order header and line id", () => {
    expect(makeLineItemQueueKey("123", "abc")).toBe("123|abc");
  });
});

describe("countQuoteQueueItems", () => {
  it("sums general and single-line buckets", () => {
    const d = createEmptyQuoteRequestDraft(1);
    d.general.quoteItems.push({
      application: "a",
      productDetails: "b",
      comments: "c",
      sequence: 1,
    });
    d.singleLineItem.quoteItems.push({
      lineItemKey: "1|x",
      poNumber: "",
      orderNumber: "",
      orderHeaderId: 1,
      customerPartNumber: "",
      productType: "",
      intraloxPartNumber: "",
      comments: "",
      partDescription: { value: "", language: "en-US" },
      quantity: { value: 1, unit: "pieces" },
      sequence: 2,
    });
    expect(countQuoteQueueItems(d)).toBe(2);
  });

  it("returns 0 for empty draft", () => {
    expect(countQuoteQueueItems(createEmptyQuoteRequestDraft(0))).toBe(0);
  });

  it("includes each line in orderQuote blocks", () => {
    const d = createEmptyQuoteRequestDraft(1);
    d.orderQuote.quoteItems.push({
      poNumber: "P",
      orderNumber: "1",
      orderHeaderId: 10,
      sequence: 1,
      lineItems: [
        {
          lineItemKey: "10|a",
          customerPartNumber: "c",
          productType: "",
          intraloxPartNumber: "i",
          partDescription: { value: "d", language: "en-US" },
          quantity: { value: 1, unit: "pieces" },
          comments: "",
        },
        {
          lineItemKey: "10|b",
          customerPartNumber: "c2",
          productType: "",
          intraloxPartNumber: "i2",
          partDescription: { value: "d2", language: "en-US" },
          quantity: { value: 2, unit: "pieces" },
          comments: "x",
        },
      ],
    });
    expect(countQuoteQueueItems(d)).toBe(2);
  });
});
