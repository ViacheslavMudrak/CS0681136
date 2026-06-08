import { describe, expect, it } from "vitest";

import type { OrderManagementTabFields } from "@/components/core/OrderManagement/OrderManagement.type";
import {
  filterLabelToStatusKey,
  resolveDefaultStatusFilterKeysFromCms,
} from "@/lib/orderManagementUtils";

const placedOptionTabFields: OrderManagementTabFields = {
  DefaultFilterSelection: { value: "Placed" },
  FilterOptions: [
    {
      id: "opt-placed",
      displayName: "Placed",
      fields: {
        Statuskey: { value: "PLACED" },
        StatusValue: { value: "Placed" },
      },
    },
    {
      id: "opt-shipped",
      displayName: "Shipped",
      fields: {
        Statuskey: { value: "SHIPPED" },
        StatusValue: { value: "Shipped" },
      },
    },
  ],
};

describe("resolveDefaultStatusFilterKeysFromCms", () => {
  it("maps DefaultFilterSelection label to filter key", () => {
    const keys = resolveDefaultStatusFilterKeysFromCms(placedOptionTabFields);
    expect([...keys]).toEqual(["order_placed"]);
    expect(filterLabelToStatusKey("Placed", placedOptionTabFields)).toBe("order_placed");
  });

  it("returns empty set when DefaultFilterSelection is missing or unmatched", () => {
    expect(resolveDefaultStatusFilterKeysFromCms(null).size).toBe(0);
    expect(
      resolveDefaultStatusFilterKeysFromCms({
        DefaultFilterSelection: { value: "Unknown" },
        FilterOptions: placedOptionTabFields.FilterOptions,
      }).size
    ).toBe(0);
    expect(resolveDefaultStatusFilterKeysFromCms({ FilterOptions: placedOptionTabFields.FilterOptions }).size).toBe(0);
  });
});
