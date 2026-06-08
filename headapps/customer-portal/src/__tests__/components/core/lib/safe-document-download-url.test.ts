import { describe, expect, it } from "vitest";

import { API_ROUTES } from "@/lib/apis/api-routes";
import { DXP_PROXY_PREFIX } from "@/lib/apis/api-service";
import { resolveDocumentPathForBinaryFetch } from "@/lib/safe-document-download-url";

const BASE = "https://apidev.example.com/v1/dxp";

describe("resolveDocumentPathForBinaryFetch", () => {
  it("accepts bare document paths from the API", () => {
    expect(resolveDocumentPathForBinaryFetch("orders/123/packing-slip.pdf")).toBe(
      "orders/123/packing-slip.pdf"
    );
  });

  it("extracts path from BFF binary proxy URL", () => {
    const proxy = `${DXP_PROXY_PREFIX}${API_ROUTES.ORDERS_DOCUMENTS_BINARY}?path=foo%2Fbar.pdf&requestId=1`;
    expect(resolveDocumentPathForBinaryFetch(proxy)).toBe("foo/bar.pdf");
  });

  it("extracts path from configured DXP API binary URL", () => {
    const original = process.env.BASE_API_URL;
    process.env.BASE_API_URL = BASE;
    try {
      const apiUrl = `${BASE}${API_ROUTES.ORDERS_DOCUMENTS_BINARY}?path=doc%2Ffile.pdf`;
      expect(resolveDocumentPathForBinaryFetch(apiUrl)).toBe("doc/file.pdf");
    } finally {
      process.env.BASE_API_URL = original;
    }
  });

  it("rejects arbitrary external URLs", () => {
    expect(resolveDocumentPathForBinaryFetch("https://evil.example.com/file.pdf")).toBeNull();
    expect(resolveDocumentPathForBinaryFetch("//evil.example.com/file.pdf")).toBeNull();
    expect(resolveDocumentPathForBinaryFetch("http://127.0.0.1/internal")).toBeNull();
  });
});
