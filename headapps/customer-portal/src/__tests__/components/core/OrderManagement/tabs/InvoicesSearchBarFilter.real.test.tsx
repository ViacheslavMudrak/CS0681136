import type { MutableRefObject } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InvoicesSearchBarFilter } from "@/components/core/OrderManagement/tabs/invoices/InvoicesSearchBarFilter";
import {
  PRESET_LAST_12_MONTHS_ID,
  PRESET_NONE_ID,
} from "@/components/core/OrderManagement/orderManagementLabels";

import {
  createMinimalInvoiceOrQuoteShell,
  minimalInvoiceQuoteTabFields,
  minimalRootFields,
} from "../orderManagementShellTestDoubles";

vi.mock("@/components/core/OrderManagement/partial/OrderManagementDatePanel", () => ({
  OrderManagementDatePanel: () => <div data-testid="om-date-panel-stub" />,
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  NextImage: ({
    field,
  }: {
    field?: { value?: { src?: string } };
  }) => (field?.value?.src ? <img src={field.value.src} alt="" /> : null),
  Text: ({ field }: { field?: { value?: string } }) =>
    field?.value != null && field.value !== "" ? <span>{field.value}</span> : null,
}));

describe("InvoicesSearchBarFilter (real component)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search and applies search from the icon button", async () => {
    const user = userEvent.setup();
    const applySearchAllAttributes = vi.fn();
    const shell = createMinimalInvoiceOrQuoteShell({
      searchInput: "INV-99",
      applySearchAllAttributes,
    });

    render(<InvoicesSearchBarFilter orderManagement={shell} />);

    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(applySearchAllAttributes).toHaveBeenCalled();
  });

  it("hides status filter when hideStatusFilter is true", () => {
    const shell = createMinimalInvoiceOrQuoteShell({
      hideStatusFilter: true,
      tabFields: {
        ...minimalInvoiceQuoteTabFields,
        FilterLabel: { value: "Invoice status" },
      },
      openStatus: true,
    });

    render(<InvoicesSearchBarFilter orderManagement={shell} />);

    expect(screen.queryByRole("group", { name: "Invoice status" })).not.toBeInTheDocument();
  });

  it("shows status filter options when status popover is open", () => {
    const shell = createMinimalInvoiceOrQuoteShell({
      openStatus: true,
    });

    render(<InvoicesSearchBarFilter orderManagement={shell} />);

    expect(screen.getByRole("group", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /open/i })).toBeInTheDocument();
  });

  it("opens date panel on desktop and mounts embedded date panel", async () => {
    const user = userEvent.setup();
    const openDatePanel = vi.fn();
    const setOpenStatus = vi.fn();
    const shell = createMinimalInvoiceOrQuoteShell({
      openDate: true,
      openDatePanel,
      setOpenStatus,
    });

    render(<InvoicesSearchBarFilter orderManagement={shell} />);

    await user.click(screen.getByRole("button", { name: "Jan 1 – Jan 31" }));
    expect(setOpenStatus).toHaveBeenCalledWith(false);
    expect(openDatePanel).toHaveBeenCalled();
    expect(screen.getByTestId("om-date-panel-stub")).toBeInTheDocument();
  });

  it("clears search input when clear control is activated", async () => {
    const user = userEvent.setup();
    const handleSearchInputChange = vi.fn();
    const setAppliedSearch = vi.fn();
    const setCurrentPage = vi.fn();
    const shell = createMinimalInvoiceOrQuoteShell({
      searchInput: "INV-42",
      handleSearchInputChange,
      setAppliedSearch,
      setCurrentPage,
    });

    render(<InvoicesSearchBarFilter orderManagement={shell} />);

    await user.click(screen.getByRole("button", { name: "Clear search" }));

    expect(handleSearchInputChange).toHaveBeenCalledWith("");
    expect(setAppliedSearch).toHaveBeenCalledWith("");
    expect(setCurrentPage).toHaveBeenCalledWith(1);
  });

  it("closes open popovers when Escape is pressed on desktop", () => {
    const setOpenStatus = vi.fn();
    const setOpenDate = vi.fn();
    const shell = createMinimalInvoiceOrQuoteShell({
      openStatus: true,
      openDate: true,
      setOpenStatus,
      setOpenDate,
    });

    render(<InvoicesSearchBarFilter orderManagement={shell} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(setOpenStatus).toHaveBeenCalledWith(false);
    expect(setOpenDate).toHaveBeenCalledWith(false);
  });

  it("toggles status panel and syncs draft when status trigger is used", async () => {
    const user = userEvent.setup();
    const setOpenStatus = vi.fn();
    const setOpenDate = vi.fn();
    const syncStatusDraftFromApplied = vi.fn();
    const shell = createMinimalInvoiceOrQuoteShell({
      openStatus: false,
      setOpenStatus,
      setOpenDate,
      syncStatusDraftFromApplied,
      statusSelections: new Set(["open"]),
    });

    render(<InvoicesSearchBarFilter orderManagement={shell} />);

    await user.click(screen.getByRole("button", { name: "Status" }));

    expect(setOpenDate).toHaveBeenCalledWith(false);
    expect(syncStatusDraftFromApplied).toHaveBeenCalled();
    expect(setOpenStatus).toHaveBeenCalled();
  });

  it("opens mobile filters sheet from filter icon", async () => {
    const user = userEvent.setup();
    const setMobileSheet = vi.fn();
    const syncStatusDraftFromApplied = vi.fn();
    const shell = createMinimalInvoiceOrQuoteShell({
      isMobile: true,
      setMobileSheet,
      syncStatusDraftFromApplied,
      fields: {
        ...minimalRootFields,
        TabsFilterIcon: { value: { src: "/filter.svg", alt: "Filters" } },
      },
    });

    render(<InvoicesSearchBarFilter orderManagement={shell} />);

    const filterIconButton = screen
      .getAllByRole("button", { name: "Status" })
      .find((el) => el.getAttribute("aria-haspopup") === "dialog");
    expect(filterIconButton).toBeDefined();
    await user.click(filterIconButton!);

    expect(syncStatusDraftFromApplied).toHaveBeenCalled();
    expect(setMobileSheet).toHaveBeenCalled();
  });

  it("opens mobile date sheet when date trigger is used on mobile", async () => {
    const user = userEvent.setup();
    const setMobileSheet = vi.fn();
    const openDatePanel = vi.fn();
    const shell = createMinimalInvoiceOrQuoteShell({
      isMobile: true,
      setMobileSheet,
      openDatePanel,
    });

    render(<InvoicesSearchBarFilter orderManagement={shell} />);

    await user.click(screen.getByRole("button", { name: "Jan 1 – Jan 31" }));

    expect(openDatePanel).toHaveBeenCalled();
    expect(setMobileSheet).toHaveBeenCalled();
  });

  it("uses calendar fallback icon when DatePickerIcon is not configured", () => {
    const shell = createMinimalInvoiceOrQuoteShell({
      tabFields: {
        ...minimalInvoiceQuoteTabFields,
        DatePickerIcon: undefined,
      },
      selectedPresetId: PRESET_LAST_12_MONTHS_ID,
      defaultPresetId: PRESET_NONE_ID,
    });

    render(<InvoicesSearchBarFilter orderManagement={shell} />);

    expect(screen.getByRole("button", { name: "Jan 1 – Jan 31" })).toBeInTheDocument();
  });

  it("positions embedded date panel when date anchor is measured on desktop", () => {
    const dateEl = document.createElement("div");
    vi.spyOn(dateEl, "getBoundingClientRect").mockReturnValue({
      top: 80,
      left: 120,
      width: 260,
      height: 32,
      bottom: 112,
      right: 380,
      x: 120,
      y: 80,
      toJSON: () => ({}),
    } as DOMRect);

    const shell = createMinimalInvoiceOrQuoteShell({
      openDate: true,
      selectedPresetId: PRESET_LAST_12_MONTHS_ID,
      defaultPresetId: PRESET_NONE_ID,
    });
    (shell.dateRef as MutableRefObject<HTMLDivElement | null>).current = dateEl;

    render(<InvoicesSearchBarFilter orderManagement={shell} />);

    expect(screen.getByTestId("om-date-panel-stub")).toBeInTheDocument();
  });
});
