import { beforeEach, describe, expect, it } from "vitest";

import {
  ORDER_MANAGEMENT_QUOTES_FILTERS_STORAGE_KEY,
  readOrderManagementQuotesFilters,
  writeOrderManagementQuotesFilters,
} from "@/lib/order-management-quotes-session-storage";
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
    sortColumn: "quoteDate",
    sortDir: "desc",
    ...overrides,
  };
}

describe("order-management-quotes-session-storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("persists and restores quote status filters", () => {
    writeOrderManagementQuotesFilters(
      "acc1",
      baseSnapshot({
        searchInput: "Q-321",
        appliedSearch: "Q-321",
        statusKeys: ["accepted"],
        sortColumn: "quoteStatus",
      }),
      PAGE_OPTS,
      DEFAULT_PS
    );

    const restored = readOrderManagementQuotesFilters("acc1", PAGE_OPTS, DEFAULT_PS);
    expect(restored?.statusKeys).toEqual(["accepted"]);
    expect(restored?.appliedSearch).toBe("Q-321");
    expect(restored?.sortColumn).toBe("quoteStatus");
  });

  it("rejects non-quote sort columns in persisted data", () => {
    sessionStorage.setItem(
      ORDER_MANAGEMENT_QUOTES_FILTERS_STORAGE_KEY,
      JSON.stringify({
        v: 1,
        accounts: {
          acc1: { ...baseSnapshot(), sortColumn: "invoiceStatus" },
        },
      })
    );
    expect(readOrderManagementQuotesFilters("acc1", PAGE_OPTS, DEFAULT_PS)).toBeNull();
  });
});
