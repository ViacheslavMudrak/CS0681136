import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { OrderManagementTabFields } from "@/components/core/OrderManagement/OrderManagement.type";
import {
  DATE_RANGE_INVALID_YEAR_FALLBACK,
  PRESET_NONE_ID,
} from "@/components/core/OrderManagement/orderManagementLabels";
import { useOrderManagementDatePanel } from "@/hooks/order-management/useOrderManagementDatePanel";

const MAX_SPAN_MESSAGE = "Dates selected must be within 12 months range or less.";

function renderDatePanelHook({
  allowCustomDateRange = true,
  tabFields = {},
}: {
  allowCustomDateRange?: boolean;
  tabFields?: Partial<OrderManagementTabFields>;
} = {}) {
  const setDateRange = vi.fn();
  const setSelectedPresetId = vi.fn();
  const setOpenDate = vi.fn();
  const setMobileSheet = vi.fn();
  const setCurrentPage = vi.fn();

  const result = renderHook(() =>
    useOrderManagementDatePanel({
      tabFields: {
        DatePickerSelection: [],
        ...tabFields,
      } as OrderManagementTabFields,
      rollingDurationDays: null,
      dateRange: null,
      setDateRange,
      selectedPresetId: PRESET_NONE_ID,
      setSelectedPresetId,
      setOpenDate,
      setMobileSheet,
      setCurrentPage,
      allowCustomDateRange,
      locale: "en-US",
    })
  );

  return {
    ...result,
    setDateRange,
    setSelectedPresetId,
    setOpenDate,
    setMobileSheet,
    setCurrentPage,
  };
}

describe("useOrderManagementDatePanel manual date validation", () => {
  it("blocks manually entered 366-day ranges with the configured max-span message", () => {
    const hook = renderDatePanelHook({
      tabFields: {
        DateRangeExceedsMaxSpanMessage: { value: MAX_SPAN_MESSAGE },
        ValidationError: { value: "Legacy validation message" },
      },
    });

    act(() => {
      hook.result.current.onDraftStartStrChange("2025-01-01");
      hook.result.current.onDraftEndStrChange("2026-01-01");
    });

    expect(hook.result.current.rangeExceedsTwelveMonths).toBe(true);
    expect(hook.result.current.validationMessage).toBe(MAX_SPAN_MESSAGE);
    expect(hook.result.current.draftRangeCalendarValue).toBeNull();
    expect(hook.result.current.datePanelApplyDisabled).toBe(true);

    let applied: unknown;
    act(() => {
      applied = hook.result.current.applyDatePanel();
    });

    expect(applied).toBeNull();
    expect(hook.setDateRange).not.toHaveBeenCalled();
    expect(hook.setCurrentPage).not.toHaveBeenCalled();
  });

  it("applies a manually entered 365-day range", () => {
    const hook = renderDatePanelHook();

    act(() => {
      hook.result.current.onDraftStartStrChange("2025-01-01");
      hook.result.current.onDraftEndStrChange("2025-12-31");
    });

    expect(hook.result.current.rangeExceedsTwelveMonths).toBe(false);
    expect(hook.result.current.draftRangeCalendarValue).not.toBeNull();
    expect(hook.result.current.datePanelApplyDisabled).toBe(false);

    act(() => {
      hook.result.current.applyDatePanel();
    });

    expect(hook.setDateRange).toHaveBeenCalledWith({
      start: new Date(2025, 0, 1, 0, 0, 0, 0),
      end: new Date(2025, 11, 31, 23, 59, 59, 999),
    });
    expect(hook.setCurrentPage).toHaveBeenCalledWith(1);
  });

  it("falls back to ValidationError when the specific max-span message is not configured", () => {
    const hook = renderDatePanelHook({
      tabFields: {
        DateRangeExceedsMaxSpanMessage: { value: "  " },
        ValidationError: { value: "Configured fallback validation" },
      },
    });

    act(() => {
      hook.result.current.onDraftStartStrChange("2025-01-01");
      hook.result.current.onDraftEndStrChange("2026-01-01");
    });

    expect(hook.result.current.validationMessage).toBe("Configured fallback validation");
  });

  it("shows invalid year message and blocks apply when a draft field year is invalid", () => {
    const hook = renderDatePanelHook({
      tabFields: {
        DateRangeInvalidYearMessage: { value: "Year is not valid." },
      },
    });

    act(() => {
      hook.result.current.onDraftInvalidYearFieldsChange({ start: true, end: false });
    });

    expect(hook.result.current.validationMessage).toBe("Year is not valid.");
    expect(hook.result.current.rangeInvalid).toBe(true);
    expect(hook.result.current.draftRangeCalendarValue).toBeNull();
    expect(hook.result.current.datePanelApplyDisabled).toBe(true);

    let applied: unknown;
    act(() => {
      applied = hook.result.current.applyDatePanel();
    });

    expect(applied).toBeNull();
    expect(hook.setDateRange).not.toHaveBeenCalled();
  });

  it("falls back to invalid year message when CMS field is not configured", () => {
    const hook = renderDatePanelHook();

    act(() => {
      hook.result.current.onDraftInvalidYearFieldsChange({ start: true, end: false });
    });

    expect(hook.result.current.validationMessage).toBe(DATE_RANGE_INVALID_YEAR_FALLBACK);
    expect(hook.result.current.rangeInvalid).toBe(true);
  });

  it("does not show invalid year while draft strings are unchanged until blur commit", () => {
    const hook = renderDatePanelHook();

    act(() => {
      hook.result.current.onDraftStartStrChange("2025-01-01");
      hook.result.current.onDraftEndStrChange("2025-12-31");
    });

    expect(hook.result.current.validationMessage).toBe("");
    expect(hook.result.current.rangeInvalid).toBe(false);
  });

  it("does not accept manual changes when custom date range editing is disabled", () => {
    const hook = renderDatePanelHook({ allowCustomDateRange: false });

    act(() => {
      hook.result.current.onDraftStartStrChange("2025-01-01");
      hook.result.current.onDraftEndStrChange("2025-12-31");
    });

    expect(hook.result.current.draftStartStr).toBe("");
    expect(hook.result.current.draftEndStr).toBe("");
    expect(hook.result.current.datePanelApplyDisabled).toBe(true);
  });
});
