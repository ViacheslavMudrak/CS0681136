import { describe, expect, it, vi, beforeEach } from "vitest";

import {
  buildQuoteDetailAnalyticsContext,
  mapQuoteStatus,
  resolveQuoteDetailUserType,
} from "@/lib/quote-detail-analytics-utils";
import {
  trackQuoteDetailContactEmailClick,
  trackQuoteDetailPageView,
  trackQuoteDetailRequestUpdatedQuoteClick,
  trackQuoteDetailSupportEmailClick,
} from "@/lib/quoteDetailAnalytics";

const logGTMQuoteDetailPageViewMock = vi.fn();
const logGTMQuoteDetailSelectContentMock = vi.fn();
const logGTMQuoteDetailGenerateLeadMock = vi.fn();
const sendQuoteDetailPageViewEventMock = vi.fn();
const sendQuoteDetailContactEmailClickEventMock = vi.fn();
const sendQuoteDetailSupportEmailClickEventMock = vi.fn();
const sendQuoteDetailRequestUpdatedQuoteClickEventMock = vi.fn();

vi.mock("@/lib/gtm", () => ({
  logGTMQuoteDetailPageView: (...args: unknown[]) => logGTMQuoteDetailPageViewMock(...args),
  logGTMQuoteDetailSelectContent: (...args: unknown[]) => logGTMQuoteDetailSelectContentMock(...args),
  logGTMQuoteDetailGenerateLead: (...args: unknown[]) => logGTMQuoteDetailGenerateLeadMock(...args),
}));

vi.mock("@/lib/CDPEvents", () => ({
  sendQuoteDetailPageViewEvent: (...args: unknown[]) => sendQuoteDetailPageViewEventMock(...args),
  sendQuoteDetailContactEmailClickEvent: (...args: unknown[]) =>
    sendQuoteDetailContactEmailClickEventMock(...args),
  sendQuoteDetailSupportEmailClickEvent: (...args: unknown[]) =>
    sendQuoteDetailSupportEmailClickEventMock(...args),
  sendQuoteDetailRequestUpdatedQuoteClickEvent: (...args: unknown[]) =>
    sendQuoteDetailRequestUpdatedQuoteClickEventMock(...args),
  sendQuoteDetailRequestDocsClickEvent: vi.fn(),
  sendQuoteDetailExpiredPanelRfqClickEvent: vi.fn(),
  sendQuoteDetailLineItemToggleEvent: vi.fn(),
  sendQuoteDetailExpandAllToggleEvent: vi.fn(),
  sendQuoteDetailItemMenuOpenEvent: vi.fn(),
  sendQuoteDetailRequestQuoteInitiatedEvent: vi.fn(),
  sendQuoteDetailRequestDocInitiatedEvent: vi.fn(),
}));

describe("quote-detail-analytics-utils", () => {
  it("mapQuoteStatus maps order_ready to ready", () => {
    expect(mapQuoteStatus("order_ready")).toBe("ready");
    expect(mapQuoteStatus("order_expired")).toBe("expired");
  });

  it("resolveQuoteDetailUserType compares emails case-insensitively", () => {
    expect(resolveQuoteDetailUserType("Rep@Example.com", "rep@example.com")).toBe("internal");
    expect(resolveQuoteDetailUserType("user@example.com", "rep@example.com")).toBe("external");
    expect(resolveQuoteDetailUserType("", "rep@example.com")).toBe("external");
  });

  it("buildQuoteDetailAnalyticsContext bundles analytics fields", () => {
    const ctx = buildQuoteDetailAnalyticsContext({
      quoteNumber: "Q-100",
      statusKey: "order_ready",
      itemsCount: 3,
      loggedInEmail: "rep@example.com",
      accountRepEmail: "rep@example.com",
    });
    expect(ctx).toEqual({
      quoteNumber: "Q-100",
      quoteStatus: "ready",
      userType: "internal",
      itemsCount: 3,
    });
  });
});

describe("quoteDetailAnalytics track helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("trackQuoteDetailPageView fires GTM and CDP with full payload", () => {
    trackQuoteDetailPageView({
      quoteNumber: "Q-1",
      entryPoint: "Quotes_Listing",
      quoteStatus: "ready",
      userType: "external",
      itemsCount: 2,
      pagePath: "/orders-management/quotes/Q-1",
    });
    expect(logGTMQuoteDetailPageViewMock).toHaveBeenCalledWith({
      quote_number: "Q-1",
      entry_point: "Quotes_Listing",
      quote_status: "ready",
      user_type: "external",
      items_count: 2,
      page_path: "/orders-management/quotes/Q-1",
    });
    expect(sendQuoteDetailPageViewEventMock).toHaveBeenCalledWith({
      quoteNumber: "Q-1",
      entryPoint: "Quotes_Listing",
      quoteStatus: "ready",
      userType: "external",
      itemsCount: 2,
    });
  });

  it("trackQuoteDetailContactEmailClick fires select_content events", () => {
    trackQuoteDetailContactEmailClick({ quoteStatus: "expired" });
    expect(logGTMQuoteDetailSelectContentMock).toHaveBeenCalledWith({
      content_type: "contact_email",
      quote_status: "expired",
      initiation_point: "quote_detail_header",
    });
    expect(sendQuoteDetailContactEmailClickEventMock).toHaveBeenCalled();
  });

  it("trackQuoteDetailSupportEmailClick uses pricing panel initiation point", () => {
    trackQuoteDetailSupportEmailClick();
    expect(logGTMQuoteDetailSelectContentMock).toHaveBeenCalledWith({
      content_type: "support_info_panel",
      initiation_point: "quote_detail_pricing_panel",
    });
    expect(sendQuoteDetailSupportEmailClickEventMock).toHaveBeenCalled();
  });

  it("trackQuoteDetailRequestUpdatedQuoteClick fires generate_lead", () => {
    trackQuoteDetailRequestUpdatedQuoteClick({ itemsCount: 5 });
    expect(logGTMQuoteDetailGenerateLeadMock).toHaveBeenCalledWith({
      initiation_point: "quote_detail_header",
      items_count: 5,
    });
    expect(sendQuoteDetailRequestUpdatedQuoteClickEventMock).toHaveBeenCalledWith({
      initiationPoint: "quote_detail_header",
      itemsCount: 5,
    });
  });
});
