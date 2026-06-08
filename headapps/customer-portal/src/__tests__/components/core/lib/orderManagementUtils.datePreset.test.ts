import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { OrderManagementDatePresetItem } from "@/components/core/OrderManagement/OrderManagement.type";
import {
  dateRangeFromPresetItem,
  dateRangesEqualCalendar,
  getPreviousCalendarWeekRange,
  isLastWeekCalendarPresetItem,
  rangeSpanExceedsMaxCalendarDays,
  toYmd,
} from "@/lib/orderManagementUtils";

describe("isLastWeekCalendarPresetItem", () => {
  it("detects last week from label when PresentValue is 7", () => {
    const item: OrderManagementDatePresetItem = {
      id: "last-week",
      displayName: "Last Week",
      fields: { PresentValue: { value: "7" } },
    };
    expect(isLastWeekCalendarPresetItem(item)).toBe(true);
  });

  it("does not treat last 7 days as last week", () => {
    const item: OrderManagementDatePresetItem = {
      id: "last-7",
      displayName: "Last 7 Days",
      fields: { PresentValue: { value: "7" } },
    };
    expect(isLastWeekCalendarPresetItem(item)).toBe(false);
  });

  it("detects explicit PresentValue week token", () => {
    const item: OrderManagementDatePresetItem = {
      id: "lw",
      fields: { PresentValue: { value: "week" } },
    };
    expect(isLastWeekCalendarPresetItem(item)).toBe(true);
  });
});

describe("getPreviousCalendarWeekRange / dateRangeFromPresetItem", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns previous Mon–Sun week for en-GB", () => {
    const range = getPreviousCalendarWeekRange("en-GB");
    expect(toYmd(range.start)).toBe("2026-05-04");
    expect(toYmd(range.end)).toBe("2026-05-10");
  });

  it("returns previous Sun–Sat week for en-US", () => {
    const range = getPreviousCalendarWeekRange("en-US");
    expect(toYmd(range.start)).toBe("2026-05-03");
    expect(toYmd(range.end)).toBe("2026-05-09");
  });

  it("last week and last 7 days produce different ranges when both use PresentValue 7", () => {
    const lastWeek: OrderManagementDatePresetItem = {
      id: "lw",
      fields: {
        PresentLabel: { value: "Last Week" },
        PresentValue: { value: "7" },
      },
    };
    const last7: OrderManagementDatePresetItem = {
      id: "l7",
      fields: {
        PresentLabel: { value: "Last 7 Days" },
        PresentValue: { value: "7" },
      },
    };

    const weekRange = dateRangeFromPresetItem(lastWeek, { locale: "en-GB" });
    const rollingRange = dateRangeFromPresetItem(last7, { locale: "en-GB" });

    expect(weekRange).not.toBeNull();
    expect(rollingRange).not.toBeNull();
    expect(dateRangesEqualCalendar(weekRange!, rollingRange!)).toBe(false);
    expect(toYmd(rollingRange!.start)).toBe("2026-05-08");
    expect(toYmd(rollingRange!.end)).toBe("2026-05-14");
    expect(toYmd(weekRange!.start)).toBe("2026-05-04");
    expect(toYmd(weekRange!.end)).toBe("2026-05-10");
  });
});

describe("rangeSpanExceedsMaxCalendarDays", () => {
  it("allows the last 365-day inclusive range day", () => {
    expect(
      rangeSpanExceedsMaxCalendarDays(new Date(2025, 0, 1, 12), new Date(2025, 11, 31, 12), 365)
    ).toBe(false);
  });

  it("blocks the 366th selected day", () => {
    expect(
      rangeSpanExceedsMaxCalendarDays(new Date(2025, 0, 1, 12), new Date(2026, 0, 1, 12), 365)
    ).toBe(true);
  });

  it("uses inclusive days across leap-year ranges", () => {
    expect(
      rangeSpanExceedsMaxCalendarDays(new Date(2024, 1, 29, 12), new Date(2025, 1, 27, 12), 365)
    ).toBe(false);
    expect(
      rangeSpanExceedsMaxCalendarDays(new Date(2024, 1, 29, 12), new Date(2025, 1, 28, 12), 365)
    ).toBe(true);
  });
});
