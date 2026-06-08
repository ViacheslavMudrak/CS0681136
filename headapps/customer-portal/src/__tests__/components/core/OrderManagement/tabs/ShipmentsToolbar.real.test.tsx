import type { MutableRefObject } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ShipmentsToolbar } from "@/components/core/OrderManagement/tabs/shipments/ShipmentsToolbar";
import {
  PRESET_LAST_12_MONTHS_ID,
  PRESET_NONE_ID,
} from "@/components/core/OrderManagement/orderManagementLabels";

import { createMinimalShipmentShell } from "../orderManagementShellTestDoubles";

vi.mock("@/components/core/OrderManagement/partial/OrderManagementDatePanel", () => ({
  OrderManagementDatePanel: () => <div data-testid="om-date-panel-stub" />,
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  NextImage: ({
    field,
  }: {
    field?: { value?: { src?: string } };
  }) => (field?.value?.src ? <img src={field.value.src} alt="" /> : null),
}));

describe("ShipmentsToolbar (real component)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search field with CMS placeholder and triggers apply search", async () => {
    const user = userEvent.setup();
    const applySearchAllAttributes = vi.fn();
    const shell = createMinimalShipmentShell({
      searchInput: "  SO-1  ",
      applySearchAllAttributes,
    });

    render(<ShipmentsToolbar orderManagement={shell} />);

    expect(screen.getByPlaceholderText("Search shipments")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(applySearchAllAttributes).toHaveBeenCalled();
  });

  it("clear search resets applied search and page", async () => {
    const user = userEvent.setup();
    const handleSearchInputChange = vi.fn();
    const setAppliedSearch = vi.fn();
    const setCurrentPage = vi.fn();
    const shell = createMinimalShipmentShell({
      searchInput: "abc",
      handleSearchInputChange,
      setAppliedSearch,
      setCurrentPage,
    });

    render(<ShipmentsToolbar orderManagement={shell} />);

    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(handleSearchInputChange).toHaveBeenCalledWith("");
    expect(setAppliedSearch).toHaveBeenCalledWith("");
    expect(setCurrentPage).toHaveBeenCalledWith(1);
  });

  it("opens date panel on desktop when date trigger is pressed", async () => {
    const user = userEvent.setup();
    const openDatePanel = vi.fn();
    const shell = createMinimalShipmentShell({
      openDatePanel,
      openDate: true,
    });

    render(<ShipmentsToolbar orderManagement={shell} />);

    await user.click(screen.getByRole("button", { name: "Jan 1 – Jan 31" }));
    expect(openDatePanel).toHaveBeenCalled();
    expect(screen.getByTestId("om-date-panel-stub")).toBeInTheDocument();
  });

  it("closes date popover on Escape for desktop", () => {
    const setOpenDate = vi.fn();
    const shell = createMinimalShipmentShell({
      openDate: true,
      setOpenDate,
    });

    render(<ShipmentsToolbar orderManagement={shell} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(setOpenDate).toHaveBeenCalledWith(false);
  });

  it("opens mobile date sheet when date trigger is pressed on mobile", async () => {
    const user = userEvent.setup();
    const setMobileSheet = vi.fn();
    const shell = createMinimalShipmentShell({
      isMobile: true,
      setMobileSheet,
    });

    render(<ShipmentsToolbar orderManagement={shell} />);

    await user.click(screen.getByRole("button", { name: "Jan 1 – Jan 31" }));
    expect(setMobileSheet).toHaveBeenCalled();
  });

  it("uses calendar fallback when DatePickerIcon is missing", () => {
    const shell = createMinimalShipmentShell({
      tabFields: {
        SearchPlaceholder: { value: "Search shipments" },
        DatePickerIcon: undefined,
      },
      selectedPresetId: PRESET_LAST_12_MONTHS_ID,
      defaultPresetId: PRESET_NONE_ID,
    });

    render(<ShipmentsToolbar orderManagement={shell} />);
    expect(screen.getByRole("button", { name: "Jan 1 – Jan 31" })).toBeInTheDocument();
  });

  it("positions embedded date panel when anchor is measured", () => {
    const dateEl = document.createElement("div");
    vi.spyOn(dateEl, "getBoundingClientRect").mockReturnValue({
      top: 72,
      left: 88,
      width: 220,
      height: 30,
      bottom: 102,
      right: 308,
      x: 88,
      y: 72,
      toJSON: () => ({}),
    } as DOMRect);

    const shell = createMinimalShipmentShell({ openDate: true });
    (shell.dateRef as MutableRefObject<HTMLDivElement | null>).current = dateEl;

    render(<ShipmentsToolbar orderManagement={shell} />);
    expect(screen.getByTestId("om-date-panel-stub")).toBeInTheDocument();
  });
});
