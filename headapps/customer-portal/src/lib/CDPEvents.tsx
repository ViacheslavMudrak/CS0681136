'use client';

import { event, identity, type EventData } from '@sitecore-cloudsdk/events/browser';
import type { EPResponse } from '@sitecore-cloudsdk/core/internal';
import type {
  ContactRequestEventData,
  DocumentRequestAbandonedEventData,
  DocumentRequestInitiatedEventData,
  DocumentRequestItemRemovedEventData,
  DocumentRequestPanelOpenedEventData,
  DocumentRequestSelectContentEventData,
  DocumentRequestSubmissionErrorEventData,
  DocumentRequestSubmittedEventData,
  LoginEventData,
  OrderManagementDocumentDownloadEventData,
  OrderManagementQuoteRequestedEventData,
  OrderManagementSearchFilterEventData,
  OrderDetailDocumentDownloadEventData,
  OrderDetailPackingSlipDownloadEventData,
  OrderDetailPackingSlipLanguageSelectedEventData,
  OrderDetailDocRequestInitiatedEventData,
  OrderDetailPageViewEventData,
  QuoteDetailGenerateLeadEventData,
  QuoteDetailPageViewEventData,
  QuoteDetailSelectContentEventData,
  OrderDetailQuoteRequestInitiatedEventData,
  DashboardInfoPanelLinkClickEventData,
  DashboardPillClickEventData,
  DashboardRecentOrderRowClickEventData,
  DashboardRecentQuoteRowClickEventData,
  DashboardFeaturedContentClickEventData,
  DashboardUtilityLinkClickEventData,
  DashboardNewsArticleClickEventData,
  DashboardNewsViewAllEventData,
  DashboardPageViewEventData,
  DashboardRequestQuoteHeaderClickEventData,
  AccountMenuOpenedEventData,
  AccountSwitchedEventData,
  LanguageSwitchedEventData,
  NavigationMenuClickEventData,
  OrderDetailRelatedDocumentsPanelViewEventData,
  OrderDetailSelectContentEventData,
  OrderDetailShipmentInformationPanelViewEventData,
  OrderDetailShipmentViewAllClickEventData,
  OrderDetailSupportContactClickEventData,
  OrderDetailTrackingLinkClickEventData,
  ProfileContextSwitchedEventData,
  ProfileMenuOpenedEventData,
  ProfileSettingsAccessedEventData,
  ProfileSettingProfileViewEventData,
  RegisterEventData,
  ResetPasswordEventData,
  SearchEventData,
  UserSignedOutEventData,
  IdentityEventData
} from './types/EventTypes';
import { getDeviceType, getBrowserInfo } from 'lib/device-utils';
import { AUTH_METHODS } from '@/helpers/enums';

/**
 * Event deduplication tracking
 * Prevents the same event from being sent multiple times in quick succession
 */
interface EventSignature {
  eventType: string;
  eventData: string; // JSON stringified key event data
}

const recentCDPEvents = new Map<string, number>();
const DEDUPLICATION_WINDOW_MS = 2000; // 2 seconds - prevent duplicates within this window

/**
 * Creates a unique signature for a CDP event to detect duplicates
 */
function createCDPEventSignature(eventType: string, eventData: EventData): string {
  // Create a normalized version of event data for comparison
  // Exclude device and browser info from extensionData as they are metadata
  const normalizedData: Record<string, unknown> = {
    type: eventData.type,
  };

  // Normalize extensionData, excluding device and browser info
  if (eventData.extensionData) {
    const normalizedExtensionData: Record<string, unknown> = {};
    Object.keys(eventData.extensionData)
      .filter(key => key !== 'device' && key !== 'browser' && key !== 'browser_version')
      .sort()
      .forEach(key => {
        normalizedExtensionData[key] = eventData.extensionData![key];
      });
    if (Object.keys(normalizedExtensionData).length > 0) {
      normalizedData.extensionData = normalizedExtensionData;
    }
  }

  // Add other top-level properties (like contextType for profile context switched events)
  Object.keys(eventData)
    .filter(key => key !== 'type' && key !== 'extensionData')
    .sort()
    .forEach(key => {
      normalizedData[key] = (eventData as Record<string, unknown>)[key];
    });

  const signature: EventSignature = {
    eventType,
    eventData: JSON.stringify(normalizedData),
  };

  return JSON.stringify(signature);
}

