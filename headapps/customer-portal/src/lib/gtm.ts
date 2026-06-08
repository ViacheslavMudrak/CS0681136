/**
 * Google Tag Manager utility functions
 */

import { AUTH_METHODS } from "@/helpers/enums";
import { getDeviceType, getBrowserInfo } from "./device-utils";
import type {
  AccountMenuOpenedEventData,
  AccountSwitchedEventData,
  LanguageSwitchedEventData,
  NavigationMenuClickEventData,
  ProfileMenuOpenedEventData,
  ProfileSettingsAccessedEventData,
  UserSignedOutEventData,
} from "./types/EventTypes";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

/**
 * Event deduplication tracking
 * Prevents the same event from being sent multiple times in quick succession
 */
interface EventSignature {
  eventName: string;
  eventData: string; // JSON stringified key event data
}

const recentEvents = new Map<string, number>();
const DEDUPLICATION_WINDOW_MS = 2000; // 2 seconds - prevent duplicates within this window

/**
 * Creates a unique signature for an event to detect duplicates
 */
function createEventSignature(eventName: string, eventData?: Record<string, unknown>): string {
  // Create a normalized version of event data for comparison
  // Exclude timestamp, device, and browser info as they are metadata
  const normalizedData: Record<string, unknown> = {};
  
  if (eventData) {
    Object.keys(eventData)
      .filter(key => key !== 'timestamp' && key !== 'device' && key !== 'browser' && key !== 'browser_version')
      .sort()
      .forEach(key => {
        normalizedData[key] = eventData[key];
      });
  }
  
  const signature: EventSignature = {
    eventName,
    eventData: JSON.stringify(normalizedData),
  };
  
  return JSON.stringify(signature);
}

/**
 * Checks if an event was recently sent and should be deduplicated
 */
function isDuplicateEvent(signature: string): boolean {
  const lastSentTime = recentEvents.get(signature);
  if (!lastSentTime) {
    return false;
  }
  
  const now = Date.now();
  const timeSinceLastSent = now - lastSentTime;
  
  // If event was sent within the deduplication window, it's a duplicate
  return timeSinceLastSent < DEDUPLICATION_WINDOW_MS;
}

/**
 * Records that an event was sent
 */
function recordEventSent(signature: string): void {
  recentEvents.set(signature, Date.now());
  
  // Clean up old entries to prevent memory leaks
  // Remove entries older than the deduplication window
  const now = Date.now();
  for (const [key, timestamp] of recentEvents.entries()) {
    if (now - timestamp > DEDUPLICATION_WINDOW_MS) {
      recentEvents.delete(key);
    }
  }
}

/**
 * Push event to GTM dataLayer with deduplication
 * Prevents the same event from being sent multiple times within a 2-second window
 */
export function pushGTMEvent(eventName: string, eventData?: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return;
  }

  // Check for duplicate events
  const signature = createEventSignature(eventName, eventData);
  if (isDuplicateEvent(signature)) {
    return;
  }

  // Initialize dataLayer if it doesn't exist
  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  // Get device and browser information
  const userAgent = window.navigator.userAgent;
  const deviceType = getDeviceType(userAgent);
  const browserInfo = getBrowserInfo(userAgent);

  // Push event to dataLayer
  window.dataLayer.push({
    event: eventName,
    ...eventData,
    device: deviceType,
    browser: browserInfo.name,
    browser_version: browserInfo.version,
    timestamp: new Date().toISOString(),
  });
  
  // Record that this event was sent
  recordEventSent(signature);
}

/**
 * Log logout event to GTM
 */
export function logGTMLogout(userInfo?: { userId?: string; email?: string; name?: string }) {
  pushGTMEvent("logout", {
    event_category: "authentication",
    event_label: "user_logout",
    user_id: userInfo?.userId,
    user_email: userInfo?.email,
    user_name: userInfo?.name,
  });
}

/**
 * Log page view event to GTM
 */
export function logGTMPageView(pageName: string, pagePath?: string, eventName?: string) {
  pushGTMEvent(eventName || "page_view", {
    event_category: "navigation",
    event_label: pageName,
    page_path: pagePath || (typeof window !== "undefined" ? window.location.pathname : ""),
    page_title: pageName,
  });
}

