import { describe, expect, it } from "vitest";

import {
  resolveOrderManagementActiveTabPath,
  resolveOrderManagementTabKindFromSitecoreLayout,
} from "@/lib/orderManagementUtils";

describe("resolveOrderManagementTabKindFromSitecoreLayout", () => {
  it("resolves tab from context.itemPath", () => {
    expect(
      resolveOrderManagementTabKindFromSitecoreLayout({
        context: { itemPath: "/en/site/orders-management/invoices" },
      })
    ).toBe("invoices");
  });

  it("resolves tab from route.name when itemPath has no segment", () => {
    expect(
      resolveOrderManagementTabKindFromSitecoreLayout({
        context: { itemPath: "/en/site/orders-management" },
        route: { name: "Shipments" },
      })
    ).toBe("shipments");
  });

  it("returns unknown when layout has no tab hints", () => {
    expect(resolveOrderManagementTabKindFromSitecoreLayout(undefined)).toBe("unknown");
  });
});

describe("resolveOrderManagementActiveTabPath", () => {
  it("prefers Sitecore itemPath in experience mode", () => {
    expect(
      resolveOrderManagementActiveTabPath(
        "/editor-host/page",
        { context: { itemPath: "/en/orders-management/quotes" } },
        true
      )
    ).toBe("/en/orders-management/quotes");
  });

  it("uses browser pathname in live mode", () => {
    expect(
      resolveOrderManagementActiveTabPath(
        "/en/orders-management/orders",
        { context: { itemPath: "/en/orders-management/invoices" } },
        false
      )
    ).toBe("/en/orders-management/orders");
  });
});
