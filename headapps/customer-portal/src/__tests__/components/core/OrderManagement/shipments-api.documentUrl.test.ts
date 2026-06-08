import { describe, expect, it } from "vitest";

import { mapShipmentSearchRecordToListItem } from "@/lib/apis/shipments-api";

const TEMP_PACKING_SLIP_DOCUMENT_URL =
  "https://objectstorage.us-ashburn-1.oraclecloud.com/AccountingInvoice/2620867_3701533.pdf";

describe("mapShipmentSearchRecordToListItem documentUrl", () => {
  it("uses the API-provided shipment document URL before temporary test data", () => {
    const mapped = mapShipmentSearchRecordToListItem({
      shipmentId: "ship-1",
      orderHeaderId: 42,
      orderId: 1001,
      orderNumber: 2002,
      documentUrl: "  shipments/ship-1/packing-slip.pdf  ",
    });

    expect(mapped.shipments[0]?.documentUrl).toBe("shipments/ship-1/packing-slip.pdf");
  });

  it("supports alternate packing slip document URL field names", () => {
    const mapped = mapShipmentSearchRecordToListItem({
      shipmentId: "ship-2",
      orderHeaderId: 43,
      orderId: 1002,
      orderNumber: 2003,
      packingSlipDocumentUrl: "shipments/ship-2/packing-slip.pdf",
    });

    expect(mapped.shipments[0]?.documentUrl).toBe("shipments/ship-2/packing-slip.pdf");
  });

  it("keeps the temporary packing slip URL isolated as a validation fallback", () => {
    const mapped = mapShipmentSearchRecordToListItem({
      shipmentId: "ship-3",
      orderHeaderId: 44,
      orderId: 1003,
      orderNumber: 2004,
    });

    expect(mapped.shipments[0]?.documentUrl).toBe(TEMP_PACKING_SLIP_DOCUMENT_URL);
  });
});