/**
 * Checks if a CDP event was recently sent and should be deduplicated
 */
function isDuplicateCDPEvent(signature: string): boolean {
  const lastSentTime = recentCDPEvents.get(signature);
  if (!lastSentTime) {
    return false;
  }

  const now = Date.now();
  const timeSinceLastSent = now - lastSentTime;

  // If event was sent within the deduplication window, it's a duplicate
  return timeSinceLastSent < DEDUPLICATION_WINDOW_MS;
}

/**
 * Records that a CDP event was sent
 */
function recordCDPEventSent(signature: string): void {
  recentCDPEvents.set(signature, Date.now());

  // Clean up old entries to prevent memory leaks
  // Remove entries older than the deduplication window
  const now = Date.now();
  for (const [key, timestamp] of recentCDPEvents.entries()) {
    if (now - timestamp > DEDUPLICATION_WINDOW_MS) {
      recentCDPEvents.delete(key);
    }
  }
}

/**
 * Sends a CDP event with deduplication
 * Prevents the same event from being sent multiple times within a 2-second window
 * Automatically adds device and browser information to extensionData
 */
async function sendCDPEventWithDeduplication(eventData: EventData): Promise<EPResponse | null> {
  try {
    // Check for duplicate events (before adding device/browser info)
    const signature = createCDPEventSignature(eventData.type || 'unknown', eventData);
    if (isDuplicateCDPEvent(signature)) {
      return null;
    }
    recordCDPEventSent(signature);

    // Get device and browser information
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    const deviceType = getDeviceType(userAgent);
    const browserInfo = getBrowserInfo(userAgent);

    // Add device and browser info to extensionData
    const enrichedEventData: EventData = {
      ...eventData,
      extensionData: {
        device: deviceType,
        browser: browserInfo.name,
        browser_version: browserInfo.version,
        ...eventData.extensionData, // Preserve existing extensionData (allows override if needed)
      },
    };

    const response = await event(enrichedEventData);
        
    return response;
  } catch {
    return null;
  }
}

export async function sendRegisterEvent(
  registerEventData: RegisterEventData
): Promise<EPResponse | null> {
  // Ensure the event type is set to REGISTER if not provided
  const eventData: RegisterEventData = {
    ...registerEventData,
    type: registerEventData.type || 'customerportal:REGISTER',
    extensionData: registerEventData.extensionData || {},
    auth_method: "register"
  };
  return sendCDPEventWithDeduplication(eventData);
}
export async function sendLoginEvent(
  loginEventData: LoginEventData,
): Promise<EPResponse | null> {
  const eventData: LoginEventData = {
    ...loginEventData,
    type: loginEventData.type || 'customerportal:LOGIN',
    extensionData: loginEventData.extensionData || {},
    auth_method: loginEventData.auth_method || 'login'
  };
  return sendCDPEventWithDeduplication(eventData);
}
export async function sendLogoutEvent(
  loginEventData: LoginEventData
): Promise<EPResponse | null> {
  const eventData: LoginEventData = {
    ...loginEventData,
    type: loginEventData.type || 'customerportal:LOGOUT',
    extensionData: loginEventData.extensionData || {},
  };
  return sendCDPEventWithDeduplication(eventData);
}
export async function sendResetPasswordEvent(
  resetEventData: ResetPasswordEventData
): Promise<EPResponse | null> {
  const eventData: ResetPasswordEventData = {
    ...resetEventData,
    type: resetEventData.type || 'customerportal:RESETPASSWORD',
    extensionData: resetEventData.extensionData || {},
    auth_method: AUTH_METHODS.TOKEN,
  };
  return sendCDPEventWithDeduplication(eventData);
}

export async function sendProfileContextSwitchedEvent(
  contextSwitchedEventData: ProfileContextSwitchedEventData & Record<string, unknown>
): Promise<EPResponse | null> {
  // Extract type and contextType, keep all other properties as dynamic data
  const { type, contextType, extensionData: existingExtensionData, ...dynamicContextData } = contextSwitchedEventData;

  // Build extension data with dynamic context properties
  const extensionData: Record<string, unknown> = {
    ...existingExtensionData, // Preserve any existing extensionData
  };

  // Add all dynamic context properties to extensionData
  // Only include properties that have defined values
  Object.entries(dynamicContextData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      extensionData[key] = value;
    }
  });

  const eventData = {
    type: type || 'customerportal:PROFILE_CONTEXT_SWITCHED',
    contextType: contextType,
    extensionData
  } as EventData;
  
  return sendCDPEventWithDeduplication(eventData);
}

