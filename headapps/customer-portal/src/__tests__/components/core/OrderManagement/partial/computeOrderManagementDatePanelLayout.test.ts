import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { computeOrderManagementDatePanelLayout } from "@/components/core/OrderManagement/partial/computeOrderManagementDatePanelLayout";

describe("computeOrderManagementDatePanelLayout", () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1200 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: originalInnerWidth });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: originalInnerHeight });
  });

  it("positions panel below anchor by default", () => {
    const layout = computeOrderManagementDatePanelLayout({
      top: 100,
      left: 400,
      right: 700,
      bottom: 140,
      width: 300,
      height: 40,
      x: 400,
      y: 100,
      toJSON: () => ({}),
    } as DOMRect);

    expect(layout.top).toBe(146);
    expect(layout.width).toBeLessThanOrEqual(920);
    expect(layout.left).toBeGreaterThanOrEqual(16);
  });

  it("flips panel above anchor when there is not enough space below", () => {
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 400 });

    const layout = computeOrderManagementDatePanelLayout({
      top: 300,
      left: 200,
      right: 500,
      bottom: 340,
      width: 300,
      height: 40,
      x: 200,
      y: 300,
      toJSON: () => ({}),
    } as DOMRect);

    expect(layout.top).toBeLessThan(300);
  });
});
