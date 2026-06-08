import { describe, expect, it } from "vitest";

import {
  filterQuoteDetailActiveColumnsForExpired,
  quoteDetailColumnAlignKind,
  quoteDetailColumnWidthKind,
} from "@/lib/orderDetailUtils";

describe("quoteDetailColumnWidthKind", () => {
  it("maps quantity keys to qty", () => {
    expect(quoteDetailColumnWidthKind("QUANTITY (EACH)")).toBe("qty");
    expect(quoteDetailColumnWidthKind("QTY")).toBe("qty");
  });

  it("maps net unit price keys to price", () => {
    expect(quoteDetailColumnWidthKind("NET UNIT PRICE")).toBe("price");
    expect(quoteDetailColumnWidthKind("NET_UNIT_PRICE")).toBe("price");
  });

  it("maps extended net price keys to priceWide", () => {
    expect(quoteDetailColumnWidthKind("EXTENDED NET PRICE")).toBe("priceWide");
    expect(quoteDetailColumnWidthKind("EXTENDED_NET_PRICE")).toBe("priceWide");
  });

  it("falls back to default for unknown keys", () => {
    expect(quoteDetailColumnWidthKind("PRODUCT TYPE")).toBe("default");
  });
});

describe("quoteDetailColumnAlignKind", () => {
  it("centers quantity and right-aligns price columns", () => {
    expect(quoteDetailColumnAlignKind("QUANTITY (EACH)")).toBe("center");
    expect(quoteDetailColumnAlignKind("NET UNIT PRICE")).toBe("right");
    expect(quoteDetailColumnAlignKind("EXTENDED NET PRICE")).toBe("right");
  });

  it("left-aligns unknown columns", () => {
    expect(quoteDetailColumnAlignKind("PRODUCT TYPE")).toBe("left");
  });
});

describe("filterQuoteDetailActiveColumnsForExpired", () => {
  const columns = [
    { id: "qty", fields: { Value: { value: "QUANTITY (EACH)" } } },
    { id: "net", fields: { Value: { value: "NET UNIT PRICE" } } },
    { id: "ext", fields: { Value: { value: "EXTENDED NET PRICE" } } },
  ];

  it("removes price columns but keeps quantity", () => {
    const filtered = filterQuoteDetailActiveColumnsForExpired(columns);
    expect(filtered.map((c) => c.id)).toEqual(["qty"]);
  });

  it("preserves CMS multilist order for remaining columns", () => {
    const reordered = [
      { id: "ext", fields: { Value: { value: "EXTENDED NET PRICE" } } },
      { id: "qty", fields: { Value: { value: "QUANTITY (EACH)" } } },
      { id: "net", fields: { Value: { value: "NET UNIT PRICE" } } },
    ];
    const filtered = filterQuoteDetailActiveColumnsForExpired(reordered);
    expect(filtered.map((c) => c.id)).toEqual(["qty"]);
  });
});