function sendSelectContentEvent<T extends { extensionData?: Record<string, unknown> }>(
  data: T
): Promise<EPResponse | null> {
  const { extensionData: existingExtensionData, ...dynamicData } = data;
  const extensionData: Record<string, unknown> = {
    app_name: "customer-portal",
    ...existingExtensionData,
  };

  Object.entries(dynamicData as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      extensionData[key] = value;
    }
  });

  return sendCDPEventWithDeduplication({
    type: "SELECT_CONTENT",
    extensionData,
  } as EventData);
}

export async function sendNavigationMenuClickEvent(
  data: NavigationMenuClickEventData
): Promise<EPResponse | null> {
  return sendSelectContentEvent(data);
}

export async function sendAccountMenuOpenedEvent(
  data: AccountMenuOpenedEventData
): Promise<EPResponse | null> {
  return sendSelectContentEvent(data);
}

export async function sendLanguageSwitchedEvent(
  data: LanguageSwitchedEventData
): Promise<EPResponse | null> {
  return sendSelectContentEvent(data);
}

export async function sendProfileMenuOpenedEvent(
  data: ProfileMenuOpenedEventData
): Promise<EPResponse | null> {
  return sendSelectContentEvent(data);
}

export async function sendAccountSwitchedEvent(
  data: AccountSwitchedEventData
): Promise<EPResponse | null> {
  return sendSelectContentEvent(data);
}

export async function sendProfileSettingsAccessedEvent(
  data: ProfileSettingsAccessedEventData
): Promise<EPResponse | null> {
  return sendSelectContentEvent(data);
}

export async function sendUserSignedOutEvent(
  data: UserSignedOutEventData
): Promise<EPResponse | null> {
  return sendSelectContentEvent(data);
}

export async function sendSearchEvent(
  searchEventData: SearchEventData
): Promise<EPResponse | null> {
  const { type, searchTerm, searchCategory, noResults, extensionData: existingExtensionData } = searchEventData;

  // Build extension data with search details
  const extensionData: Record<string, unknown> = {
    searchTerm: searchTerm,
    ...existingExtensionData, // Preserve any existing extensionData
  };

  // Add optional search properties
  if (searchCategory) {
    extensionData.searchCategory = searchCategory;
  }
  if (noResults !== undefined) {
    extensionData.noResults = noResults;
  }

  const eventData = {
    type: type || 'SEARCH',
    extensionData
  } as EventData;
  
  return sendCDPEventWithDeduplication(eventData);
}

