import { afterEach, describe, expect, it, vi } from "vitest";
import type { OrderManagementDatePresetItem } from "@/components/core/OrderManagement/OrderManagement.type";
import {
  DEFAULT_RECENT_WIDGET_DAYS,
  formatCreatedLabel,
  formatPlacedLabel,
  resolveRecentWidgetDateRangeFromCms,
} from "@/lib/dashboard-recent-widgets.util";

const datePickerSelection: OrderManagementDatePresetItem[] = [
  {
    id: "last-7",
    displayName: "Last 7 Days",
    fields: { PresentValue: { value: "7" }, PresentLabel: { value: "Last 7 Days" } },
  },
  {
    id: "last-12-months",
    displayName: "Last 12 Months",
    fields: { PresentValue: { value: "365" }, PresentLabel: { value: "Last 12 Months" } },
  },
  {
    id: "last-30-days",
    displayName: "Last 30 Days",
    fields: { PresentValue: { value: "30" }, PresentLabel: { value: "Last 30 Days" } },
  },
];

function widgetFields(defaultSelection: string) {
  return {
    DateDefaultSelectionCriteria: [
      {
        id: "quotes-tab",
        name: "Quotes Tab",
        displayName: "Quotes Tab",
        fields: {
          DefaultSelection: { value: defaultSelection },
          DatePickerSelection: datePickerSelection,
        },
      },
    ],
  };
}

describe("resolveRecentWidgetDateRangeFromCms", () => {
  it("uses DefaultSelection label and matched PresentValue days from DateDefaultSelectionCriteria", () => {
    const result = resolveRecentWidgetDateRangeFromCms(widgetFields("Last 12 Months"));

    expect(result.label).toBe("Last 12 Months");
    expect(result.days).toBe(365);
  });

  it("matches preset by displayName case-insensitively", () => {
    const result = resolveRecentWidgetDateRangeFromCms(widgetFields("last 7 days"));

    expect(result.label).toBe("last 7 days");
    expect(result.days).toBe(7);
  });

  it("resolves Last 30 Days from nested tab fields", () => {
    const result = resolveRecentWidgetDateRangeFromCms(widgetFields("Last 30 Days"));

    expect(result.label).toBe("Last 30 Days");
    expect(result.days).toBe(30);
  });

  it("falls back to default days when preset is not found", () => {
    const result = resolveRecentWidgetDateRangeFromCms(widgetFields("Unknown Range"));

    expect(result.label).toBe("Unknown Range");
    expect(result.days).toBe(DEFAULT_RECENT_WIDGET_DAYS);
  });

  it("falls back when fields are missing", () => {
    const result = resolveRecentWidgetDateRangeFromCms(null);

    expect(result.label).toBe("Last 12 Months");
    expect(result.days).toBe(DEFAULT_RECENT_WIDGET_DAYS);
  });

  it("falls back when DateDefaultSelectionCriteria is empty", () => {
    const result = resolveRecentWidgetDateRangeFromCms({ DateDefaultSelectionCriteria: [] });

    expect(result.label).toBe("Last 12 Months");
    expect(result.days).toBe(DEFAULT_RECENT_WIDGET_DAYS);
  });
});

describe("formatPlacedLabel / formatCreatedLabel", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses YYYY-MM-DD from API string regardless of time and offset", () => {
    expect(formatPlacedLabel("2026-02-23T15:57:44.000-06:00", "en-US")).toBe("Placed Feb 23, 2026");
    expect(formatPlacedLabel("2026-02-23T08:52:38.000-06:00", "en-US")).toBe("Placed Feb 23, 2026");
    expect(formatCreatedLabel("2026-02-23T15:57:44.000-06:00", "en-GB")).toBe("Created 23 Feb 2026");
  });

  it("keeps API calendar day regardless of viewer timezone", () => {
    vi.stubEnv("TZ", "Asia/Kolkata");
    expect(formatPlacedLabel("2026-02-23T15:57:44.000-06:00", "en-US")).toBe("Placed Feb 23, 2026");
    expect(formatCreatedLabel("2026-02-23T15:57:44.000-06:00", "en-US")).toBe("Created Feb 23, 2026");
  });
});
