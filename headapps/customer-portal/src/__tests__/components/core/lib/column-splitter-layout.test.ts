import { describe, expect, it } from "vitest";

import {
  COLUMN_SPLITTER_LEFT_PLACEHOLDER,
  COLUMN_SPLITTER_RIGHT_PLACEHOLDER,
  countVisibleColumnSplitterSides,
  isColumnSplitterSideVisible,
  isUtilityLinksRenderingVisible,
  resolveColumnSplitterGridClassName,
} from "@/lib/column-splitter-layout";

const renderingBothVisible = {
  placeholders: {
    [COLUMN_SPLITTER_LEFT_PLACEHOLDER]: [
      { componentName: "UtilityLinks", params: { HideTile: "0" } },
    ],
    [COLUMN_SPLITTER_RIGHT_PLACEHOLDER]: [
      { componentName: "UtilityLinks", params: { HideTile: "0" } },
    ],
  },
};

describe("column-splitter-layout", () => {
  it("matches UtilityLinks showSection hide flag on the live site", () => {
    expect(
      isUtilityLinksRenderingVisible({ componentName: "UtilityLinks", params: { HideTile: "1" } }, false)
    ).toBe(false);
    expect(
      isUtilityLinksRenderingVisible({ componentName: "UtilityLinks", params: { HideTile: "0" } }, false)
    ).toBe(true);
  });

  it("ignores hide flags in Experience Editor", () => {
    expect(
      isUtilityLinksRenderingVisible({ componentName: "UtilityLinks", params: { HideTile: "1" } }, true)
    ).toBe(true);
  });

  it("treats an empty placeholder as not visible", () => {
    expect(isColumnSplitterSideVisible({ placeholders: {} }, COLUMN_SPLITTER_LEFT_PLACEHOLDER, false)).toBe(
      false
    );
  });

  it("counts one visible side when the other UtilityLinks tile is hidden", () => {
    const rendering = {
      placeholders: {
        [COLUMN_SPLITTER_LEFT_PLACEHOLDER]: [
          { componentName: "UtilityLinks", params: { HideTile: "1" } },
        ],
        [COLUMN_SPLITTER_RIGHT_PLACEHOLDER]: [
          { componentName: "UtilityLinks", params: { HideTile: "0" } },
        ],
      },
    };

    expect(isColumnSplitterSideVisible(rendering, COLUMN_SPLITTER_LEFT_PLACEHOLDER, false)).toBe(false);
    expect(isColumnSplitterSideVisible(rendering, COLUMN_SPLITTER_RIGHT_PLACEHOLDER, false)).toBe(true);
    expect(countVisibleColumnSplitterSides(rendering, false)).toBe(1);
  });

  it("uses single column on md when only one side is visible", () => {
    const className = resolveColumnSplitterGridClassName(1);
    expect(className).toContain("md:grid-cols-1");
    expect(className).not.toContain("md:grid-cols-2");
  });

  it("uses two columns on md when both sides are visible", () => {
    expect(countVisibleColumnSplitterSides(renderingBothVisible, false)).toBe(2);
    const className = resolveColumnSplitterGridClassName(2);
    expect(className).toContain("md:grid-cols-2");
  });
});
