import { describe, it, expect } from "vitest";

import type { OrderDetailLineItem } from "@/components/core/OrderDetail/OrderDetail.type";
import type { OrderLineItem } from "@/lib/apis/orders-api";
import {
  formatSubmittingAsLines,
  orderDetailLineToDocumentRequestUiLine,
  orderDetailLinesToDocumentRequestUiLines,
  orderListLineToDocumentRequestUiLine,
  resolveAccountIdForDocumentRequest,
} from "@/lib/documentRequestMappings";
import type { ProfileAccount } from "@/lib/types/user-profile";

describe("orderListLineToDocumentRequestUiLine", () => {
  it("maps list API line shape including customer part number", () => {
    const line: OrderLineItem = {
      id: "224-s0-l1",
      customerPartNumber: "M-63298",
      intraloxPartNumber: "TD BELT",
      description: "Belt spec…",
      quantity: 2,
    };
    expect(orderListLineToDocumentRequestUiLine(line)).toEqual({
      lineId: "224-s0-l1",
      customerPartNumber: "M-63298",
      intraloxPartNumber: "TD BELT",
      description: "Belt spec…",
      quantity: 2,
    });
  });
});

describe("orderDetailLineToDocumentRequestUiLine", () => {
  it("builds surrogate lineId and numeric quantity", () => {
    const item: OrderDetailLineItem = {
      customerPartNumber: "A",
      intraloxPartNumber: "B",
      partDescription: { value: "Full text" },
      quantity: { value: 3, unit: "Each" },
    };
    expect(orderDetailLineToDocumentRequestUiLine(item, 2, "999")).toEqual({
      lineId: "999-d2",
      customerPartNumber: "A",
      intraloxPartNumber: "B",
      description: "Full text",
      quantity: 3,
    });
  });
});

describe("orderDetailLinesToDocumentRequestUiLines", () => {
  it("maps each line with index-based ids", () => {
    const items: OrderDetailLineItem[] = [
      { customerPartNumber: "1", intraloxPartNumber: "X", partDescription: { value: "d1" } },
      { customerPartNumber: "2", intraloxPartNumber: "Y", partDescription: { value: "d2" } },
    ];
    const out = orderDetailLinesToDocumentRequestUiLines(items, "10");
    expect(out).toHaveLength(2);
    expect(out[0].lineId).toBe("10-d0");
    expect(out[1].lineId).toBe("10-d1");
  });
});

describe("formatSubmittingAsLines", () => {
  it("uses company name and formatted address from ProfileAccount", () => {
    const account: ProfileAccount = {
      id: "1",
      companyName: "Acme Co",
      address: "1 Main St, Memphis, US",
      accountNumber: "A1",
      isActive: true,
      role: "Buyer",
      organization: "Acme",
    };
    expect(formatSubmittingAsLines(account)).toEqual({
      title: "Acme Co",
      body: "1 Main St, Memphis, US",
    });
  });
});

describe("resolveAccountIdForDocumentRequest", () => {
  it("uses portal account id when accountNumber is also set", () => {
    expect(
      resolveAccountIdForDocumentRequest({
        id: "6087859",
        companyName: "Co",
        address: "",
        accountNumber: "ACC-001",
        isActive: true,
        role: "r",
        organization: "o",
      })
    ).toBe("6087859");
  });

  it("returns id when accountNumber is empty", () => {
    expect(
      resolveAccountIdForDocumentRequest({
        id: "99",
        companyName: "Co",
        address: "",
        accountNumber: "",
        isActive: true,
        role: "r",
        organization: "o",
      })
    ).toBe("99");
  });
});
