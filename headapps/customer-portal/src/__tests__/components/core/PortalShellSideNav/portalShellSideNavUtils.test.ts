import { describe, expect, it, vi } from "vitest";

import type { PortalShellNavItem, PortalShellNavSection } from "@/components/core/PortalShellSideNav/PortalShellSideNav.type";
import {
  collectDefaultExpandedNavItemIds,
  collectPinnedExpandedNavItemIds,
  readShowExpandMenu,
} from "@/components/core/PortalShellSideNav/portalShellSideNavUtils";

describe("readShowExpandMenu", () => {
  it("returns true for boolean and string truthy CMS values", () => {
    expect(
      readShowExpandMenu({
        id: "a",
        url: "#",
        name: "a",
        displayName: "a",
        fields: { ShowExpandMenu: { value: true } },
      })
    ).toBe(true);
    expect(
      readShowExpandMenu({
        id: "b",
        url: "#",
        name: "b",
        displayName: "b",
        fields: { ShowExpandMenu: { value: "true" } },
      })
    ).toBe(true);
  });

  it("returns false when ShowExpandMenu is absent or false", () => {
    expect(
      readShowExpandMenu({ id: "c", url: "#", name: "c", displayName: "c", fields: {} })
    ).toBe(false);
  });
});

describe("collectPinnedExpandedNavItemIds", () => {
  it("includes only items with ShowExpandMenu", () => {
    const pinned = createMockNavItem({
      id: "pinned",
      fields: {
        URL: { value: { href: "#" } },
        ShowExpandMenu: { value: true },
        SubNavigationItems: [
          { id: "c", url: "#", name: "c", displayName: "c", fields: { URL: { value: { href: "/c" } } } },
        ],
      },
    });
    const ids = collectPinnedExpandedNavItemIds([
      {
        id: "sec",
        url: "#",
        name: "sec",
        displayName: "sec",
        fields: { SubNavigationItems: [pinned] },
      },
    ]);
    expect(ids.has("pinned")).toBe(true);
  });
});

function createMockNavItem(overrides: {
  id: string;
  fields?: PortalShellNavItem["fields"];
}): PortalShellNavItem {
  return {
    id: overrides.id,
    url: "#",
    name: overrides.id,
    displayName: overrides.id,
    fields: overrides.fields,
  };
}

describe("collectDefaultExpandedNavItemIds", () => {
  const child: PortalShellNavItem = {
    id: "child",
    url: "#",
    name: "child",
    displayName: "Child",
    fields: { URL: { value: { href: "/orders" } } },
  };

  const parent: PortalShellNavItem = {
    id: "parent",
    url: "#",
    name: "parent",
    displayName: "Parent",
    fields: {
      URL: { value: { href: "#" } },
      SubNavigationItems: [child],
    },
  };

  const section: PortalShellNavSection = {
    id: "sec",
    url: "#",
    name: "sec",
    displayName: "General",
    fields: { SubNavigationItems: [parent] },
  };

  it("includes parent when a child path is active", () => {
    const isPathActive = vi.fn((href: string) => href === "/orders");
    const ids = collectDefaultExpandedNavItemIds(
      [section],
      isPathActive,
      (item) => item.fields?.URL?.value?.href ?? "#"
    );
    expect(ids.has("parent")).toBe(true);
  });

  it("includes parent when ShowExpandMenu is true without active child", () => {
    const parentExpanded: PortalShellNavItem = {
      ...parent,
      fields: { ...parent.fields, ShowExpandMenu: { value: true } },
    };
    const isPathActive = vi.fn(() => false);
    const ids = collectDefaultExpandedNavItemIds(
      [{ ...section, fields: { SubNavigationItems: [parentExpanded] } }],
      isPathActive,
      (item) => item.fields?.URL?.value?.href ?? "#"
    );
    expect(ids.has("parent")).toBe(true);
    expect(isPathActive("/orders")).toBe(false);
  });
});
