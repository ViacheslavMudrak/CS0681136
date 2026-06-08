import { describe, expect, it } from "vitest";

import {
  buildPageList,
  clampOrderManagementPageIndex,
  computeOrderManagementTotalPages,
  isInvalidOrderManagementDraftYmd,
  isOrderManagementDateFieldCompleteOnBlur,
  isOrderManagementDateYearSegmentComplete,
  isValidOrderManagementDateFieldValue,
  normalizeListTotalRecords,
  resolveDateFieldLocale,
} from "@/lib/orderManagementUtils";
import { CalendarDate, parseDate } from "@internationalized/date";

describe("orderManagementUtils pagination", () => {
  it("normalizeListTotalRecords coerces strings and rejects invalid values", () => {
    expect(normalizeListTotalRecords(42)).toBe(42);
    expect(normalizeListTotalRecords("15")).toBe(15);
    expect(normalizeListTotalRecords(undefined, 3)).toBe(3);
    expect(normalizeListTotalRecords(NaN, 2)).toBe(2);
    expect(normalizeListTotalRecords("nope", 0)).toBe(0);
  });

  it("computeOrderManagementTotalPages avoids NaN and zero page size", () => {
    expect(computeOrderManagementTotalPages(25, 10)).toBe(3);
    expect(computeOrderManagementTotalPages(25, 0)).toBe(3);
    expect(computeOrderManagementTotalPages(NaN, 10)).toBe(1);
    expect(computeOrderManagementTotalPages(0, 10)).toBe(1);
  });

  it("buildPageList does not throw for NaN or Infinity totals", () => {
    expect(() => buildPageList(1, NaN)).not.toThrow();
    expect(() => buildPageList(2, Infinity)).not.toThrow();
    expect(buildPageList(1, NaN)).toEqual([1]);
    expect(buildPageList(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("clampOrderManagementPageIndex clamps invalid page indices", () => {
    expect(clampOrderManagementPageIndex(5, 3)).toBe(3);
    expect(clampOrderManagementPageIndex(NaN, 4)).toBe(1);
    expect(clampOrderManagementPageIndex(2, NaN)).toBe(1);
  });

  it("isValidOrderManagementDateFieldValue requires a four-digit calendar year", () => {
    expect(isValidOrderManagementDateFieldValue(parseDate("2025-01-15"))).toBe(true);
    expect(isValidOrderManagementDateFieldValue(new CalendarDate(2, 1, 15))).toBe(false);
    expect(isValidOrderManagementDateFieldValue(null)).toBe(false);
    expect(isInvalidOrderManagementDraftYmd("2-01-01")).toBe(true);
    expect(isInvalidOrderManagementDraftYmd("2025-01-01")).toBe(false);
    expect(isInvalidOrderManagementDraftYmd("")).toBe(false);
    expect(isOrderManagementDateYearSegmentComplete("2025")).toBe(true);
    expect(isOrderManagementDateYearSegmentComplete("2")).toBe(false);
    expect(
      isOrderManagementDateFieldCompleteOnBlur(
        parseDate("2025-01-15"),
        { year: "2", month: "01", day: "15" },
        true
      )
    ).toBe(false);
  });

  it("resolveDateFieldLocale maps short app locales to regional tags", () => {
    expect(resolveDateFieldLocale("en")).toBe("en-US");
    expect(resolveDateFieldLocale("fr")).toBe("fr-FR");
    expect(resolveDateFieldLocale("en-US")).toBe("en-US");
  });

  it("handles malformed API totals after filter-style responses", () => {
    expect(normalizeListTotalRecords(undefined, 8)).toBe(8);
    expect(normalizeListTotalRecords("not-a-number", 3)).toBe(3);
    expect(computeOrderManagementTotalPages(Number.NaN, 10)).toBe(1);
    expect(() => buildPageList(1, Number.NaN)).not.toThrow();
  });
});