/**
 * Log login page view event to GTM
 */
export function logGTMLoginPageView() {
  logGTMPageView("login", "/login");
}

/**
 * Log register page view event to GTM
 */
export function logGTMRegisterPageView() {
  logGTMPageView("register", "/register");
}

/**
 * Log dashboard page view event to GTM (legacy minimal payload).
 * Prefer {@link logGTMDashboardPageViewDetailed} for the personalized dashboard spec.
 */
export function logGTMDashboardPageView() {
  logGTMPageView("dashboard", "/");
}

/** GA4 `page_view` — personalized dashboard home with widget context parameters. */
export function logGTMDashboardPageViewDetailed(data: {
  dashboard_persona: string;
  account_id: string;
  user_type: "internal" | "external";
  info_panel_visible: boolean;
  pills_visible: boolean;
  orders_count: number;
  quotes_count: number;
}) {
  pushGTMEvent("page_view", {
    event_category: "navigation",
    page_title: "dashboard",
    page_path: typeof window !== "undefined" ? window.location.pathname : "/",
    dashboard_persona: data.dashboard_persona,
    account_id: data.account_id,
    user_type: data.user_type,
    info_panel_visible: data.info_panel_visible,
    pills_visible: data.pills_visible,
    orders_count: data.orders_count,
    quotes_count: data.quotes_count,
  });
}

/**
 * Log reset password page view event to GTM
 */
export function logGTMResetPasswordPageView() {
  logGTMPageView("reset password", "/reset-password");
}

/**
 * Log account submitted page view event to GTM
 */
export function logGTMAccountSubmittedPageView() {
  logGTMPageView("account-submitted", "/account-submitted");
}
/**
 * Log profile page view event to GTM
 */
export function logGTMProfileSettingPageView() {
  logGTMPageView("Profile-Setting", "/Profile-Setting", "Profile_View");
}

/**
 * Roles & Permissions (admin) page view — e.g. `/en/admin/roles-permissions` → `/admin/roles-permissions` after locale strip.
 */
export function logGTMRolesPermissionsPageView() {
  logGTMPageView("Roles-Permissions", "/admin/roles-permissions");
}

/**
 * Log successful login event to GTM
 */
export function logGTMLoginSuccess(userInfo?: { userId?: string; email?: string; name?: string, authMethod?: string }) {
  pushGTMEvent("login", {
    event_category: "authentication",
    event_label: "user_login_success",
    user_id: userInfo?.userId,
    user_email: userInfo?.email,
    user_name: userInfo?.name,
    auth_method: userInfo?.authMethod,
  });
}

export function logGTMLoginFailure(authMethod: string, error?: string) {
  pushGTMEvent("login", {
    event_category: "authentication",
    event_label: "user_login_failure",
    auth_method: authMethod,
    error: error,
  });
}

/**
 * Log successful registration event to GTM
 */
export function logGTMRegisterSuccess(userInfo?: { userId?: string; email?: string; name?: string }) {
  pushGTMEvent("register", {
    event_category: "authentication",
    event_label: "user_register_success",
    user_id: userInfo?.userId,
    user_email: userInfo?.email,
    user_name: userInfo?.name,
  });
}

/**
 * Log password reset request event to GTM
 */
export function logGTMResetPasswordRequest(email?: string) {
  pushGTMEvent("reset_password_request", {
    event_category: "authentication",
    event_label: "password_reset_requested",
    user_email: email,
    auth_method: AUTH_METHODS.TOKEN,
  });
}

/**
 * Log password reset completion event to GTM
 */
export function logGTMResetPasswordComplete(userInfo?: { userId?: string; email?: string }) {
  pushGTMEvent("reset_password_complete", {
    event_category: "authentication",
    event_label: "password_reset_completed",
    user_id: userInfo?.userId,
    user_email: userInfo?.email,
    auth_method: AUTH_METHODS.TOKEN,
  });
}

