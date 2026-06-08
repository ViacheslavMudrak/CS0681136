import { afterEach, describe, expect, it, vi } from "vitest";
import { formatShippingTabDateDisplay } from "@/lib/shipping-tab-date-display";
import { formatOrderDateDisplay } from "@/lib/orderManagementUtils";

describe("formatOrderDateDisplay", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses embedded offset calendar day, not viewer TZ (Asia/Kolkata + -05:00)", () => {
    vi.stubEnv("TZ", "Asia/Kolkata");
    expect(formatOrderDateDisplay("2025-06-17T16:56:21.000-05:00", "en-US")).toBe("06/17/2025");
  });

  it("formats Z instants as UTC calendar day regardless of TZ", () => {
    vi.stubEnv("TZ", "Asia/Kolkata");
    expect(formatOrderDateDisplay("2025-06-17T21:56:21.000Z", "en-US")).toBe("06/17/2025");
  });

  it("formats naive datetimes in local calendar (matches API range strings)", () => {
    vi.stubEnv("TZ", "America/Chicago");
    expect(formatOrderDateDisplay("2026-05-14T00:00:00", "en-US")).toBe("05/14/2026");
  });

  it("formats date-only YYYY-MM-DD as local calendar", () => {
    vi.stubEnv("TZ", "America/Chicago");
    expect(formatOrderDateDisplay("2026-06-15", "en-US")).toBe("06/15/2026");
  });

  it("formats compact numeric offset ±HHMM", () => {
    vi.stubEnv("TZ", "Asia/Kolkata");
    expect(formatOrderDateDisplay("2025-06-17T10:00:00.000+0530", "en-US")).toBe("06/17/2025");
  });
});

describe("formatShippingTabDateDisplay", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("preserves YYYY-MM-DD API date in Shipping tab", () => {
    vi.stubEnv("TZ", "America/Chicago");
    expect(formatShippingTabDateDisplay("2026-06-15", "en-US")).toBe("06/15/2026");
  });

  it("preserves UTC midnight Z API date in Shipping tab", () => {
    vi.stubEnv("TZ", "America/Chicago");
    expect(formatShippingTabDateDisplay("2026-06-15T00:00:00.000Z", "en-US")).toBe(
      "06/15/2026"
    );
  });

  it("falls back to shared formatter for non-calendar instants", () => {
    vi.stubEnv("TZ", "America/Chicago");
    const iso = "2026-06-15T15:30:00.000Z";
    expect(formatShippingTabDateDisplay(iso, "en-US")).toBe(formatOrderDateDisplay(iso, "en-US"));
  });

  it("offset shipment instant shows embedded-offset calendar day under Asia/Kolkata", () => {
    vi.stubEnv("TZ", "Asia/Kolkata");
    expect(formatShippingTabDateDisplay("2025-06-17T16:56:21.000-05:00", "en-US")).toBe(
      "06/17/2025"
    );
  });
});
