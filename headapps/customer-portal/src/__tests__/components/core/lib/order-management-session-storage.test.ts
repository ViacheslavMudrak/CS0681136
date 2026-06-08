import { beforeEach, describe, expect, it } from "vitest";

import {
  clearOrderManagementFiltersStorage,
  ORDER_MANAGEMENT_FILTERS_STORAGE_KEY,
  readOrderManagementFilters,
  resolveOrderManagementStatusKeysForHydration,
  writeOrderManagementFilters,
  type OrderManagementFiltersPersistedV1,
} from "@/lib/order-management-session-storage";

const PAGE_OPTS = [25, 50];
const DEFAULT_PS = 25;

function baseSnapshot(
  overrides: Partial<OrderManagementFiltersPersistedV1> = {}
): OrderManagementFiltersPersistedV1 {
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
    sortColumn: "orderDate",
    sortDir: "desc",
    ...overrides,
  };
}

describe("order-management-session-storage (orders tab)", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("reads and writes orders filters per account", () => {
    const snapshot = baseSnapshot({
      searchInput: "so",
      appliedSearch: "so",
      statusKeys: ["open"],
      hasUserModifiedFilters: true,
      sortColumn: "orderDate",
    });
    writeOrderManagementFilters("acc1", snapshot, PAGE_OPTS, DEFAULT_PS);
    const readOrders = readOrderManagementFilters("acc1", PAGE_OPTS, DEFAULT_PS);
    expect(readOrders?.searchInput).toBe("so");
    expect(readOrders?.statusKeys).toEqual(["open"]);
    expect(readOrders?.hasUserModifiedFilters).toBe(true);
    expect(readOrders?.sortColumn).toBe("orderDate");
  });

  it("keeps account entries separate", () => {
    writeOrderManagementFilters(
      "acc1",
      baseSnapshot({ statusKeys: ["shipped"] }),
      PAGE_OPTS,
      DEFAULT_PS
    );
    writeOrderManagementFilters(
      "acc2",
      baseSnapshot({ statusKeys: ["open"] }),
      PAGE_OPTS,
      DEFAULT_PS
    );
    expect(readOrderManagementFilters("acc1", PAGE_OPTS, DEFAULT_PS)?.statusKeys).toEqual([
      "shipped",
    ]);
    expect(readOrderManagementFilters("acc2", PAGE_OPTS, DEFAULT_PS)?.statusKeys).toEqual(["open"]);
  });

  it("returns null for invalid persisted sort column", () => {
    sessionStorage.setItem(
      ORDER_MANAGEMENT_FILTERS_STORAGE_KEY,
      JSON.stringify({
        v: 1,
        accounts: {
          acc1: { ...baseSnapshot(), sortColumn: "invoiceStatus" },
        },
      })
    );
    expect(readOrderManagementFilters("acc1", PAGE_OPTS, DEFAULT_PS)).toBeNull();
  });

  it("clamps page size to allowed options", () => {
    writeOrderManagementFilters("acc1", baseSnapshot({ pageSize: 999 }), PAGE_OPTS, DEFAULT_PS);
    expect(readOrderManagementFilters("acc1", PAGE_OPTS, DEFAULT_PS)?.pageSize).toBe(DEFAULT_PS);
  });

  it("writes an explicit unmodified marker for first-load default snapshots", () => {
    writeOrderManagementFilters(
      "acc1",
      baseSnapshot({ statusKeys: ["order_placed"] }),
      PAGE_OPTS,
      DEFAULT_PS
    );
    expect(readOrderManagementFilters("acc1", PAGE_OPTS, DEFAULT_PS)?.hasUserModifiedFilters).toBe(
      false
    );
  });

  it("treats legacy snapshots without the marker as user-modified", () => {
    sessionStorage.setItem(
      ORDER_MANAGEMENT_FILTERS_STORAGE_KEY,
      JSON.stringify({
        v: 1,
        accounts: {
          acc1: baseSnapshot({ statusKeys: [] }),
        },
      })
    );

    const readOrders = readOrderManagementFilters("acc1", PAGE_OPTS, DEFAULT_PS);
    expect(readOrders?.hasUserModifiedFilters).toBe(true);
  });

  it("uses CMS status defaults only when there is no persisted orders snapshot", () => {
    const cmsDefaultStatusKeys = ["order_placed"];
    const persisted = baseSnapshot({
      statusKeys: [],
      belt: { series: ["1100"], style: [], material: ["ACETAL"], color: ["BLUE"] },
      hasUserModifiedFilters: true,
    });

    expect(resolveOrderManagementStatusKeysForHydration(null, cmsDefaultStatusKeys)).toEqual([
      "order_placed",
    ]);
    expect(resolveOrderManagementStatusKeysForHydration(persisted, cmsDefaultStatusKeys)).toEqual(
      []
    );
  });

  it("clears orders filters storage for logout and fresh-login reset", () => {
    writeOrderManagementFilters(
      "acc1",
      baseSnapshot({ statusKeys: ["order_placed"] }),
      PAGE_OPTS,
      DEFAULT_PS
    );
    clearOrderManagementFiltersStorage();
    expect(readOrderManagementFilters("acc1", PAGE_OPTS, DEFAULT_PS)).toBeNull();
  });
});
