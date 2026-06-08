import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/lib/apis/api-routes";
import { DXP_PROXY_PREFIX } from "@/lib/apis/api-service";
import { openBinaryPdfInNewTab } from "@/lib/documentBinaryPdf";

const mockFetchOrderDocumentPdfBlob = vi.hoisted(() => vi.fn());

vi.mock("@/lib/apis/order-documents-api", () => ({
  fetchOrderDocumentPdfBlob: mockFetchOrderDocumentPdfBlob,
}));

describe("openBinaryPdfInNewTab", () => {
  const replaceMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    global.fetch = vi.fn() as unknown as typeof fetch;

    Object.defineProperty(window, "open", {
      writable: true,
      value: vi.fn(() => ({
        opener: null,
        location: {
          replace: replaceMock,
        },
        document: {
          open: vi.fn(),
          write: vi.fn(),
          close: vi.fn(),
        },
      })),
    });
    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: vi.fn(() => "blob:pdf"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      writable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not fall back to direct unauthenticated proxy navigation when blob fetch fails", async () => {
    mockFetchOrderDocumentPdfBlob.mockRejectedValue(new Error("network failed"));

    await expect(
      openBinaryPdfInNewTab({
        documentUrl: "orders/file.pdf",
        requestId: "1",
        language: "1",
        suppressErrorToast: true,
      })
    ).rejects.toThrow("network failed");

    expect(mockFetchOrderDocumentPdfBlob).toHaveBeenCalledWith({
      path: "orders/file.pdf",
      requestId: "1",
      language: "1",
      requestSource: undefined,
    });
    expect(global.fetch).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("normalizes proxied binary document URLs before fetching the PDF blob", async () => {
    const proxyUrl = `${DXP_PROXY_PREFIX}${API_ROUTES.ORDERS_DOCUMENTS_BINARY}?path=shipments%2Fpacking-slip.pdf&requestId=1`;
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
    const pdfBlob = {
      type: "application/pdf",
      size: pdfBytes.byteLength,
      arrayBuffer: vi.fn(async () => pdfBytes.buffer),
    } as unknown as Blob;
    mockFetchOrderDocumentPdfBlob.mockResolvedValue(pdfBlob);

    await openBinaryPdfInNewTab({
      documentUrl: proxyUrl,
      requestId: "1",
      language: "1",
      suppressErrorToast: true,
    });

    expect(mockFetchOrderDocumentPdfBlob).toHaveBeenCalledWith({
      path: "shipments/packing-slip.pdf",
      requestId: "1",
      language: "1",
      requestSource: undefined,
    });
    expect(replaceMock).toHaveBeenCalledWith("blob:pdf");
  });
});