/**
 * Log profile context switched event to GTM
 * This event is triggered when user changes language, location/account, job role, or company/org
 * Supports dynamic context switching - any properties passed will be included in the event
 * 
 * @param contextData - Object containing contextType (required) and any dynamic context properties
 * @example
 * logGTMProfileContextSwitched({
 *   contextType: "language",
 *   language: "fr",
 *   previousLanguage: "en",
 *   languageDisplayName: "French"
 * });
 */
export function logGTMProfileContextSwitched(contextData: {
  contextType: 'language' | 'location' | 'jobRole' | 'company' | string;
  [key: string]: unknown;
}) {
  const { contextType, ...dynamicProps } = contextData;
  
  // Convert camelCase keys to snake_case for GTM consistency
  const convertToSnakeCase = (str: string): string => {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
  };

  const eventData: Record<string, unknown> = {
    event_category: "user_preferences",
    event_label: "profile_context_switched",
    context_type: contextType,
  };

  // Add all dynamic properties, converting camelCase to snake_case
  Object.entries(dynamicProps).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      eventData[convertToSnakeCase(key)] = value;
    }
  });

  pushGTMEvent("profile_context_switched", eventData);
}

export function logGTMNavigationMenuClick(data: NavigationMenuClickEventData) {
  const { extensionData, ...eventData } = data;
  pushGTMEvent("select_content", {
    event_category: "engagement",
    ...eventData,
    ...extensionData,
  });
}

export function logGTMAccountMenuOpened(data: AccountMenuOpenedEventData) {
  const { extensionData, ...eventData } = data;
  pushGTMEvent("account_menu_opened", {
    event_category: "engagement",
    ...eventData,
    ...extensionData,
  });
}

export function logGTMLanguageSwitched(data: LanguageSwitchedEventData) {
  const { extensionData, ...eventData } = data;
  pushGTMEvent("language_switched", {
    event_category: "user_preferences",
    ...eventData,
    ...extensionData,
  });
}

export function logGTMProfileMenuOpened(data: ProfileMenuOpenedEventData) {
  const { extensionData, ...eventData } = data;
  pushGTMEvent("profile_menu_opened", {
    event_category: "engagement",
    ...eventData,
    ...extensionData,
  });
}

export function logGTMAccountSwitched(data: AccountSwitchedEventData) {
  const { extensionData, ...eventData } = data;
  pushGTMEvent("account_switched", {
    event_category: "user_preferences",
    ...eventData,
    ...extensionData,
  });
}

export function logGTMProfileSettingsAccessed(data: ProfileSettingsAccessedEventData) {
  const { extensionData, ...eventData } = data;
  pushGTMEvent("profile_settings_accessed", {
    event_category: "engagement",
    ...eventData,
    ...extensionData,
  });
}

export function logGTMUserSignedOut(data: UserSignedOutEventData) {
  const { extensionData, ...eventData } = data;
  pushGTMEvent("user_signed_out", {
    event_category: "authentication",
    ...eventData,
    ...extensionData,
  });
}

/**
 * Log search event to GTM (GA4 recommended search event)
 * This event is triggered when a user performs a search
 * 
 * @param searchData - Object containing search_term (required) and optional search details
 * @example
 * logGTMSearch({
 *   search_term: "order-12345",
 *   search_category: "Orders",
 *   app_name: "customer-portal",
 *   no_results: false
 * });
 */
export function logGTMSearch(searchData: {
  search_term: string;
  search_category?: string;
  no_results?: boolean;
}) {
  const eventData: Record<string, unknown> = {
    search_term: searchData.search_term,
    event_category: "search",
    event_label: "global_search",
  };

  // Add optional search properties
  if (searchData.search_category) {
    eventData.search_category = searchData.search_category;
  }
  if (searchData.no_results !== undefined) {
    eventData.no_results = searchData.no_results;
  }

  pushGTMEvent("search", eventData);
}

export function logGTMSearchFilter(filterData: {
  tab_name: string;
  filter_parameters: string[];
}) {
  pushGTMEvent("search_filter", {
    event_category: "search",
    event_label: "order_management_filter",
    tab_name: filterData.tab_name,
    filter_parameters: filterData.filter_parameters,
  });
}

