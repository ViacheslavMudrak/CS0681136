import { describe, it, expect, vi, afterEach } from "vitest";
import {
  isOpaqueBrowserFetchError,
  resolveQuoteRequestErrorMessage,
  QUOTE_REQUEST_SAVE_CONNECTION_MESSAGE,
  QUOTE_REQUEST_SAVE_FALLBACK_MESSAGE,
} from "@/lib/quote-request/quote-request-errors";
import { ApiRequestError } from "@/lib/apis/api-service";

describe("isOpaqueBrowserFetchError", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects Failed to fetch", () => {
    expect(isOpaqueBrowserFetchError(new TypeError("Failed to fetch"))).toBe(true);
  });

  it("detects offline navigator", () => {
    vi.stubGlobal("navigator", { onLine: false });
    expect(isOpaqueBrowserFetchError(new Error("anything"))).toBe(true);
  });

  it("returns false for meaningful API-style errors", () => {
    expect(isOpaqueBrowserFetchError(new Error("Quote request not found"))).toBe(false);
  });
});

describe("resolveQuoteRequestErrorMessage", () => {
  it("maps fetch failures to connection message", () => {
    expect(resolveQuoteRequestErrorMessage(new TypeError("Failed to fetch"))).toBe(
      QUOTE_REQUEST_SAVE_CONNECTION_MESSAGE
    );
  });

  it("preserves ApiRequestError message", () => {
    expect(
      resolveQuoteRequestErrorMessage(new ApiRequestError("Draft is locked", 409))
    ).toBe("Draft is locked");
  });

  it("uses save fallback when error has no message", () => {
    expect(resolveQuoteRequestErrorMessage(undefined)).toBe(QUOTE_REQUEST_SAVE_FALLBACK_MESSAGE);
  });

  it("uses CMS message when error has no message", () => {
    expect(
      resolveQuoteRequestErrorMessage(undefined, { cmsMessage: "Something went wrong" })
    ).toBe("Something went wrong");
  });

  it("returns explicit Error message for non-network errors", () => {
    expect(resolveQuoteRequestErrorMessage(new Error("Validation failed"))).toBe(
      "Validation failed"
    );
  });
});
