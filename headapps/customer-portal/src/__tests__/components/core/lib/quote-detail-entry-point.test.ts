import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearQuoteDetailReturnHref,
  isOrdersManagementQuoteDetailPathSegments,
  QUOTE_DETAIL_PATH_REGEX,
  resolveQuoteDetailEntryPoint,
  resolveQuoteDetailReturnHref,
  scheduleQuoteDetailEntryPointSessionCleanup,
  stashQuoteDetailEntryPoint,
} from "@/lib/quote-detail-entry-point";

describe("quote-detail-entry-point", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("QUOTE_DETAIL_PATH_REGEX captures quote id", () => {
    const m = "/orders-management/quotes/Q-123".match(QUOTE_DETAIL_PATH_REGEX);
    expect(m?.[1]).toBe("Q-123");
  });

  it("isOrdersManagementQuoteDetailPathSegments is true for quotes detail path", () => {
    expect(isOrdersManagementQuoteDetailPathSegments(["orders-management", "quotes", "Q1"])).toBe(true);
  });

  it("isOrdersManagementQuoteDetailPathSegments is false for quotes tab only", () => {
    expect(isOrdersManagementQuoteDetailPathSegments(["orders-management", "quotes"])).toBe(false);
  });

  it("isOrdersManagementQuoteDetailPathSegments is false for orders path", () => {
    expect(isOrdersManagementQuoteDetailPathSegments(["orders-management", "orders", "SO1"])).toBe(false);
  });

  it("stashQuoteDetailEntryPoint stores allowed value and resolve reads it", () => {
    stashQuoteDetailEntryPoint("Quotes_Listing");
    expect(resolveQuoteDetailEntryPoint()).toBe("Quotes_Listing");
  });

  it("stashQuoteDetailEntryPoint stores a safe return href", () => {
    stashQuoteDetailEntryPoint("Quotes_Listing", "/orders-management/quotes?search=abc&page=2");
    expect(resolveQuoteDetailReturnHref()).toBe("/orders-management/quotes?search=abc&page=2");
  });

  it("stashQuoteDetailEntryPoint ignores unsafe return hrefs", () => {
    stashQuoteDetailEntryPoint("Quotes_Listing", "https://example.com/orders-management/quotes");
    expect(resolveQuoteDetailReturnHref()).toBeNull();
  });

  it("clearQuoteDetailReturnHref removes the stored return href", () => {
    stashQuoteDetailEntryPoint("Quotes_Listing", "/orders-management/quotes?search=abc");
    clearQuoteDetailReturnHref();
    expect(resolveQuoteDetailReturnHref()).toBeNull();
  });

  it("resolveQuoteDetailEntryPoint defaults to Direct_URL when session empty", () => {
    expect(resolveQuoteDetailEntryPoint()).toBe("Direct_URL");
  });

  it("scheduleQuoteDetailEntryPointSessionCleanup clears session on microtask", async () => {
    stashQuoteDetailEntryPoint("Quotes_Listing");
    scheduleQuoteDetailEntryPointSessionCleanup();
    expect(sessionStorage.getItem("cp_quote_detail_entry_point")).toBe("Quotes_Listing");
    await Promise.resolve();
    expect(sessionStorage.getItem("cp_quote_detail_entry_point")).toBeNull();
  });
});