export function logGTMOrderManagementDocumentDownload(data: {
  document_type: "Quote" | "Invoice" | "Packing Slip";
  tab_name: string;
  document_id?: string;
}) {
  pushGTMEvent("Document_Download", {
    event_category: "engagement",
    event_label: "order_management_document_download",
    document_type: data.document_type,
    tab_name: data.tab_name,
    ...(data.document_id ? { document_id: data.document_id } : {}),
  });
}

export function logGTMOrderManagementQuoteRequested(data: {
  initiation_point: "Header" | "Line Item";
  request_mode: "Bulk" | "Single";
  tab_name: string;
}) {
  pushGTMEvent("Quote_Requested", {
    event_category: "engagement",
    event_label: "order_management_quote_requested",
    initiation_point: data.initiation_point,
    request_mode: data.request_mode,
    tab_name: data.tab_name,
  });
}

/**
 * Log support contact intent (GA4 via GTM dataLayer).
 * Fires when the user clicks a contact support link/action.
 */
export function logGTMContactRequest(data: {
  page_path: string;
  link_text: string;
  contact_channel: 'email' | 'url';
  support_surface: string;
  /** Sanitized: "mailto" or web href/path (no raw email in dataLayer) */
  link_target: string;
}) {
  pushGTMEvent('Contact_Request', {
    event_category: 'support',
    event_label: 'contact_request',
    app_name: 'customer-portal',
    page_path: data.page_path,
    link_text: data.link_text,
    contact_channel: data.contact_channel,
    support_surface: data.support_surface,
    link_target: data.link_target
  });
}

/**
 * Order detail page view (route `/orders-management/orders/:orderNumber`).
 * Data layer: `page_view` with `page_name` Order_Detail, `entry_point`, `order_number`.
 */
export function logGTMOrderDetailPageView(data: {
  order_number: string;
  entry_point: string;
  page_path?: string;
}) {
  pushGTMEvent("page_view", {
    event_category: "navigation",
    page_name: "Order_Detail",
    page_title: "Order_Detail",
    order_number: data.order_number,
    entry_point: data.entry_point,
    page_path:
      data.page_path || (typeof window !== "undefined" ? window.location.pathname : ""),
  });
}

export function logGTMQuoteDetailPageView(data: {
  quote_number: string;
  entry_point: string;
  quote_status: string;
  user_type: string;
  items_count: number;
  page_path?: string;
}) {
  pushGTMEvent("page_view", {
    event_category: "navigation",
    page_name: "Quote_Detail",
    page_title: "Quote Detail",
    quote_number: data.quote_number,
    entry_point: data.entry_point,
    quote_status: data.quote_status,
    user_type: data.user_type,
    items_count: data.items_count,
    page_path:
      data.page_path || (typeof window !== "undefined" ? window.location.pathname : ""),
  });
}

export function logGTMQuoteDetailSelectContent(data: {
  content_type: string;
  quote_status?: string;
  initiation_point?: string;
  action?: string;
  trigger?: string;
  scope?: string;
  section?: string;
  items_count?: number;
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    content_type: data.content_type,
    ...(data.quote_status ? { quote_status: data.quote_status } : {}),
    ...(data.initiation_point ? { initiation_point: data.initiation_point } : {}),
    ...(data.action ? { action: data.action } : {}),
    ...(data.trigger ? { trigger: data.trigger } : {}),
    ...(data.scope ? { scope: data.scope } : {}),
    ...(data.section ? { section: data.section } : {}),
    ...(data.items_count != null ? { items_count: data.items_count } : {}),
  });
}

export function logGTMQuoteDetailGenerateLead(data: {
  initiation_point: string;
  items_count: number;
}) {
  pushGTMEvent("generate_lead", {
    event_category: "lead_generation",
    initiation_point: data.initiation_point,
    items_count: data.items_count,
  });
}

/**
 * Order Detail — Related Documents & Resources panel loaded (GA4 page_view via GTM).
 */
