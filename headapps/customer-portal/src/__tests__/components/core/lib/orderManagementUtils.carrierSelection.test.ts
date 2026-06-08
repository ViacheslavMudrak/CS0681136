import { describe, it, expect } from "vitest";
import {
  ORDERS_MANAGEMENT_PATH_PREFIX,
  resolveCarrierSelectionForTracking,
} from "@/lib/orderManagementUtils";
import type { OrderManagementTabItem } from "@/components/core/OrderManagement/OrderManagement.type";

const shipmentsHref = `${ORDERS_MANAGEMENT_PATH_PREFIX}/shipments`;
const ordersHref = `${ORDERS_MANAGEMENT_PATH_PREFIX}/orders`;

describe("resolveCarrierSelectionForTracking", () => {
  it("returns current tab CarrierSelection when non-empty", () => {
    const current = {
      CarrierSelection: [
        {
          id: "a",
          displayName: "UPS",
          fields: { URL: { value: "https://ups/{tracking_number}" } },
        },
      ],
    };
    const shipmentsTab = {
      id: "ship",
      fields: {
        TabURL: { value: { href: shipmentsHref } },
        CarrierSelection: [
          {
            id: "b",
            displayName: "FedEx",
            fields: { URL: { value: "https://fedex/{tracking_number}" } },
          },
        ],
      },
    } as OrderManagementTabItem;

    const result = resolveCarrierSelectionForTracking(current, [shipmentsTab]);
    expect(result).toHaveLength(1);
    expect(result?.[0]?.id).toBe("a");
  });

  it("falls back to Shipments tab CarrierSelection when current tab has none", () => {
    const current = {};
    const ordersTab = {
      id: "orders",
      fields: {
        TabURL: { value: { href: ordersHref } },
      },
    } as OrderManagementTabItem;
    const shipmentsTab = {
      id: "ship",
      fields: {
        TabURL: { value: { href: shipmentsHref } },
        CarrierSelection: [
          {
            id: "ups",
            displayName: "UPS",
            fields: { URL: { value: "https://ups?n={tracking_number}" } },
          },
        ],
      },
    } as OrderManagementTabItem;

    const result = resolveCarrierSelectionForTracking(current, [ordersTab, shipmentsTab]);
    expect(result).toHaveLength(1);
    expect(result?.[0]?.id).toBe("ups");
  });

  it("returns undefined when neither current nor Shipments tab supplies carriers", () => {
    const current = {};
    const ordersTab = {
      id: "orders",
      fields: {
        TabURL: { value: { href: ordersHref } },
      },
    } as OrderManagementTabItem;
    const emptyShipments = {
      id: "ship",
      fields: {
        TabURL: { value: { href: shipmentsHref } },
        CarrierSelection: [],
      },
    } as OrderManagementTabItem;

    expect(resolveCarrierSelectionForTracking(current, [ordersTab, emptyShipments])).toBeUndefined();
    expect(resolveCarrierSelectionForTracking(undefined, [])).toBeUndefined();
  });
});