export async function sendOrderManagementSearchFilterEvent(
  data: OrderManagementSearchFilterEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    tab_name: data.tabName,
    filter_parameters: data.filterParameters,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: data.type || "customerportal:SEARCH_FILTER",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

export async function sendOrderManagementDocumentDownloadEvent(
  data: OrderManagementDocumentDownloadEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    document_type: data.documentType,
    ...(data.tabName ? { tab_name: data.tabName } : {}),
    ...(data.documentId ? { document_id: data.documentId } : {}),
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: data.type || "customerportal:DOCUMENT_DOWNLOAD",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

export async function sendOrderManagementQuoteRequestedEvent(
  data: OrderManagementQuoteRequestedEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    initiation_point: data.initiationPoint,
    request_mode: data.requestMode,
    ...(data.tabName ? { tab_name: data.tabName } : {}),
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: data.type || "customerportal:QUOTE_REQUESTED",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Profile Settings page view — aligns with GTM `logGTMProfileSettingPageView`
 * (Profile-Setting, Profile_View).
 */
export async function sendProfileSettingProfileViewEvent(
  data?: Partial<ProfileSettingProfileViewEventData>
): Promise<EPResponse | null> {
  const pageUrl = typeof window !== 'undefined' ? window.location.href : undefined;

  const extensionData: Record<string, unknown> = {
    page_name: 'Profile-Setting',
    page_path: '/Profile-Setting',
    page_type: 'Profile_View',
    app_name: 'customer-portal',
    ...(data?.extensionData as Record<string, unknown> | undefined),
  };

  if (pageUrl !== undefined) {
    extensionData.page_url = pageUrl;
  }

  const eventData = {
    type: data?.type || 'customerportal:Profile_View',
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Fires when the user clicks a support / contact action (intent to contact support).
 */
export async function sendContactRequestEvent(
  contactEventData: ContactRequestEventData
): Promise<EPResponse | null> {
  const {
    type,
    pagePath,
    linkText,
    contactChannel,
    supportSurface,
    linkTarget,
    extensionData: existingExtensionData
  } = contactEventData;

  const extensionData: Record<string, unknown> = {
    ...existingExtensionData
  };

  if (pagePath !== undefined) extensionData.page_path = pagePath;
  if (linkText !== undefined) extensionData.link_text = linkText;
  if (contactChannel !== undefined) extensionData.contact_channel = contactChannel;
  if (supportSurface !== undefined) extensionData.support_surface = supportSurface;
  if (linkTarget !== undefined) extensionData.link_target = linkTarget;
  extensionData.app_name = extensionData.app_name ?? 'customer-portal';

  const eventData = {
    type: type || 'Contact_Request',
    extensionData
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Order Detail page view (standard CDP VIEW) — aligns with GTM `page_view` / `page_name` Order_Detail.
 */
export async function sendOrderDetailPageViewEvent(
  data: OrderDetailPageViewEventData
): Promise<EPResponse | null> {
  const pageUrl = typeof window !== "undefined" ? window.location.href : undefined;

  const extensionData: Record<string, unknown> = {
    page_name: "Order_Detail",
    entry_point: data.entryPoint,
    order_number: data.orderNumber,
    app_name: "customer-portal",
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  if (pageUrl !== undefined) {
    extensionData.page_url = pageUrl;
  }

  const eventData = {
    type: "VIEW",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

export async function sendQuoteDetailPageViewEvent(
  data: QuoteDetailPageViewEventData
): Promise<EPResponse | null> {
  const pageUrl = typeof window !== "undefined" ? window.location.href : undefined;

  const extensionData: Record<string, unknown> = {
    page_title: "Quote Detail",
    page_name: "Quote_Detail",
    entry_point: data.entryPoint,
    quote_number: data.quoteNumber,
    quote_status: data.quoteStatus,
    user_type: data.userType,
    items_count: data.itemsCount,
    app_name: "customer-portal",
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  if (pageUrl !== undefined) {
    extensionData.page_url = pageUrl;
  }

  const eventData = {
    type: "customerportal:QUOTE_DETAIL_PAGE_VIEW",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

function sendQuoteDetailSelectContentEvent(
  cdpType: string,
  data: QuoteDetailSelectContentEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    content_type: data.contentType,
    ...(data.quoteStatus ? { quote_status: data.quoteStatus } : {}),
    ...(data.initiationPoint ? { initiation_point: data.initiationPoint } : {}),
    ...(data.action ? { action: data.action } : {}),
    ...(data.trigger ? { trigger: data.trigger } : {}),
    ...(data.scope ? { scope: data.scope } : {}),
    ...(data.section ? { section: data.section } : {}),
    ...(data.itemsCount != null ? { items_count: data.itemsCount } : {}),
    app_name: "customer-portal",
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  return sendCDPEventWithDeduplication({
    type: cdpType,
    extensionData,
  } as EventData);
}

function sendQuoteDetailGenerateLeadEvent(
  cdpType: string,
  data: QuoteDetailGenerateLeadEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    initiation_point: data.initiationPoint,
    items_count: data.itemsCount,
    app_name: "customer-portal",
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  return sendCDPEventWithDeduplication({
    type: cdpType,
    extensionData,
  } as EventData);
}

export async function sendQuoteDetailContactEmailClickEvent(
  data: QuoteDetailSelectContentEventData
): Promise<EPResponse | null> {
  return sendQuoteDetailSelectContentEvent("customerportal:QUOTE_DETAIL_CONTACT_EMAIL_CLICK", data);
}

export async function sendQuoteDetailRequestDocsClickEvent(
  data: QuoteDetailSelectContentEventData
): Promise<EPResponse | null> {
  return sendQuoteDetailSelectContentEvent("customerportal:QUOTE_DETAIL_REQUEST_DOCS_CLICK", data);
}

export async function sendQuoteDetailSupportEmailClickEvent(
  data: QuoteDetailSelectContentEventData
): Promise<EPResponse | null> {
  return sendQuoteDetailSelectContentEvent("customerportal:QUOTE_DETAIL_SUPPORT_EMAIL_CLICK", data);
}

export async function sendQuoteDetailLineItemToggleEvent(
  data: QuoteDetailSelectContentEventData
): Promise<EPResponse | null> {
  return sendQuoteDetailSelectContentEvent("customerportal:QUOTE_DETAIL_LINE_ITEM_TOGGLE", data);
}

export async function sendQuoteDetailExpandAllToggleEvent(
  data: QuoteDetailSelectContentEventData
): Promise<EPResponse | null> {
  return sendQuoteDetailSelectContentEvent("customerportal:QUOTE_DETAIL_EXPAND_ALL_TOGGLE", data);
}

export async function sendQuoteDetailItemMenuOpenEvent(
  data: QuoteDetailSelectContentEventData
): Promise<EPResponse | null> {
  return sendQuoteDetailSelectContentEvent("customerportal:QUOTE_DETAIL_ITEM_MENU_OPEN", data);
}

export async function sendQuoteDetailRequestQuoteInitiatedEvent(
  data: QuoteDetailSelectContentEventData
): Promise<EPResponse | null> {
  return sendQuoteDetailSelectContentEvent("customerportal:QUOTE_DETAIL_REQUEST_QUOTE_INITIATED", data);
}

export async function sendQuoteDetailRequestDocInitiatedEvent(
  data: QuoteDetailSelectContentEventData
): Promise<EPResponse | null> {
  return sendQuoteDetailSelectContentEvent("customerportal:QUOTE_DETAIL_REQUEST_DOC_INITIATED", data);
}

export async function sendQuoteDetailRequestUpdatedQuoteClickEvent(
  data: QuoteDetailGenerateLeadEventData
): Promise<EPResponse | null> {
  return sendQuoteDetailGenerateLeadEvent(
    "customerportal:QUOTE_DETAIL_REQUEST_UPDATED_QUOTE_CLICK",
    data
  );
}

export async function sendQuoteDetailExpiredPanelRfqClickEvent(
  data: QuoteDetailGenerateLeadEventData
): Promise<EPResponse | null> {
  return sendQuoteDetailGenerateLeadEvent("customerportal:QUOTE_DETAIL_EXPIRED_PANEL_RFQ_CLICK", data);
}

/**
 * Related Documents & Resources panel view (standard CDP VIEW).
 */
export async function sendOrderDetailRelatedDocumentsPanelViewEvent(
  data: OrderDetailRelatedDocumentsPanelViewEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    page_title: "Order_Detail",
    panel: "Related_Documents_Resources",
    order_number: data.orderNumber,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "VIEW",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Shipment Information panel view (standard CDP VIEW).
 */
export async function sendOrderDetailShipmentInformationPanelViewEvent(
  data: OrderDetailShipmentInformationPanelViewEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    page_title: "Order_Detail",
    panel: "Shipment_Information",
    order_number: data.orderNumber,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "VIEW",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Carrier tracking link opened in new tab from Shipment Information panel.
 */
export async function sendOrderDetailTrackingLinkClickEvent(
  data: OrderDetailTrackingLinkClickEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    content_type: "Tracking_Link",
    carrier_name: data.carrierName,
    order_number: data.orderNumber,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "customerportal:TRACKING_LINK_CLICK",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Packing slip download from Shipment Information panel.
 */
export async function sendOrderDetailPackingSlipDownloadEvent(
  data: OrderDetailPackingSlipDownloadEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    file_name: data.fileName,
    document_type: "Packing_Slip",
    language_code: data.languageCode,
    order_number: data.orderNumber,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "customerportal:DOCUMENT_DOWNLOAD",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Packing slip language chosen from menu when more than two languages are available.
 */
export async function sendOrderDetailPackingSlipLanguageSelectedEvent(
  data: OrderDetailPackingSlipLanguageSelectedEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    content_type: "Document_Language",
    language_code: data.languageCode,
    document_type: "Packing_Slip",
    order_number: data.orderNumber,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "customerportal:DOCUMENT_LANGUAGE_SELECTED",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * View all shipments link from Shipment Information panel.
 */
export async function sendOrderDetailShipmentViewAllClickEvent(
  data: OrderDetailShipmentViewAllClickEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    content_type: "View_All_Shipments",
    order_number: data.orderNumber,
    shipment_count: data.shipmentCount,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "customerportal:VIEW_ALL_CLICK",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Order Detail — generic `SELECT_CONTENT` (line expand, expand all, collapse all, subheader contact, etc.).
 */
export async function sendOrderDetailSelectContentEvent(
  data: OrderDetailSelectContentEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    interaction_type: data.interactionType,
    order_number: data.orderNumber,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "customerportal:SELECT_CONTENT",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

export async function sendOrderDetailDocRequestInitiatedEvent(
  data: OrderDetailDocRequestInitiatedEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    interaction_type: data.interactionType,
    initiation_point: data.initiationPoint,
    order_number: data.orderNumber,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "customerportal:ORDER_DETAIL_DOC_REQUEST_INITIATED",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

export async function sendOrderDetailQuoteRequestInitiatedEvent(
  data: OrderDetailQuoteRequestInitiatedEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    interaction_type: data.interactionType,
    initiation_point: data.initiationPoint,
    order_number: data.orderNumber,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "customerportal:ORDER_DETAIL_QUOTE_REQUEST_INITIATED",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Document download/open tracking from Related Documents panel.
 */
export async function sendOrderDetailDocumentDownloadEvent(
  data: OrderDetailDocumentDownloadEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    file_name: data.fileName,
    document_type: 'Related_Document',
    document_label: data.documentLabel,
    order_number: data.orderNumber,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: 'customerportal:DOCUMENT_DOWNLOAD',
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Support email click tracking from Related Documents panel.
 */
export async function sendOrderDetailSupportContactClickEvent(
  data: OrderDetailSupportContactClickEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    content_type: 'Email_Support',
    order_number: data.orderNumber,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: 'customerportal:SUPPORT_CONTACT_CLICK',
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Dashboard information panel — user clicked an inline link in banner rich text.
 */
export async function sendDashboardInfoPanelLinkClickEvent(
  data: DashboardInfoPanelLinkClickEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    content_type: "info_panel",
    link_text: data.linkText,
    link_url: data.linkUrl,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "customerportal:DASHBOARD_INFO_PANEL_LINK_CLICK",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Dashboard navigation pills — user clicked a linked pill tile.
 */
export async function sendDashboardPillClickEvent(
  data: DashboardPillClickEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    content_type: "navigation_pill",
    pill_label: data.pillLabel,
    pill_position: data.pillPosition,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "customerportal:DASHBOARD_PILL_CLICK",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Dashboard Recent Orders — user opened order detail from a row.
 */
export async function sendDashboardRecentOrderClickEvent(
  data: DashboardRecentOrderRowClickEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    content_type: "recent_order",
    order_number: data.orderNumber,
    order_status: data.orderStatus,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "customerportal:DASHBOARD_ORDER_CLICK",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Dashboard Recent Orders — user clicked View All (orders listing).
 */
export async function sendDashboardRecentOrdersViewAllEvent(): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    content_type: "view_all",
    section: "recent_orders",
  };

  const eventData = {
    type: "customerportal:DASHBOARD_ORDERS_VIEW_ALL",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Dashboard utility link card click.
 */
export async function sendDashboardUtilityLinkClickEvent(
  data: DashboardUtilityLinkClickEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    content_type: "utility_link",
    link_label: data.linkLabel,
    link_position: data.linkPosition,
    link_url: data.linkUrl,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "customerportal:DASHBOARD_UTILITY_LINK_CLICK",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Dashboard user info header — Request Quote (+) button.
 */
export async function sendDashboardRequestQuoteHeaderClickEvent(
  data: DashboardRequestQuoteHeaderClickEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    initiation_point: data.initiationPoint,
    device_type: data.deviceType,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "customerportal:DASHBOARD_REQUEST_QUOTE_HEADER_CLICK",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Dashboard featured content tile — Learn More CTA.
 */
export async function sendDashboardFeaturedContentClickEvent(
  data: DashboardFeaturedContentClickEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    content_type: "featured_content",
    tile_heading: data.tileHeading,
    category_label: data.categoryLabel,
    link_url: data.linkUrl,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "customerportal:DASHBOARD_FEATURED_CONTENT_CLICK",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Dashboard Recent Quotes — user opened quote detail from a row.
 */
export async function sendDashboardRecentQuoteClickEvent(
  data: DashboardRecentQuoteRowClickEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    content_type: "recent_quote",
    quote_status: data.quoteStatus,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "customerportal:DASHBOARD_QUOTE_CLICK",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Dashboard Recent Quotes — user clicked View All (quotes listing).
 */
export async function sendDashboardRecentQuotesViewAllEvent(): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    content_type: "view_all",
    section: "recent_quotes",
  };

  const eventData = {
    type: "customerportal:DASHBOARD_QUOTES_VIEW_ALL",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Dashboard Latest News & Insights — user clicked Read Article on a row.
 */
export async function sendDashboardNewsArticleClickEvent(
  data: DashboardNewsArticleClickEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    content_type: "news_article",
    article_title: data.articleTitle,
    row_position: data.rowPosition,
    link_url: data.linkUrl,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "customerportal:DASHBOARD_NEWS_ARTICLE_CLICK",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Dashboard Latest News & Insights — user clicked View All.
 */
export async function sendDashboardNewsViewAllEvent(
  data: DashboardNewsViewAllEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    content_type: "view_all",
    section: "news_insights",
    items_displayed: data.itemsDisplayed,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "customerportal:DASHBOARD_NEWS_VIEW_ALL",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Personalized dashboard home — page view after recent orders/quotes data is ready.
 */
export async function sendDashboardPageViewEvent(
  data: DashboardPageViewEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    page_title: "dashboard",
    dashboard_persona: data.dashboardPersona,
    account_id: data.accountId,
    user_type: data.userType,
    info_panel_visible: data.infoPanelVisible,
    pills_visible: data.pillsVisible,
    orders_count: data.ordersCount,
    quotes_count: data.quotesCount,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: "customerportal:DASHBOARD_PAGE_VIEW",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Dashboard Recent Orders overflow — Request Document.
 */
export async function sendDashboardRecentOrderRequestDocInitiatedEvent(): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    content_type: "overflow_menu_action",
    action: "request_document",
    initiation_point: "dashboard_order_menu",
  };

  const eventData = {
    type: "customerportal:DASHBOARD_REQUEST_DOC_INITIATED",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Dashboard Recent Orders overflow — Request Quote.
 */
export async function sendDashboardRecentOrderRequestQuoteInitiatedEvent(): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    content_type: "overflow_menu_action",
    action: "request_quote",
    initiation_point: "dashboard_order_menu",
  };

  const eventData = {
    type: "customerportal:DASHBOARD_REQUEST_QUOTE_INITIATED",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

export async function sendDocumentRequestPanelOpenedEvent(
  data: DocumentRequestPanelOpenedEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    initiation_point: data.initiationPoint,
    item_count: data.itemCount,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: data.type || "customerportal:DOC_REQUEST_PANEL_OPENED",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

export async function sendDocumentRequestSelectContentEvent(
  data: DocumentRequestSelectContentEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    initiation_point: data.initiationPoint,
    interaction_type: data.interactionType,
    ...(data.itemCount !== undefined ? { item_count: data.itemCount } : {}),
    ...(data.documentType ? { document_type: data.documentType } : {}),
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: data.type || "customerportal:SELECT_CONTENT",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

export async function sendDocumentRequestItemRemovedEvent(
  data: DocumentRequestItemRemovedEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    initiation_point: data.initiationPoint,
    item_count: data.itemCount,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: data.type || "customerportal:DOC_REQUEST_ITEM_REMOVED",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

export async function sendDocumentRequestAbandonedEvent(
  data: DocumentRequestAbandonedEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    initiation_point: data.initiationPoint,
    item_count: data.itemCount,
    document_type_selected: data.documentTypeSelected,
    had_notes: data.hadNotes,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: data.type || "customerportal:DOC_REQUEST_ABANDONED",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

export async function sendDocumentRequestInitiatedEvent(
  data: DocumentRequestInitiatedEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    initiation_point: data.initiationPoint,
    item_count: data.itemCount,
    document_type: data.documentType,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: data.type || "customerportal:DOC_REQUEST_INITIATED",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

export async function sendDocumentRequestSubmittedEvent(
  data: DocumentRequestSubmittedEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    initiation_point: data.initiationPoint,
    item_count: data.itemCount,
    document_type: data.documentType,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: data.type || "customerportal:DOC_REQUEST_SUBMITTED",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

export async function sendDocumentRequestSubmissionErrorEvent(
  data: DocumentRequestSubmissionErrorEventData
): Promise<EPResponse | null> {
  const extensionData: Record<string, unknown> = {
    initiation_point: data.initiationPoint,
    item_count: data.itemCount,
    error_type: data.errorType,
    ...(data.extensionData as Record<string, unknown> | undefined),
  };

  const eventData = {
    type: data.type || "customerportal:DOC_REQUEST_SUBMISSION_ERROR",
    extensionData,
  } as EventData;

  return sendCDPEventWithDeduplication(eventData);
}

/** Quote Request drawer opened (any entry point). */
export async function sendQuoteDrawerOpenedEvent(data: {
  initiationPoint: "General" | "Line_Item" | "Order_Header";
  buttonState: "New" | "Modify_Pending";
}): Promise<EPResponse | null> {
  const eventData = {
    type: "customerportal:QUOTE_DRAWER_OPENED",
    extensionData: {
      initiation_point: data.initiationPoint,
      button_state: data.buttonState,
    },
  } as EventData;
  return sendCDPEventWithDeduplication(eventData);
}

export async function sendQuoteReorderingBannerClickEvent(): Promise<EPResponse | null> {
  const eventData = {
    type: "customerportal:REORDERING_BANNER_CLICK",
    extensionData: {
      initiation_point: "General",
    },
  } as EventData;
  return sendCDPEventWithDeduplication(eventData);
}

export async function sendQuoteItemAddedEvent(data: {
  initiationPoint: "General" | "Line_Item" | "Order_Header";
  itemCount: number;
}): Promise<EPResponse | null> {
  const eventData = {
    type: "customerportal:QUOTE_ITEM_ADDED",
    extensionData: {
      initiation_point: data.initiationPoint,
      item_count: data.itemCount,
    },
  } as EventData;
  return sendCDPEventWithDeduplication(eventData);
}

export async function sendQuoteItemEditedEvent(data: {
  initiationPoint: "General" | "Line_Item" | "Order_Header";
}): Promise<EPResponse | null> {
  const eventData = {
    type: "customerportal:QUOTE_ITEM_EDITED",
    extensionData: {
      initiation_point: data.initiationPoint,
    },
  } as EventData;
  return sendCDPEventWithDeduplication(eventData);
}

export async function sendQuoteItemDeletedEvent(data: {
  initiationPoint: "General" | "Line_Item" | "Order_Header";
  itemCount: number;
}): Promise<EPResponse | null> {
  const eventData = {
    type: "customerportal:QUOTE_ITEM_DELETED",
    extensionData: {
      initiation_point: data.initiationPoint,
      item_count: data.itemCount,
    },
  } as EventData;
  return sendCDPEventWithDeduplication(eventData);
}

export async function sendQuoteRequestInitiatedEvent(data: {
  itemCount: number;
  entryTypes: string;
}): Promise<EPResponse | null> {
  const eventData = {
    type: "customerportal:QUOTE_REQUEST_INITIATED",
    extensionData: {
      item_count: data.itemCount,
      entry_types: data.entryTypes,
    },
  } as EventData;
  return sendCDPEventWithDeduplication(eventData);
}

export async function sendQuoteRequestSubmittedEvent(data: {
  itemCount: number;
  entryTypes: string;
  requestId: string;
}): Promise<EPResponse | null> {
  const eventData = {
    type: "customerportal:QUOTE_REQUEST_SUBMITTED",
    extensionData: {
      item_count: data.itemCount,
      entry_types: data.entryTypes,
      request_id: data.requestId,
    },
  } as EventData;
  return sendCDPEventWithDeduplication(eventData);
}

export async function sendQuoteRequestDiscardedEvent(data: {
  itemCount: number;
  discardStep: "Entry_Form" | "Review_Step";
}): Promise<EPResponse | null> {
  const eventData = {
    type: "customerportal:QUOTE_REQUEST_DISCARDED",
    extensionData: {
      item_count: data.itemCount,
      discard_step: data.discardStep,
    },
  } as EventData;
  return sendCDPEventWithDeduplication(eventData);
}

/**
 * Sends a Sitecore Cloud SDK IDENTITY event to convert the anonymous visitor
 * into a known contact. Should be called after a successful profile fetch.
 */
export async function sendIdentityEvent(
  data: IdentityEventData
): Promise<void> {
  try {
    if (!data.email) return;

    await identity({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      identifiers: [
        {
          id: data.email,
          provider: "email",
        },
      ],
      extensionData: {
        ext: {
          default: {
            customer_type: "Customer",
          },
        }       
      },
    });
  } catch {
    // Silently ignore identity event failures to avoid disrupting the user flow
  }
}