export function logGTMOrderDetailRelatedDocumentsPanelView(data: {
  order_number: string;
  page_path?: string;
}) {
  pushGTMEvent("page_view", {
    event_category: "navigation",
    page_title: "Order_Detail",
    panel: "Related_Documents_Resources",
    order_number: data.order_number,
    page_path:
      data.page_path || (typeof window !== "undefined" ? window.location.pathname : ""),
  });
}

/**
 * Order Detail — Shipment Information panel loaded (GA4 page_view via GTM).
 */
export function logGTMOrderDetailShipmentInformationPanelView(data: {
  order_number: string;
  page_path?: string;
}) {
  pushGTMEvent("page_view", {
    event_category: "navigation",
    page_title: "Order_Detail",
    panel: "Shipment_Information",
    order_number: data.order_number,
    page_path:
      data.page_path || (typeof window !== "undefined" ? window.location.pathname : ""),
  });
}

export function logGTMOrderDetailTrackingLinkClick(data: {
  order_number: string;
  carrier_name: string;
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    content_type: "Tracking_Link",
    carrier_name: data.carrier_name,
    order_number: data.order_number,
  });
}

export function logGTMOrderDetailPackingSlipDownload(data: {
  order_number: string;
  file_name: string;
  language_code: string;
}) {
  pushGTMEvent("file_download", {
    event_category: "engagement",
    file_name: data.file_name,
    document_type: "Packing_Slip",
    language_code: data.language_code,
    order_number: data.order_number,
  });
}

export function logGTMOrderDetailPackingSlipLanguageSelected(data: {
  order_number: string;
  language_code: string;
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    content_type: "Document_Language",
    document_type: "Packing_Slip",
    language_code: data.language_code,
    order_number: data.order_number,
  });
}

export function logGTMOrderDetailShipmentViewAllClick(data: {
  order_number: string;
  shipment_count: number;
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    content_type: "View_All_Shipments",
    order_number: data.order_number,
    shipment_count: data.shipment_count,
  });
}

/**
 * Tracks document download/open from Order Detail related documents panel.
 */
export function logGTMOrderDetailDocumentDownload(data: {
  fileName: string;
  documentLabel: string;
  orderNumber: string;
}) {
  pushGTMEvent("file_download", {
    event_category: "engagement",
    file_name: data.fileName,
    document_type: "Related_Document",
    document_label: data.documentLabel,
    order_number: data.orderNumber,
  });
}

/**
 * Tracks support email click from Order Detail related documents panel.
 */
export function logGTMOrderDetailSupportContactClick(data: { orderNumber: string }) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    content_type: "Email_Support",
    order_number: data.orderNumber,
  });
}

export function logGTMOrderDetailSelectContent(data: {
  order_number: string;
  interaction_type: string;
  initiation_point?: string;
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    order_number: data.order_number,
    interaction_type: data.interaction_type,
    ...(data.initiation_point ? { initiation_point: data.initiation_point } : {}),
  });
}

/** GA4 `select_content` — dashboard info panel inline link from rich text. */
export function logGTMDashboardInfoPanelLinkClick(data: {
  content_type: string;
  link_text: string;
  link_url: string;
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    content_type: data.content_type,
    link_text: data.link_text,
    link_url: data.link_url,
  });
}

/** GA4 `select_content` — dashboard navigation pill click. */
export function logGTMDashboardPillClick(data: {
  content_type: string;
  pill_label: string;
  pill_position: number;
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    content_type: data.content_type,
    pill_label: data.pill_label,
    pill_position: data.pill_position,
  });
}

/** GA4 `select_content` — dashboard Recent Orders row → order detail. */
export function logGTMDashboardRecentOrderRowClick(data: {
  content_type: string;
  order_number: string;
  order_status: string;
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    content_type: data.content_type,
    order_number: data.order_number,
    order_status: data.order_status,
  });
}

/** GA4 `select_content` — dashboard Recent Orders View All. */
export function logGTMDashboardRecentOrdersViewAll(data: { content_type: string; section: string }) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    content_type: data.content_type,
    section: data.section,
  });
}

