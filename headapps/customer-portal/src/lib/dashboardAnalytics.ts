"use client";

import {
  sendDashboardInfoPanelLinkClickEvent,
  sendDashboardPillClickEvent,
  sendDashboardFeaturedContentClickEvent,
  sendDashboardRecentOrderClickEvent,
  sendDashboardRecentOrderRequestDocInitiatedEvent,
  sendDashboardRecentOrderRequestQuoteInitiatedEvent,
  sendDashboardRecentOrdersViewAllEvent,
  sendDashboardRecentQuoteClickEvent,
  sendDashboardRecentQuotesViewAllEvent,
  sendDashboardNewsArticleClickEvent,
  sendDashboardNewsViewAllEvent,
  sendDashboardPageViewEvent,
  sendDashboardRequestQuoteHeaderClickEvent,
  sendDashboardUtilityLinkClickEvent,
} from "@/lib/CDPEvents";
import {
  logGTMDashboardFeaturedContentClick,
  logGTMDashboardInfoPanelLinkClick,
  logGTMDashboardPillClick,
  logGTMDashboardNewsArticleClick,
  logGTMDashboardNewsViewAll,
  logGTMDashboardPageViewDetailed,
  logGTMDashboardRecentOrderOverflowMenuAction,
  logGTMDashboardRecentOrdersViewAll,
  logGTMDashboardRecentOrderRowClick,
  logGTMDashboardRecentQuoteRowClick,
  logGTMDashboardRequestQuoteHeaderClick,
  logGTMDashboardUtilityLinkClick,
} from "@/lib/gtm";

/**
 * Fires GA4 `select_content` and CDP `customerportal:DASHBOARD_INFO_PANEL_LINK_CLICK` when the
 * user activates an inline link in the dashboard information panel rich text.
 */
export function trackDashboardInfoPanelLinkClick(params: {
  linkText: string;
  linkUrl: string;
}): void {
  const linkUrl = params.linkUrl?.trim() ?? "";
  if (!linkUrl) return;
  const linkText = (params.linkText?.trim() ?? "") || linkUrl;
  logGTMDashboardInfoPanelLinkClick({
    content_type: "info_panel",
    link_text: linkText,
    link_url: linkUrl,
  });
  void sendDashboardInfoPanelLinkClickEvent({
    linkText,
    linkUrl,
  });
}

/**
 * Fires GA4 `select_content` and CDP `customerportal:DASHBOARD_PILL_CLICK` when the user clicks a
 * dashboard navigation pill (linked tile).
 */
export function trackDashboardNavigationPillClick(params: {
  pillLabel: string;
  pillPosition: number;
}): void {
  if (params.pillPosition < 1) return;
  const pillLabel = (params.pillLabel?.trim() ?? "") || "Navigation pill";
  logGTMDashboardPillClick({
    content_type: "navigation_pill",
    pill_label: pillLabel,
    pill_position: params.pillPosition,
  });
  void sendDashboardPillClickEvent({
    pillLabel,
    pillPosition: params.pillPosition,
  });
}

/**
 * Fires GA4 `select_content` and CDP `customerportal:DASHBOARD_ORDER_CLICK` when the user opens
 * order detail from a Recent Orders row.
 */
export function trackDashboardRecentOrderRowClick(params: {
  orderNumber: string;
  orderStatus: string;
}): void {
  const orderNumber = params.orderNumber?.trim() ?? "";
  if (!orderNumber) return;
  const orderStatus = (params.orderStatus?.trim() ?? "") || "—";
  logGTMDashboardRecentOrderRowClick({
    content_type: "recent_order",
    order_number: orderNumber,
    order_status: orderStatus,
  });
  void sendDashboardRecentOrderClickEvent({
    orderNumber,
    orderStatus,
  });
}

/**
 * Fires GA4 `select_content` and CDP `customerportal:DASHBOARD_ORDERS_VIEW_ALL` when the user
 * clicks View All on Recent Orders (with rows loaded).
 */
export function trackDashboardRecentOrdersViewAll(): void {
  logGTMDashboardRecentOrdersViewAll({
    content_type: "view_all",
    section: "recent_orders",
  });
  void sendDashboardRecentOrdersViewAllEvent();
}

/**
 * Fires GA4 `select_content` and CDP `customerportal:DASHBOARD_QUOTE_CLICK` when the user opens
 * quote detail from a Recent Quotes row.
 */
export function trackDashboardRecentQuoteRowClick(params: {
  quoteStatus: "ready" | "expired";
}): void {
  logGTMDashboardRecentQuoteRowClick({
    content_type: "recent_quote",
    quote_status: params.quoteStatus,
  });
  void sendDashboardRecentQuoteClickEvent({
    quoteStatus: params.quoteStatus,
  });
}

/**
 * Fires GA4 `select_content` and CDP `customerportal:DASHBOARD_QUOTES_VIEW_ALL` when the user
 * clicks View All on Recent Quotes (with rows loaded).
 */
export function trackDashboardRecentQuotesViewAll(): void {
  logGTMDashboardRecentOrdersViewAll({
    content_type: "view_all",
    section: "recent_quotes",
  });
  void sendDashboardRecentQuotesViewAllEvent();
}

/**
 * Fires GA4 `generate_lead` and CDP `customerportal:DASHBOARD_REQUEST_QUOTE_HEADER_CLICK` when the
 * user activates the dashboard header Request Quote CTA.
 */
export function trackDashboardRequestQuoteHeaderClick(params: {
  deviceType: "desktop" | "tablet" | "mobile";
}): void {
  logGTMDashboardRequestQuoteHeaderClick({
    initiation_point: "dashboard_header",
    device_type: params.deviceType,
  });
  void sendDashboardRequestQuoteHeaderClickEvent({
    initiationPoint: "dashboard_header",
    deviceType: params.deviceType,
  });
}

