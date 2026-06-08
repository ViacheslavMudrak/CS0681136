import { describe, it, expect } from "vitest";

import type { OrderManagementTabFields } from "@/components/core/OrderManagement/OrderManagement.type";
import {
  mergeQuoteFilterOptionsWithListStatuses,
  normalizeQuoteTabFilterFields,
} from "@/components/core/OrderManagement/tabs/quotes/quoteTabFilterFields";
import type { QuoteRecord } from "@/lib/orderManagementUtils";

const cmsTab: OrderManagementTabFields = {
  FilterLabel: { value: "Status" },
  FilterOptions: [
    {
      id: "opt-ready",
      displayName: "Ready",
      fields: {
        Statuskey: { value: "READY" },
        StatusValue: { value: "Ready" },
      },
    },
    {
      id: "opt-sent",
      displayName: "Sent",
      fields: {
        Statuskey: { value: "SENT" },
        StatusValue: { value: "Sent" },
      },
    },
  ],
};

const quoteRow = (statusKey: string): QuoteRecord => ({
  quoteId: "1",
  quoteNumber: "Q1",
  contactPerson: "",
  itemCount: 0,
  statusKey,
  quoteDateIso: "2026-01-01",
  expiresInDays: null,
  totalAmount: 0,
  currency: "USD",
});

describe("normalizeQuoteTabFilterFields", () => {
  it("reads filterOptions from camelCase alternate key", () => {
    const raw = {
      filterLabel: { value: "Quote status" },
      filterOptions: [
        {
          id: "a",
          displayName: "Draft",
          fields: { Statuskey: { value: "DRAFT" }, StatusValue: { value: "Draft" } },
        },
      ],
    } as unknown as OrderManagementTabFields;

    const next = normalizeQuoteTabFilterFields(raw);
    expect(next?.FilterLabel?.value).toBe("Quote status");
    expect(next?.FilterOptions?.length).toBe(1);
    expect(next?.FilterOptions?.[0].fields?.StatusValue?.value).toBe("Draft");
  });

  it("leaves FilterOptions empty when Sitecore omits options (no fabricated defaults)", () => {
    const raw = { TabName: { value: "Quotes" } } as unknown as OrderManagementTabFields;
    const next = normalizeQuoteTabFilterFields(raw);
    expect(next?.FilterOptions ?? []).toEqual([]);
  });
});

describe("mergeQuoteFilterOptionsWithListStatuses", () => {
  it("returns tabFields unchanged when remoteQuotes is null", () => {
    const out = mergeQuoteFilterOptionsWithListStatuses(cmsTab, null);
    expect(out?.FilterOptions?.length).toBe(2);
  });

  it("returns tabFields unchanged when list is empty", () => {
    const out = mergeQuoteFilterOptionsWithListStatuses(cmsTab, []);
    expect(out?.FilterOptions?.length).toBe(2);
  });

  it("keeps all CMS options when list rows use a subset of statuses", () => {
    const rows: QuoteRecord[] = [quoteRow("order_ready"), quoteRow("order_ready")];
    const out = mergeQuoteFilterOptionsWithListStatuses(cmsTab, rows);
    expect(out?.FilterOptions?.map((o) => o.id)).toEqual(["opt-ready", "opt-sent"]);
  });

  it("appends synthetic options for API-only statuses not in CMS", () => {
    const rows: QuoteRecord[] = [quoteRow("order_ready"), quoteRow("order_custom_status")];
    const out = mergeQuoteFilterOptionsWithListStatuses(cmsTab, rows);
    expect(out?.FilterOptions?.length).toBe(3);
    expect(out?.FilterOptions?.slice(0, 2).map((o) => o.id)).toEqual(["opt-ready", "opt-sent"]);
    expect(out?.FilterOptions?.[2].id).toMatch(/^__quote-status-/);
    expect(out?.FilterOptions?.[2].fields?.StatusValue?.value).toBeTruthy();
  });

  it("forces empty FilterOptions when CMS has none but list has rows", () => {
    const tab = { FilterLabel: { value: "S" }, FilterOptions: [] } as OrderManagementTabFields;
    const out = mergeQuoteFilterOptionsWithListStatuses(tab, [quoteRow("order_ready")]);
    expect(out?.FilterOptions).toEqual([]);
  });
});
