import { describe, expect, it } from "vitest";

import type { OrderDetailLineItem } from "@/components/core/OrderDetail/OrderDetail.type";
import { buildLineItemRowKey } from "@/lib/orderDetailUtils";

const line = (description: string): OrderDetailLineItem => ({
  customerPartNumber: "1",
  intraloxPartNumber: "2",
  partDescription: { value: description },
  quantity: { value: 1, unit: "EACH" },
});

describe("buildLineItemRowKey", () => {
  it("builds stable keys for line items", () => {
    expect(buildLineItemRowKey(line("A"), 0)).toBeTruthy();
  });
});