/** GA4 `select_content` — dashboard Recent Quotes row → quote detail. */
export function logGTMDashboardRecentQuoteRowClick(data: {
  content_type: string;
  quote_status: string;
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    content_type: data.content_type,
    quote_status: data.quote_status,
  });
}

/** GA4 `select_content` — dashboard Recent Orders overflow (document / quote). */
export function logGTMDashboardRecentOrderOverflowMenuAction(data: {
  content_type: string;
  action: string;
  initiation_point: string;
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    content_type: data.content_type,
    action: data.action,
    initiation_point: data.initiation_point,
  });
}

/** GA4 `generate_lead` — dashboard user info header Request Quote button. */
export function logGTMDashboardRequestQuoteHeaderClick(data: {
  initiation_point: string;
  device_type: string;
}) {
  pushGTMEvent("generate_lead", {
    event_category: "lead_generation",
    initiation_point: data.initiation_point,
    device_type: data.device_type,
  });
}

/** GA4 `select_content` — dashboard featured content tile CTA. */
export function logGTMDashboardFeaturedContentClick(data: {
  content_type: string;
  tile_heading: string;
  category_label: string;
  link_url: string;
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    content_type: data.content_type,
    tile_heading: data.tile_heading,
    category_label: data.category_label,
    link_url: data.link_url,
  });
}

/** GA4 `select_content` — dashboard utility link card. */
export function logGTMDashboardUtilityLinkClick(data: {
  content_type: string;
  link_label: string;
  link_position: number;
  link_url: string;
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    content_type: data.content_type,
    link_label: data.link_label,
    link_position: data.link_position,
    link_url: data.link_url,
  });
}

/** GA4 `select_content` — dashboard Latest News & Insights article link. */
export function logGTMDashboardNewsArticleClick(data: {
  content_type: string;
  article_title: string;
  row_position: number;
  link_url: string;
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    content_type: data.content_type,
    article_title: data.article_title,
    row_position: data.row_position,
    link_url: data.link_url,
  });
}

/** GA4 `select_content` — dashboard Latest News & Insights View All. */
export function logGTMDashboardNewsViewAll(data: {
  content_type: string;
  section: string;
  items_displayed: number;
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    content_type: data.content_type,
    section: data.section,
    items_displayed: data.items_displayed,
  });
}

export function logGTMOrderDetailCollapseAll(data: { order_number: string }) {
  pushGTMEvent("order_detail_collapse_all", {
    event_category: "engagement",
    order_number: data.order_number,
    interaction_type: "Collapse_All_Items",
  });
}

export function logGTMOrderDetailSubheaderContactClick(data: { order_number: string }) {
  pushGTMEvent("order_detail_contact_click", {
    event_category: "engagement",
    order_number: data.order_number,
    interaction_type: "Contact_Click",
  });
}

export function logGTMDocumentRequestPanelOpened(data: {
  initiation_point: "Listing_Line_Item" | "Detail_Header" | "Detail_Line_Item";
  item_count: number;
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    initiation_point: data.initiation_point,
    item_count: data.item_count,
  });
}

export function logGTMDocumentRequestSelectContent(data: {
  initiation_point: "Listing_Line_Item" | "Detail_Header" | "Detail_Line_Item";
  interaction_type:
    | "document_type_selected"
    | "other_document_type_entered"
    | "doc_request_panel_dismissed"
    | "doc_request_confirmation_closed";
  item_count?: number;
  document_type?: string;
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    initiation_point: data.initiation_point,
    interaction_type: data.interaction_type,
    ...(data.item_count !== undefined ? { item_count: data.item_count } : {}),
    ...(data.document_type ? { document_type: data.document_type } : {}),
  });
}

export function logGTMDocumentRequestItemRemoved(data: {
  initiation_point: "Listing_Line_Item" | "Detail_Header" | "Detail_Line_Item";
  item_count: number;
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    initiation_point: data.initiation_point,
    item_count: data.item_count,
  });
}

