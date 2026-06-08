import { describe, expect, it } from "vitest";

import type { OrderManagementGridColumnItem } from "@/components/core/OrderManagement/OrderManagement.type";
import {
  matchesOrdersTabPoGridColumn,
  ordersGridColumnLegacyNormalizedKey,
} from "@/lib/orderManagementUtils";

function col(partial: Partial<OrderManagementGridColumnItem>): OrderManagementGridColumnItem {
  return {
    id: partial.id ?? "col-1",
    name: partial.name,
    displayName: partial.displayName,
    fields: partial.fields,
  };
}

describe("matchesOrdersTabPoGridColumn", () => {
  it("returns true for legacy name PO (unchanged behavior)", () => {
    expect(matchesOrdersTabPoGridColumn(col({ name: "PO" }))).toBe(true);
  });

  it("returns true when GridName is PURCHASE ORDER (substring ORDER must not exclude PO column)", () => {
    expect(
      matchesOrdersTabPoGridColumn(
        col({ fields: { GridName: { value: "Purchase Order" } }, name: "", displayName: "" })
      )
    ).toBe(true);
  });

  it("returns true for PO # via GridName when name is internal id", () => {
    expect(
      matchesOrdersTabPoGridColumn(
        col({ fields: { GridName: { value: "PO #" } }, name: "col_po", displayName: "" })
      )
    ).toBe(true);
  });

  it("returns true for PO_NUMBER-style Sitecore name", () => {
    expect(matchesOrdersTabPoGridColumn(col({ name: "PO_NUMBER", displayName: "" }))).toBe(true);
  });

  it("uses displayName when name is empty string (not nullish)", () => {
    const c = col({ name: "", displayName: "PO #" });
    expect(ordersGridColumnLegacyNormalizedKey(c)).toBe("PO #");
    expect(matchesOrdersTabPoGridColumn(c)).toBe(true);
  });

  it("returns false when label combines PO with order number column", () => {
    expect(
      matchesOrdersTabPoGridColumn(col({ fields: { GridName: { value: "PO / Order #" } } }))
    ).toBe(false);
  });

  it("returns false for ORDER # column", () => {
    expect(matchesOrdersTabPoGridColumn(col({ fields: { GridName: { value: "ORDER #" } } }))).toBe(
      false
    );
  });

  it("returns false for empty label and no legacy PO", () => {
    expect(matchesOrdersTabPoGridColumn(col({}))).toBe(false);
  });
});
