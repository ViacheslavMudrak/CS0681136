import { describe, expect, it } from "vitest";

import { isAuxiliaryNavigationClick } from "@/lib/portal-route-transition-context";

function click(
  overrides: Partial<Pick<MouseEvent, "button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey">> = {}
): Pick<MouseEvent, "button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey"> {
  return {
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...overrides,
  };
}

describe("isAuxiliaryNavigationClick", () => {
  it("returns false for a normal left click", () => {
    expect(isAuxiliaryNavigationClick(click())).toBe(false);
  });

  it("returns true for ctrl/cmd/shift/alt and middle click", () => {
    expect(isAuxiliaryNavigationClick(click({ ctrlKey: true }))).toBe(true);
    expect(isAuxiliaryNavigationClick(click({ metaKey: true }))).toBe(true);
    expect(isAuxiliaryNavigationClick(click({ shiftKey: true }))).toBe(true);
    expect(isAuxiliaryNavigationClick(click({ altKey: true }))).toBe(true);
    expect(isAuxiliaryNavigationClick(click({ button: 1 }))).toBe(true);
  });
});
