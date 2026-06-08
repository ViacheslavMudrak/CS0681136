import { beforeEach, describe, expect, it, vi } from "vitest";

import { getQuoteDetail, parseQuoteRouteIdToOrderHeaderId } from "@/lib/apis/quote-detail-api";

const mockGetOrderDetail = vi.hoisted(() => vi.fn());

vi.mock("@/lib/apis/order-detail-api", () => ({
  getOrderDetail: mockGetOrderDetail,
}));

describe("parseQuoteRouteIdToOrderHeaderId", () => {
  it("parses plain numeric id", () => {
    expect(parseQuoteRouteIdToOrderHeaderId("12345")).toBe(12345);
  });

  it("extracts first digit run from mixed string", () => {
    expect(parseQuoteRouteIdToOrderHeaderId("Q-999")).toBe(999);
  });

  it("returns null for empty or non-numeric", () => {
    expect(parseQuoteRouteIdToOrderHeaderId("")).toBeNull();
    expect(parseQuoteRouteIdToOrderHeaderId("abc")).toBeNull();
  });
});

describe("getQuoteDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns failure when quote id is empty", async () => {
    const res = await getQuoteDetail({ quoteId: "   ", accountId: 1 });
    expect(res.success).toBe(false);
    expect(res.data).toBeNull();
    expect(mockGetOrderDetail).not.toHaveBeenCalled();
  });

  it("returns failure when account id trims to empty string", async () => {
    const res = await getQuoteDetail({ quoteId: "Q1", accountId: "  " as unknown as number });
    expect(res.success).toBe(false);
    expect(mockGetOrderDetail).not.toHaveBeenCalled();
  });

  it("calls getOrderDetail and maps order payload", async () => {
    mockGetOrderDetail.mockResolvedValue({
      success: true,
      data: {
        order: {
          orderId: 3336212,
          orderHeaderId: 42,
          accountId: 1,
          orderDate: "2024-01-01",
          orderStatus: "READY",
        },
        contacts: { customer: [{ name: "Jane", email: "j@x.com" }] },
        lineItems: [],
        shipments: [],
        billingAddress: {},
        orderSummary: {
          subTotal: { value: 10, currency: "USD", displayValue: "$10" },
          tax: { value: 0, currency: "USD", displayValue: "$0" },
          totalAmount: { value: 10, currency: "USD", displayValue: "$10" },
        },
        invoices: [],
        documents: [],
      },
    });

    const res = await getQuoteDetail({ quoteId: "42", accountId: 99 });
    expect(mockGetOrderDetail).toHaveBeenCalledWith({ orderHeaderId: 42, accountId: 99 });
    expect(res.success).toBe(true);
    expect(res.data?.quoteNumber).toBe("3336212");
    expect(res.data?.contactEmail).toBe("j@x.com");
  });

  it("propagates order detail failure without notFound", async () => {
    mockGetOrderDetail.mockResolvedValue({ success: false, data: null });
    const res = await getQuoteDetail({ quoteId: "1", accountId: 1 });
    expect(res.success).toBe(false);
    expect(res.data).toBeNull();
    expect(res.notFound).toBeUndefined();
  });

  it("propagates order detail notFound", async () => {
    mockGetOrderDetail.mockResolvedValue({ success: false, data: null, notFound: true });
    const res = await getQuoteDetail({ quoteId: "1", accountId: 1 });
    expect(res.success).toBe(false);
    expect(res.data).toBeNull();
    expect(res.notFound).toBe(true);
    expect(mockGetOrderDetail).toHaveBeenCalledWith({ orderHeaderId: 1, accountId: 1 });
  });

  it("returns notFound when order detail returns success with no data", async () => {
    mockGetOrderDetail.mockResolvedValue({ success: true, data: null });

    const res = await getQuoteDetail({ quoteId: "1", accountId: 1 });

    expect(res.success).toBe(false);
    expect(res.data).toBeNull();
    expect(res.notFound).toBe(true);
  });

  it("returns notFound when order detail returns success without order data", async () => {
    mockGetOrderDetail.mockResolvedValue({
      success: true,
      data: {
        contacts: { customer: [] },
        lineItems: [],
        shipments: [],
        billingAddress: {},
        invoices: [],
        documents: [],
      },
    });

    const res = await getQuoteDetail({ quoteId: "1", accountId: 1 });

    expect(res.success).toBe(false);
    expect(res.data).toBeNull();
    expect(res.notFound).toBe(true);
  });

  it("returns notFound when route id has no numeric header id", async () => {
    const res = await getQuoteDetail({ quoteId: "no-digits-here", accountId: 1 });
    expect(res.success).toBe(false);
    expect(res.notFound).toBe(true);
    expect(mockGetOrderDetail).not.toHaveBeenCalled();
  });

  it("returns notFound when loaded orderHeaderId does not match route id", async () => {
    mockGetOrderDetail.mockResolvedValue({
      success: true,
      data: {
        order: {
          orderId: 1,
          orderHeaderId: 99,
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
      },
    });

    const res = await getQuoteDetail({ quoteId: "42", accountId: 1 });
    expect(res.success).toBe(false);
    expect(res.notFound).toBe(true);
  });

  it("maps expired order status to order_expired", async () => {
    mockGetOrderDetail.mockResolvedValue({
      success: true,
      data: {
        order: {
          orderId: 555,
          orderHeaderId: 42,
          accountId: 1,
          orderDate: "2024-01-01",
          orderStatus: "Expired",
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
      },
    });

    const res = await getQuoteDetail({ quoteId: "42", accountId: 1 });
    expect(res.success).toBe(true);
    expect(res.data?.statusKey).toBe("order_expired");
    expect(res.notFound).toBeUndefined();
  });
});