/**
 * Fires GA4 `select_content` and CDP `customerportal:DASHBOARD_FEATURED_CONTENT_CLICK` when the
 * user activates the featured content tile CTA (e.g. Learn More).
 */
export function trackDashboardFeaturedContentClick(params: {
  tileHeading: string;
  categoryLabel: string;
  linkUrl: string;
}): void {
  const linkUrl = params.linkUrl?.trim() ?? "";
  if (!linkUrl) return;
  const tileHeading = params.tileHeading?.trim() ?? "";
  const categoryLabel = params.categoryLabel?.trim() ?? "";
  logGTMDashboardFeaturedContentClick({
    content_type: "featured_content",
    tile_heading: tileHeading,
    category_label: categoryLabel,
    link_url: linkUrl,
  });
  void sendDashboardFeaturedContentClickEvent({
    tileHeading,
    categoryLabel,
    linkUrl,
  });
}

/**
 * Fires GA4 `select_content` and CDP `customerportal:DASHBOARD_UTILITY_LINK_CLICK` when the user
 * activates a utility link card.
 */
export function trackDashboardUtilityLinkClick(params: {
  linkLabel: string;
  linkPosition: number;
  linkUrl: string;
}): void {
  const linkUrl = params.linkUrl?.trim() ?? "";
  if (!linkUrl) return;
  if (params.linkPosition < 1) return;
  const linkLabel = (params.linkLabel?.trim() ?? "") || linkUrl;
  logGTMDashboardUtilityLinkClick({
    content_type: "utility_link",
    link_label: linkLabel,
    link_position: params.linkPosition,
    link_url: linkUrl,
  });
  void sendDashboardUtilityLinkClickEvent({
    linkLabel,
    linkPosition: params.linkPosition,
    linkUrl,
  });
}

/**
 * Fires GA4 `select_content` and CDP `customerportal:DASHBOARD_REQUEST_DOC_INITIATED` when the user
 * chooses Request Document from the Recent Orders row overflow menu.
 */
export function trackDashboardRecentOrderRequestDocumentFromMenu(): void {
  logGTMDashboardRecentOrderOverflowMenuAction({
    content_type: "overflow_menu_action",
    action: "request_document",
    initiation_point: "dashboard_order_menu",
  });
  void sendDashboardRecentOrderRequestDocInitiatedEvent();
}

/**
 * Fires GA4 `select_content` and CDP `customerportal:DASHBOARD_REQUEST_QUOTE_INITIATED` when the
 * user chooses Request Quote from the Recent Orders row overflow menu.
 */
export function trackDashboardRecentOrderRequestQuoteFromMenu(): void {
  logGTMDashboardRecentOrderOverflowMenuAction({
    content_type: "overflow_menu_action",
    action: "request_quote",
    initiation_point: "dashboard_order_menu",
  });
  void sendDashboardRecentOrderRequestQuoteInitiatedEvent();
}

/**
 * Fires GA4 `select_content` and CDP `customerportal:DASHBOARD_NEWS_ARTICLE_CLICK` when the user
 * clicks Read Article on a Latest News & Insights row.
 */
export function trackDashboardNewsArticleClick(params: {
  articleTitle: string;
  rowPosition: number;
  linkUrl: string;
}): void {
  const linkUrl = params.linkUrl?.trim() ?? "";
  if (!linkUrl || params.rowPosition < 1) return;
  const articleTitle = (params.articleTitle?.trim() ?? "") || linkUrl;
  logGTMDashboardNewsArticleClick({
    content_type: "news_article",
    article_title: articleTitle,
    row_position: params.rowPosition,
    link_url: linkUrl,
  });
  void sendDashboardNewsArticleClickEvent({
    articleTitle,
    rowPosition: params.rowPosition,
    linkUrl,
  });
}

/**
 * Fires GA4 `select_content` and CDP `customerportal:DASHBOARD_NEWS_VIEW_ALL` when the user
 * clicks View All on Latest News & Insights.
 */
/**
 * Fires GA4 `page_view` and CDP `customerportal:DASHBOARD_PAGE_VIEW` for the personalized
 * dashboard home. Call only after recent orders/quotes API data is available.
 */
export function trackDashboardPageView(params: {
  dashboardPersona: string;
  accountId: string;
  userType: "internal" | "external";
  infoPanelVisible: boolean;
  pillsVisible: boolean;
  ordersCount: number;
  quotesCount: number;
}): void {
  const accountId = params.accountId?.trim() ?? "";
  if (!accountId) return;

  logGTMDashboardPageViewDetailed({
    dashboard_persona: params.dashboardPersona?.trim() || "—",
    account_id: accountId,
    user_type: params.userType,
    info_panel_visible: params.infoPanelVisible,
    pills_visible: params.pillsVisible,
    orders_count: Math.max(0, params.ordersCount),
    quotes_count: Math.max(0, params.quotesCount),
  });
  void sendDashboardPageViewEvent({
    dashboardPersona: params.dashboardPersona?.trim() || "—",
    accountId,
    userType: params.userType,
    infoPanelVisible: params.infoPanelVisible,
    pillsVisible: params.pillsVisible,
    ordersCount: Math.max(0, params.ordersCount),
    quotesCount: Math.max(0, params.quotesCount),
  });
}

export function trackDashboardNewsViewAll(params: { itemsDisplayed: number }): void {
  const itemsDisplayed = Math.max(0, params.itemsDisplayed);
  logGTMDashboardNewsViewAll({
    content_type: "view_all",
    section: "news_insights",
    items_displayed: itemsDisplayed,
  });
  void sendDashboardNewsViewAllEvent({ itemsDisplayed });
}
