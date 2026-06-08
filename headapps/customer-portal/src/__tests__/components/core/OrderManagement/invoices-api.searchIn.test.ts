import { describe, expect, it } from "vitest";

import { resolveInvoiceSearchInFromCmsSearchAttributes } from "@/lib/apis/invoices-api";

describe("resolveInvoiceSearchInFromCmsSearchAttributes", () => {
  it("maps Sitecore Value labels with # shorthand to API searchIn fields", () => {
    const searchIn = resolveInvoiceSearchInFromCmsSearchAttributes([
      {
        id: "fe80f402-ca70-4191-967c-d3d6e7affcc0",
        displayName: "Invoice Number",
        fields: { Value: { value: "Invoice #" } },
      },
      {
        id: "1481764f-08c7-48e4-9e41-fd31cf9cb7ab",
        displayName: "PO Number",
        fields: { Value: { value: "PO #" } },
      },
      {
        id: "95d31306-9f0d-4eac-b47f-9f3916828726",
        displayName: "Order Number",
        fields: { Value: { value: "Order #" } },
      },
    ]);

    expect(searchIn).toEqual(["invoiceNum", "poNumber", "orderId"]);
  });

  it("falls back to displayName when Value does not map", () => {
    const searchIn = resolveInvoiceSearchInFromCmsSearchAttributes([
      { id: "1", displayName: "Invoice Number", fields: { Value: { value: "Unknown label" } } },
      { id: "2", displayName: "PO Number", fields: { Value: { value: "Unknown label" } } },
      { id: "3", displayName: "Order Number", fields: {} },
    ]);

    expect(searchIn).toEqual(["invoiceNum", "poNumber", "orderId"]);
  });
});
