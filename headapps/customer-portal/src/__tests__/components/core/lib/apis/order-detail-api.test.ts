import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiRequestError } from "@/lib/apis/api-service";
import { getOrderDetail } from "@/lib/apis/order-detail-api";

const mockRequest = vi.hoisted(() => vi.fn());

vi.mock("@/lib/apis/api-service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/apis/api-service")>();
  return {
    ...actual,
    request: mockRequest,
  };
});

const orderDetailPayload = {
  order: {
    orderId: 100,
    orderHeaderId: 42,
    accountId: 1,
    orderDate: "2024-01-01",
    orderStatus: "READY",
  },
  contacts: { customer: [] },
  lineItems: [],
  shipments: [],
  billingAddress: {},
  orderSummary: {
    subTotal: { value: 0, currency: "USD", displayValue: "" },
    tax: { value: 0, currency: "USD", displayValue: "" },
    totalAmount: { value: 0, currency: "USD", displayValue: "" },
  },
  invoices: [],
  documents: [],
};

describe("getOrderDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success when envelope has data", async () => {
    mockRequest.mockResolvedValue({
      success: true,
      statusCode: 200,
      message: "OK",
      data: orderDetailPayload,
    });

    const res = await getOrderDetail({ orderHeaderId: 42, accountId: 99 });
    expect(res.success).toBe(true);
    expect(res.data?.order.orderHeaderId).toBe(42);
    expect(res.notFound).toBeUndefined();
  });

  it("normalizes packing slip language fields to languageCode", async () => {
    mockRequest.mockResolvedValue({
      success: true,
      statusCode: 200,
      message: "OK",
      data: {
        ...orderDetailPayload,
        shipments: [
          {
            shipmentId: "44046793",
            trackingNumber: "757856758",
            deliveryStatus: "Shipped",
            carrierName: "SAIA",
            shipmentDate: "2026-05-18T14:43:12.000-05:00",
            packingSlip: [
              {
                documentId: 51026076,
                documentType: "Web Page",
                documentName: "",
                fileType: "",
                documentUrl: "https://example.com/PackingSlip/ja.pdf",
                language: "ja",
              },
              {
                documentId: 51026077,
                documentType: "Web Page",
                documentName: "",
                fileType: "",
                documentUrl: "https://example.com/PackingSlip/us.pdf",
                Language: "US",
              },
              {
                documentId: 51026078,
                documentType: "Web Page",
                documentName: "",
                fileType: "",
                documentUrl: "https://example.com/PackingSlip/zht.pdf",
                LanguageCode: " zht ",
              },
            ],
          },
        ],
      },
    });

    const res = await getOrderDetail({ orderHeaderId: 42, accountId: 99 });

    expect(res.data?.shipments[0]?.packingSlip?.map((doc) => doc.languageCode)).toEqual([
      "JA",
      "US",
      "ZHT",
    ]);
  });

  it("returns notFound when envelope statusCode is 404", async () => {
    mockRequest.mockResolvedValue({
      success: false,
      statusCode: 404,
      message: "Not found",
      data: null,
    });

    const res = await getOrderDetail({ orderHeaderId: 999, accountId: 1 });
    expect(res.success).toBe(false);
    expect(res.data).toBeNull();
    expect(res.notFound).toBe(true);
  });

  it("returns notFound when a successful envelope has no data", async () => {
    mockRequest.mockResolvedValue({
      success: true,
      statusCode: 200,
      message: "OK",
      data: null,
    });

    const res = await getOrderDetail({ orderHeaderId: 999, accountId: 1 });
    expect(res.success).toBe(false);
    expect(res.data).toBeNull();
    expect(res.notFound).toBe(true);
  });

  it("returns notFound when a successful envelope has no usable order data", async () => {
    mockRequest.mockResolvedValue({
      success: true,
      statusCode: 200,
      message: "OK",
      data: {
        contacts: { customer: [] },
        lineItems: [],
        shipments: [],
        billingAddress: {},
        invoices: [],
        documents: [],
      },
    });

    const res = await getOrderDetail({ orderHeaderId: 999, accountId: 1 });
    expect(res.success).toBe(false);
    expect(res.data).toBeNull();
    expect(res.notFound).toBe(true);
  });

  it("returns notFound when request throws ApiRequestError 404", async () => {
    mockRequest.mockRejectedValue(new ApiRequestError("Not found", 404));

    const res = await getOrderDetail({ orderHeaderId: 999, accountId: 1 });
    expect(res.success).toBe(false);
    expect(res.data).toBeNull();
    expect(res.notFound).toBe(true);
  });

  it("returns failure without notFound for other API errors", async () => {
    mockRequest.mockRejectedValue(new ApiRequestError("Server error", 500));

    const res = await getOrderDetail({ orderHeaderId: 1, accountId: 1 });
    expect(res.success).toBe(false);
    expect(res.data).toBeNull();
    expect(res.notFound).toBeUndefined();
  });
});
