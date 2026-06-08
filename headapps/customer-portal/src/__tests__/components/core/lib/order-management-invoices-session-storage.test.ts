import { beforeEach, describe, expect, it } from "vitest";

import {
  ORDER_MANAGEMENT_INVOICES_FILTERS_STORAGE_KEY,
  readOrderManagementInvoicesFilters,
  writeOrderManagementInvoicesFilters,
} from "@/lib/order-management-invoices-session-storage";
import { type OrderManagementFiltersPersistedV1 } from "@/lib/order-management-session-storage";

const PAGE_OPTS = [25, 50];
const DEFAULT_PS = 25;

function baseSnapshot(overrides: Partial<OrderManagementFiltersPersistedV1> = {}): OrderManagementFiltersPersistedV1 {
  return {
    version: 1,
    searchInput: "",
    appliedSearch: "",
    statusKeys: [],
    belt: { series: [], style: [], material: [], color: [] },
    dateStartYmd: "2025-01-01",
    dateEndYmd: "2025-01-31",
    selectedPresetId: "preset",
    currentPage: 1,
    pageSize: 25,
    sortColumn: "invoiceDate",
    sortDir: "desc",
    ...overrides,
  };
}

describe("order-management-invoices-session-storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("persists and restores invoice status filters", () => {
    writeOrderManagementInvoicesFilters(
      "acc1",
      baseSnapshot({
        searchInput: "INV-100",
        appliedSearch: "INV-100",
        statusKeys: ["paid"],
        sortColumn: "invoiceStatus",
      }),
      PAGE_OPTS,
      DEFAULT_PS
    );

    const restored = readOrderManagementInvoicesFilters("acc1", PAGE_OPTS, DEFAULT_PS);
    expect(restored?.statusKeys).toEqual(["paid"]);
    expect(restored?.appliedSearch).toBe("INV-100");
    expect(restored?.sortColumn).toBe("invoiceStatus");
  });

  it("rejects non-invoice sort columns in persisted data", () => {
    sessionStorage.setItem(
      ORDER_MANAGEMENT_INVOICES_FILTERS_STORAGE_KEY,
      JSON.stringify({
        v: 1,
        accounts: {
          acc1: { ...baseSnapshot(), sortColumn: "quoteDate" },
        },
      })
    );
    expect(readOrderManagementInvoicesFilters("acc1", PAGE_OPTS, DEFAULT_PS)).toBeNull();
  });
});