export function logGTMDocumentRequestAbandoned(data: {
  initiation_point: "Listing_Line_Item" | "Detail_Header" | "Detail_Line_Item";
  item_count: number;
  document_type_selected: boolean;
  had_notes: boolean;
}) {
  pushGTMEvent("doc_request_abandoned", {
    event_category: "engagement",
    initiation_point: data.initiation_point,
    item_count: data.item_count,
    document_type_selected: data.document_type_selected,
    had_notes: data.had_notes,
  });
}

export function logGTMDocumentRequestInitiated(data: {
  initiation_point: "Listing_Line_Item" | "Detail_Header" | "Detail_Line_Item";
  item_count: number;
  document_type: string;
}) {
  pushGTMEvent("generate_lead", {
    event_category: "engagement",
    initiation_point: data.initiation_point,
    item_count: data.item_count,
    document_type: data.document_type,
  });
}

export function logGTMDocumentRequestSubmitted(data: {
  initiation_point: "Listing_Line_Item" | "Detail_Header" | "Detail_Line_Item";
  item_count: number;
  document_type: string;
}) {
  pushGTMEvent("doc_request_submitted", {
    event_category: "engagement",
    initiation_point: data.initiation_point,
    item_count: data.item_count,
    document_type: data.document_type,
  });
}

export function logGTMDocumentRequestSubmissionError(data: {
  initiation_point: "Listing_Line_Item" | "Detail_Header" | "Detail_Line_Item";
  item_count: number;
  error_type: string;
}) {
  pushGTMEvent("doc_request_submission_error", {
    event_category: "engagement",
    initiation_point: data.initiation_point,
    item_count: data.item_count,
    error_type: data.error_type,
  });
}

/**
 * Order listing page view event.
 */
export function logGTMOrderListingPageView(pagePath?: string) {
  pushGTMEvent("page_view", {
    event_category: "navigation",
    page_title: "Order_Listing",
    page_path: pagePath || "/orders-management/orders",
  });
}

// --- Quote Request (GA4 via GTM) ---

export function logGTMQuoteDrawerOpened(data: {
  initiation_point: "General" | "Line_Item" | "Order_Header";
  button_state: "New" | "Modify_Pending";
}) {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    content_type: "Quote_Drawer",
    initiation_point: data.initiation_point,
    button_state: data.button_state,
  });
}

export function logGTMQuoteReorderingBannerClick() {
  pushGTMEvent("select_content", {
    event_category: "engagement",
    content_type: "Reordering_Banner",
    initiation_point: "General",
  });
}

export function logGTMQuoteItemAdded(data: {
  initiation_point: "General" | "Line_Item" | "Order_Header";
  item_count: number;
}) {
  pushGTMEvent("quote_item_added", {
    event_category: "engagement",
    initiation_point: data.initiation_point,
    item_count: data.item_count,
  });
}

export function logGTMQuoteItemEdited(data: {
  initiation_point: "General" | "Line_Item" | "Order_Header";
}) {
  pushGTMEvent("quote_item_edited", {
    event_category: "engagement",
    initiation_point: data.initiation_point,
  });
}

export function logGTMQuoteItemDeleted(data: {
  initiation_point: "General" | "Line_Item" | "Order_Header";
  item_count: number;
}) {
  pushGTMEvent("quote_item_deleted", {
    event_category: "engagement",
    initiation_point: data.initiation_point,
    item_count: data.item_count,
  });
}

export function logGTMQuoteRequestInitiated(data: { item_count: number; entry_types: string }) {
  pushGTMEvent("generate_lead", {
    event_category: "lead_generation",
    item_count: data.item_count,
    entry_types: data.entry_types,
  });
}

export function logGTMQuoteRequestSubmitted(data: {
  item_count: number;
  entry_types: string;
  request_id: string;
}) {
  pushGTMEvent("quote_request_submitted", {
    event_category: "engagement",
    item_count: data.item_count,
    entry_types: data.entry_types,
    request_id: data.request_id,
  });
}

export function logGTMQuoteRequestDiscarded(data: {
  item_count: number;
  discard_step: "Entry_Form" | "Review_Step";
}) {
  pushGTMEvent("quote_request_discarded", {
    event_category: "engagement",
    item_count: data.item_count,
    discard_step: data.discard_step,
  });
}

