import type { MutableRefObject } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { QuotesSearchBarFilter } from "@/components/core/OrderManagement/tabs/quotes/QuotesSearchBarFilter";
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

describe("QuotesSearchBarFilter (real component)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders combined search placeholder from CMS fields", () => {
    const shell = createMinimalInvoiceOrQuoteShell({
      tabFields: {
        ...minimalInvoiceQuoteTabFields,
        SearchPlaceholder: { value: "Find" },
        SearchAttribute: [
          {
            id: "a1",
            fields: { Value: { value: "Quote #" } },
          },
        ],
      },
    });

    render(<QuotesSearchBarFilter orderManagement={shell} />);

    expect(screen.getByPlaceholderText("Find Quote #")).toBeInTheDocument();
  });

  it("invokes apply search when search icon is activated", async () => {
    const user = userEvent.setup();
    const applySearchAllAttributes = vi.fn();
    const shell = createMinimalInvoiceOrQuoteShell({
      searchInput: "Q-1",
      applySearchAllAttributes,
    });

    render(<QuotesSearchBarFilter orderManagement={shell} />);

    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(applySearchAllAttributes).toHaveBeenCalled();
  });

  it("hides status label and trigger when hideStatusFilter is true", () => {
    const shell = createMinimalInvoiceOrQuoteShell({
      hideStatusFilter: true,
      tabFields: {
        ...minimalInvoiceQuoteTabFields,
        FilterLabel: { value: "Quote status" },
      },
    });

    render(<QuotesSearchBarFilter orderManagement={shell} />);

    expect(screen.queryByRole("button", { name: "Quote status" })).not.toBeInTheDocument();
  });

  it("opens date panel and closes status when date trigger is used", async () => {
    const user = userEvent.setup();
    const openDatePanel = vi.fn();
    const setOpenStatus = vi.fn();
    const shell = createMinimalInvoiceOrQuoteShell({
      openDate: true,
      openDatePanel,
      setOpenStatus,
    });

    render(<QuotesSearchBarFilter orderManagement={shell} />);

    await user.click(screen.getByRole("button", { name: "Jan 1 – Jan 31" }));
    expect(setOpenStatus).toHaveBeenCalledWith(false);
    expect(openDatePanel).toHaveBeenCalled();
    expect(screen.getByTestId("om-date-panel-stub")).toBeInTheDocument();
  });

  it("shows status filter panel on desktop when status popover is open", () => {
    const shell = createMinimalInvoiceOrQuoteShell({
      openStatus: true,
      statusSelections: new Set(["open"]),
    });

    render(<QuotesSearchBarFilter orderManagement={shell} />);

    expect(screen.getByRole("group", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("clears search input when clear control is activated", async () => {
    const user = userEvent.setup();
    const handleSearchInputChange = vi.fn();
    const setAppliedSearch = vi.fn();
    const setCurrentPage = vi.fn();
    const shell = createMinimalInvoiceOrQuoteShell({
      searchInput: "Q-99",
      handleSearchInputChange,
      setAppliedSearch,
      setCurrentPage,
    });

    render(<QuotesSearchBarFilter orderManagement={shell} />);

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

    render(<QuotesSearchBarFilter orderManagement={shell} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(setOpenStatus).toHaveBeenCalledWith(false);
    expect(setOpenDate).toHaveBeenCalledWith(false);
  });

  it("opens mobile filters sheet from filter icon", async () => {
    const user = userEvent.setup();
    const setMobileSheet = vi.fn();
    const shell = createMinimalInvoiceOrQuoteShell({
      isMobile: true,
      setMobileSheet,
      fields: {
        ...minimalRootFields,
        TabsFilterIcon: { value: { src: "/filter.svg", alt: "Filters" } },
      },
    });

    render(<QuotesSearchBarFilter orderManagement={shell} />);

    const filterIconButton = screen
      .getAllByRole("button", { name: "Status" })
      .find((el) => el.getAttribute("aria-haspopup") === "dialog");
    expect(filterIconButton).toBeDefined();
    await user.click(filterIconButton!);

    expect(setMobileSheet).toHaveBeenCalled();
  });

  it("positions embedded date panel when date anchor is measured on desktop", () => {
    const dateEl = document.createElement("div");
    vi.spyOn(dateEl, "getBoundingClientRect").mockReturnValue({
      top: 64,
      left: 96,
      width: 240,
      height: 28,
      bottom: 92,
      right: 336,
      x: 96,
      y: 64,
      toJSON: () => ({}),
    } as DOMRect);

    const shell = createMinimalInvoiceOrQuoteShell({ openDate: true });
    (shell.dateRef as MutableRefObject<HTMLDivElement | null>).current = dateEl;

    render(<QuotesSearchBarFilter orderManagement={shell} />);

    expect(screen.getByTestId("om-date-panel-stub")).toBeInTheDocument();
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

    render(<QuotesSearchBarFilter orderManagement={shell} />);

    expect(screen.getByRole("button", { name: "Jan 1 – Jan 31" })).toBeInTheDocument();
  });
});
