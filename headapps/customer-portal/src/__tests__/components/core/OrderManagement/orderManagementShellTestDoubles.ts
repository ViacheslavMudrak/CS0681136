import { createRef } from "react";
import { vi } from "vitest";

import { PRESET_NONE_ID } from "@/components/core/OrderManagement/orderManagementLabels";
import type { IOrderManagementFields, OrderManagementTabFields } from "@/components/core/OrderManagement/OrderManagement.type";
import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";

const minimalRootFields: IOrderManagementFields = {
  Title: { value: "Orders" },
  SubTitle: { value: "Manage orders" },
};

export const minimalInvoiceQuoteTabFields: OrderManagementTabFields = {
  SearchPlaceholder: { value: "Search" },
  FilterLabel: { value: "Status" },
  FilterOptions: [
    {
      id: "opt-open",
      displayName: "Open",
      fields: {
        StatusValue: { value: "Open" },
        Statuskey: { value: "open" },
      },
    },
  ],
};

function resolveListingCompactViewport(
  overrides: Partial<OrderManagementShell>
): boolean {
  if (overrides.isListingCompactViewport != null) {
    return overrides.isListingCompactViewport;
  }
  return overrides.isMobile === true;
}

export function createMinimalShipmentShell(
  overrides: Partial<OrderManagementShell> = {}
): OrderManagementShell {
  const dateRef = createRef<HTMLDivElement>();
  const isListingCompactViewport = resolveListingCompactViewport(overrides);
  const base = {
    tabFields: {
      SearchPlaceholder: { value: "Search shipments" },
    },
    isMobile: isListingCompactViewport,
    isListingCompactViewport,
    searchInput: "",
    handleSearchInputChange: vi.fn(),
    handleSearchInputKeyDown: vi.fn(),
    setAppliedSearch: vi.fn(),
    setCurrentPage: vi.fn(),
    applySearchAllAttributes: vi.fn(),
    openDate: false,
    setOpenDate: vi.fn(),
    setMobileSheet: vi.fn(),
    dateRef,
    openDatePanel: vi.fn(),
    dateTriggerLabel: "Jan 1 – Jan 31",
    selectedPresetId: PRESET_NONE_ID,
    defaultPresetId: PRESET_NONE_ID,
    allowCustomDateRange: true,
  };
  return {
    ...base,
    ...overrides,
    isListingCompactViewport:
      overrides.isListingCompactViewport ?? resolveListingCompactViewport(overrides),
    isMobile: overrides.isMobile ?? isListingCompactViewport,
  } as OrderManagementShell;
}

export function createMinimalInvoiceOrQuoteShell(
  overrides: Partial<OrderManagementShell> = {}
): OrderManagementShell {
  const statusRef = createRef<HTMLDivElement>();
  const dateRef = createRef<HTMLDivElement>();
  const isListingCompactViewport = resolveListingCompactViewport(overrides);
  const base = {
    fields: minimalRootFields,
    tabFields: minimalInvoiceQuoteTabFields,
    isMobile: isListingCompactViewport,
    isListingCompactViewport,
    searchInput: "",
    handleSearchInputChange: vi.fn(),
    handleSearchInputKeyDown: vi.fn(),
    setAppliedSearch: vi.fn(),
    setCurrentPage: vi.fn(),
    applySearchAllAttributes: vi.fn(),
    openStatus: false,
    setOpenStatus: vi.fn(),
    openDate: false,
    setOpenDate: vi.fn(),
    setMobileSheet: vi.fn(),
    statusRef,
    dateRef,
    openDatePanel: vi.fn(),
    dateTriggerLabel: "Jan 1 – Jan 31",
    selectedPresetId: PRESET_NONE_ID,
    defaultPresetId: PRESET_NONE_ID,
    allowCustomDateRange: true,
    statusSelections: new Set<string>(),
    statusDraft: new Set<string>(),
    toggleStatusDraftOption: vi.fn(),
    syncStatusDraftFromApplied: vi.fn(),
    syncBeltDraftFromApplied: vi.fn(),
    mobileSheet: null as "filters" | "date" | null,
    hideStatusFilter: false,
  };
  return {
    ...base,
    ...overrides,
    isListingCompactViewport:
      overrides.isListingCompactViewport ?? resolveListingCompactViewport(overrides),
    isMobile: overrides.isMobile ?? isListingCompactViewport,
  } as OrderManagementShell;
}
