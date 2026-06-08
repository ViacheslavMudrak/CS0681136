import { afterEach, describe, expect, it, vi } from "vitest";
import {
  endOfDayClone,
  startOfDayClone,
  toApiDateRangeEnd,
  toApiDateRangeStart,
} from "@/lib/orderManagementUtils";

describe("toApiDateRangeStart / toApiDateRangeEnd", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("formats single-day range with start-of-day and end-of-day times", () => {
    const day = new Date(2026, 4, 14);
    const start = startOfDayClone(day);
    const end = endOfDayClone(day);

    expect(toApiDateRangeStart(start)).toBe("2026-05-14T00:00:00");
    expect(toApiDateRangeEnd(end)).toBe("2026-05-14T23:59:59");
  });

  it("formats multi-day range using first-day start and last-day end", () => {
    const rangeStart = startOfDayClone(new Date(2026, 4, 1));
    const rangeEnd = endOfDayClone(new Date(2026, 4, 14));

    expect(toApiDateRangeStart(rangeStart)).toBe("2026-05-01T00:00:00");
    expect(toApiDateRangeEnd(rangeEnd)).toBe("2026-05-14T23:59:59");
  });

  it("does not include fractional seconds in API strings", () => {
    const end = endOfDayClone(new Date(2026, 4, 14));

    expect(toApiDateRangeStart(end)).not.toMatch(/\.\d/);
    expect(toApiDateRangeEnd(end)).not.toMatch(/\.\d/);
    expect(toApiDateRangeEnd(end)).toBe("2026-05-14T23:59:59");
  });

  it("uses local calendar date, not UTC day shift", () => {
    vi.stubEnv("TZ", "America/Chicago");
    const localEvening = new Date(2026, 4, 14, 22, 30, 0);

    expect(toApiDateRangeStart(localEvening)).toBe("2026-05-14T00:00:00");
    expect(toApiDateRangeEnd(localEvening)).toBe("2026-05-14T23:59:59");
  });
});
