import { beforeEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/lib/apis/api-routes";
import { fetchOrderDocumentPdfBlob } from "@/lib/apis/order-documents-api";

const mockRequestBlob = vi.hoisted(() => vi.fn());

vi.mock("@/lib/apis/api-service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/apis/api-service")>();
  return {
    ...actual,
    requestBlob: mockRequestBlob,
  };
});

describe("fetchOrderDocumentPdfBlob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequestBlob.mockResolvedValue(new Blob(["%PDF-"], { type: "application/pdf" }));
  });

  it("uses the authenticated blob request helper with document metadata headers", async () => {
    await fetchOrderDocumentPdfBlob({
      path: " orders/file.pdf ",
      requestId: " req-123 ",
      language: " 2 ",
      requestSource: " portal ",
    });

    expect(mockRequestBlob).toHaveBeenCalledWith({
      method: "GET",
      path: API_ROUTES.ORDERS_DOCUMENTS_BINARY,
      params: {
        path: "orders/file.pdf",
        requestId: "req-123",
        language: "2",
        requestSource: "portal",
      },
      options: {
        headers: {
          Accept: "application/pdf, application/octet-stream;q=0.9, */*;q=0.8",
          requestId: "req-123",
          language: "2",
        },
      },
    });
  });
});
