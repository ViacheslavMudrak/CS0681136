import { describe, expect, it } from "vitest";

import {
  countVisibleDashboardWidgets,
  isDashboardWidgetRenderingVisible,
  resolveDashboardSplitterGridClassName,
} from "@/lib/dashboard-splitter-layout";

const dashboardRendering = {
  placeholders: {
    DashboardWidgets: [
      { componentName: "RecentOrderWidget", params: { HideWidget: "0" } },
      { componentName: "RecentQuoteWidget", params: { HideWidget: "1" } },
      { componentName: "SearchComponent", params: { HideComponent: "0" } },
      { componentName: "FeaturedContentTile", params: { HideTile: "1" } },
    ],
  },
};

describe("dashboard-splitter-layout", () => {
  it("matches child showSection hide flags on the live site", () => {
    expect(
      isDashboardWidgetRenderingVisible(
        { componentName: "RecentQuoteWidget", params: { HideWidget: "1" } },
        false
      )
    ).toBe(false);
    expect(
      isDashboardWidgetRenderingVisible(
        { componentName: "SearchComponent", params: { HideComponent: "0" } },
        false
      )
    ).toBe(true);
    expect(
      isDashboardWidgetRenderingVisible(
        { componentName: "FeaturedContentTile", params: { HideTile: "true" } },
        false
      )
    ).toBe(false);
  });

  it("ignores hide flags in Experience Editor", () => {
    expect(
      isDashboardWidgetRenderingVisible(
        { componentName: "RecentQuoteWidget", params: { HideWidget: "1" } },
        true
      )
    ).toBe(true);
  });

  it("counts visible dashboard widgets from the placeholder", () => {
    expect(countVisibleDashboardWidgets(dashboardRendering, false)).toBe(2);
    expect(countVisibleDashboardWidgets(dashboardRendering, true)).toBe(4);
  });

  it("uses single column on md when one widget is visible", () => {
    const oneVisible = {
      placeholders: {
        DashboardWidgets: [
          { componentName: "RecentOrderWidget", params: { HideWidget: "0" } },
          { componentName: "RecentQuoteWidget", params: { HideWidget: "1" } },
          { componentName: "SearchComponent", params: { HideComponent: "1" } },
          { componentName: "FeaturedContentTile", params: { HideTile: "1" } },
        ],
      },
    };

    expect(countVisibleDashboardWidgets(oneVisible, false)).toBe(1);
    expect(resolveDashboardSplitterGridClassName(1)).toContain("md:grid-cols-1");
    expect(resolveDashboardSplitterGridClassName(1)).not.toContain("lg:grid-cols-2");
  });

  it("spans the last row on md when three widgets are visible", () => {
    const threeVisible = {
      placeholders: {
        DashboardWidgets: [
          { componentName: "RecentOrderWidget", params: { HideWidget: "0" } },
          { componentName: "RecentQuoteWidget", params: { HideWidget: "0" } },
          { componentName: "SearchComponent", params: { HideComponent: "0" } },
          { componentName: "FeaturedContentTile", params: { HideTile: "1" } },
        ],
      },
    };

    expect(countVisibleDashboardWidgets(threeVisible, false)).toBe(3);
    const className = resolveDashboardSplitterGridClassName(3);
    expect(className).toContain("lg:grid-cols-2");
    expect(className).toContain("lg:[&>*:last-child:nth-child(odd)]:col-span-2");
  });

  it("keeps a standard two-column grid when two widgets are visible", () => {
    const className = resolveDashboardSplitterGridClassName(2);
    expect(className).toContain("lg:grid-cols-2");
    expect(className).not.toContain("md:grid-cols-1");
  });
});
