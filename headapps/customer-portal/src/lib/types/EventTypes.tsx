import type { EventData } from '@sitecore-cloudsdk/events/browser';
import type { OrderDetailEntryPoint } from '@/lib/order-detail-entry-point';
import type { QuoteDetailEntryPoint } from '@/lib/quote-detail-entry-point';

/**
 * Custom event data interface for user registration events
 * Extends EventData from Sitecore Cloud SDK to include registration-specific fields
 */
export interface RegisterEventData extends EventData {
  /**
   * The event type identifier for registration events
   * Should be set to 'REGISTER' or similar custom event type
   */
  type: 'REGISTER' | string;
  
  /**
   * User's full name
   */
  name?: string;
  
  /**
   * User's email address
   */
  email: string;
  
  /**
   * User's first name
   */
  firstName?: string;
  auth_method?: string;
}

/**
 * Custom event data interface for user login events
 * Extends EventData from Sitecore SDK to include login-specific fields
 */
export interface LoginEventData extends EventData {
  type: 'LOGIN' | string;
  email? : string;
  userId?: string;
  name?: string;
  auth_method?: string;
}
/**
 * Custom event data interface for user reset events
 * Extends EventData from Sitecore SDK to include reset-specific fields
 */
export interface ResetPasswordEventData extends EventData {
  type: 'RESET' | string;
  email : string;
  auth_method?: string;
}

/**
 * Custom event data interface for profile context switched events
 * Extends EventData from Sitecore SDK to include context switching fields
 * Supports dynamic context switching for: language, location/account, job role, company/org
 * Any additional properties can be passed and will be included in the event via extensionData
 */
export interface ProfileContextSwitchedEventData extends EventData {
  type: 'PROFILE_CONTEXT_SWITCHED' | string;
  /**
   * The type of context that was switched (e.g., "language", "location", "jobRole", "company")
   */
  contextType: 'language' | 'location' | 'jobRole' | 'company' | string;
  /**
   * Dynamic properties - any additional context data can be passed as properties
   * Examples: language, previousLanguage, activeCompanyId, activeJobRoleId, etc.
   * These will be automatically moved to extensionData in the sendProfileContextSwitchedEvent function
   */
}

export type AccountSwitchSource = "left_nav" | "profile_menu";

export type PortalMenuSection = "GENERAL" | "ADMIN" | string;

export interface NavigationMenuClickEventData {
  interaction_type: "menu_clicked";
  menu_item: string;
  parent_item?: string;
  menu_section: PortalMenuSection;
  destination_url: string;
  extensionData?: Record<string, unknown>;
}

export interface AccountMenuOpenedEventData {
  interaction_type: "account_menu_opened";
  source: "left_nav";
  account_count: number;
  extensionData?: Record<string, unknown>;
}

export interface LanguageSwitchedEventData {
  interaction_type: "Language_Switched";
  previous_language: string;
  new_language: string;
  extensionData?: Record<string, unknown>;
}

export interface ProfileMenuOpenedEventData {
  interaction_type: "profile_menu_opened";
  user_id?: string;
  account_id?: string;
  extensionData?: Record<string, unknown>;
}

export interface AccountSwitchedEventData {
  interaction_type: "Account_Switched";
  previous_account_id: string;
  new_account_id: string;
  source: AccountSwitchSource;
  extensionData?: Record<string, unknown>;
}

export interface ProfileSettingsAccessedEventData {
  interaction_type: "profile_settings_accessed";
  user_id?: string;
  account_id?: string;
  extensionData?: Record<string, unknown>;
}

export interface UserSignedOutEventData {
  interaction_type: "user_signed_out";
  user_id?: string;
  account_id?: string;
  session_duration: number;
  extensionData?: Record<string, unknown>;
}

/**
 * Custom event data interface for search events
 * Extends EventData from Sitecore SDK to include search-specific fields
 * Tracks search queries with category, keyword, app name, and result status
 */
export interface SearchEventData extends EventData {
  type: 'customerportal:SEARCH' | string;
  /**
   * The search term/keyword that was searched
   */
  searchTerm: string;
  /**
   * The selected search category (e.g., "Orders", "Invoices", "Shipments")
   */
  searchCategory?: string;
  /**
   * Indicates whether the search returned no results
   */
  noResults?: boolean;
}

/**
 * Order Management filter event payload.
 * Fired when the listing updates after one or more filters are applied.
 */
export interface OrderManagementSearchFilterEventData extends EventData {
  type: "customerportal:SEARCH_FILTER" | string;
  tabName: string;
  filterParameters: string[];
}

/**
 * Order Management document download payload.
 */
export interface OrderManagementDocumentDownloadEventData extends EventData {
  type: "customerportal:DOCUMENT_DOWNLOAD" | string;
  documentType: "Quote" | "Invoice" | "Packing Slip" | string;
  tabName?: string;
  documentId?: string;
}

/**
 * Order Management quote request payload.
 */
export interface OrderManagementQuoteRequestedEventData extends EventData {
  type: "customerportal:QUOTE_REQUESTED" | string;
  initiationPoint: "Header" | "Line Item" | string;
  requestMode: "Bulk" | "Single" | string;
  tabName?: string;
}

/**
 * User intent to contact support (e.g. profile banner link / mailto).
 * Sent to Sitecore CDP as type {@link ContactRequestEventData.type}.
 */
/**
 * Profile Settings page view (aligned with GTM logGTMProfileSettingPageView).
 */
export interface ProfileSettingProfileViewEventData extends EventData {
  type: 'customerportal:Profile_View' | string;
}

export interface ContactRequestEventData extends EventData {
  type: 'Contact_Request' | string;
  /** Current app path when the user clicked */
  pagePath?: string;
  /** Visible link label */
  linkText?: string;
  /** How support is contacted */
  contactChannel?: 'email' | 'url';
  /** UI surface identifier */
  supportSurface?: string;
  /**
   * Target without PII: literal "mailto" for CSR email, or href/path for web links
   */
  linkTarget?: string;
}

/**
 * Payload for Order Detail document download CDP event (static type / document_type set in sender).
 */
export interface OrderDetailDocumentDownloadEventData {
  fileName: string;
  documentLabel: string;
  orderNumber: string;
  extensionData?: Record<string, unknown>;
}

/**
 * Payload for Order Detail support email click CDP event (static type / content_type set in sender).
 */
export interface OrderDetailSupportContactClickEventData {
  orderNumber: string;
  extensionData?: Record<string, unknown>;
}

/** Order Detail full page load (CDP standard VIEW; aligns with GA4 page_view). */
export interface OrderDetailPageViewEventData {
  orderNumber: string;
  entryPoint: OrderDetailEntryPoint;
  extensionData?: Record<string, unknown>;
}

export type QuoteDetailQuoteStatus = "ready" | "expired";
export type QuoteDetailUserType = "external" | "internal";

export interface QuoteDetailPageViewEventData {
  quoteNumber: string;
  entryPoint: QuoteDetailEntryPoint;
  quoteStatus: QuoteDetailQuoteStatus;
  userType: QuoteDetailUserType;
  itemsCount: number;
  extensionData?: Record<string, unknown>;
}

export interface QuoteDetailSelectContentEventData {
  quoteStatus?: QuoteDetailQuoteStatus;
  contentType: string;
  initiationPoint?: string;
  action?: string;
  trigger?: string;
  scope?: string;
  section?: string;
  itemsCount?: number;
  extensionData?: Record<string, unknown>;
}

export interface QuoteDetailGenerateLeadEventData {
  initiationPoint: string;
  itemsCount: number;
  extensionData?: Record<string, unknown>;
}

/**
 * Related Documents & Resources panel visible on Order Detail (CDP standard VIEW).
 */
export interface OrderDetailRelatedDocumentsPanelViewEventData {
  orderNumber: string;
  extensionData?: Record<string, unknown>;
}

/** Shipment Information panel visible on Order Detail (CDP standard VIEW). */
export interface OrderDetailShipmentInformationPanelViewEventData {
  orderNumber: string;
  extensionData?: Record<string, unknown>;
}

export interface OrderDetailTrackingLinkClickEventData {
  carrierName: string;
  orderNumber: string;
  extensionData?: Record<string, unknown>;
}

export interface OrderDetailPackingSlipDownloadEventData {
  fileName: string;
  languageCode: string;
  orderNumber: string;
  extensionData?: Record<string, unknown>;
}

export interface OrderDetailPackingSlipLanguageSelectedEventData {
  languageCode: string;
  orderNumber: string;
  extensionData?: Record<string, unknown>;
}

export interface OrderDetailShipmentViewAllClickEventData {
  orderNumber: string;
  shipmentCount: number;
  extensionData?: Record<string, unknown>;
}

/** Order Detail — CDP `SELECT_CONTENT` with `interaction_type` + `order_number`. */
export interface OrderDetailSelectContentEventData {
  orderNumber: string;
  interactionType: string;
  extensionData?: Record<string, unknown>;
}

export interface OrderDetailDocRequestInitiatedEventData {
  orderNumber: string;
  interactionType: string;
  initiationPoint: string;
  extensionData?: Record<string, unknown>;
}

export interface OrderDetailQuoteRequestInitiatedEventData {
  orderNumber: string;
  interactionType: string;
  initiationPoint: string;
  extensionData?: Record<string, unknown>;
}

/** Dashboard information panel — inline rich-text link (GA4 `select_content` + CDP custom). */
export interface DashboardInfoPanelLinkClickEventData {
  linkText: string;
  linkUrl: string;
  extensionData?: Record<string, unknown>;
}

/** Dashboard navigation pill tile click (GA4 `select_content` + CDP custom). */
export interface DashboardPillClickEventData {
  pillLabel: string;
  pillPosition: number;
  extensionData?: Record<string, unknown>;
}

/** Recent Orders widget — row click to order detail (GA4 `select_content` + CDP custom). */
export interface DashboardRecentOrderRowClickEventData {
  orderNumber: string;
  orderStatus: string;
  extensionData?: Record<string, unknown>;
}

/** Recent Quotes widget — row click to quote detail (GA4 `select_content` + CDP custom). */
export interface DashboardRecentQuoteRowClickEventData {
  quoteStatus: "ready" | "expired";
  extensionData?: Record<string, unknown>;
}

/** User Info header — Request Quote / Modify quote CTA (GA4 `generate_lead` + CDP custom). */
export interface DashboardRequestQuoteHeaderClickEventData {
  initiationPoint: string;
  deviceType: "desktop" | "tablet" | "mobile";
  extensionData?: Record<string, unknown>;
}

/** Featured content tile — Learn More CTA (GA4 `select_content` + CDP custom). */
export interface DashboardFeaturedContentClickEventData {
  tileHeading: string;
  categoryLabel: string;
  linkUrl: string;
  extensionData?: Record<string, unknown>;
}

/** Utility link card (GA4 `select_content` + CDP custom). */
export interface DashboardUtilityLinkClickEventData {
  linkLabel: string;
  linkPosition: number;
  linkUrl: string;
  extensionData?: Record<string, unknown>;
}

/** Latest News & Insights — Read Article (GA4 `select_content` + CDP custom). */
export interface DashboardNewsArticleClickEventData {
  articleTitle: string;
  rowPosition: number;
  linkUrl: string;
  extensionData?: Record<string, unknown>;
}

/** Latest News & Insights — View All (GA4 `select_content` + CDP custom). */
export interface DashboardNewsViewAllEventData {
  itemsDisplayed: number;
  extensionData?: Record<string, unknown>;
}

/** Personalized dashboard home page view (GA4 `page_view` + CDP custom). */
export interface DashboardPageViewEventData {
  dashboardPersona: string;
  accountId: string;
  userType: "internal" | "external";
  infoPanelVisible: boolean;
  pillsVisible: boolean;
  ordersCount: number;
  quotesCount: number;
  extensionData?: Record<string, unknown>;
}

export type DocumentRequestInitiationPoint =
  | "Listing_Line_Item"
  | "Detail_Header"
  | "Detail_Line_Item";

export type DocumentRequestSelectContentInteractionType =
  | "document_type_selected"
  | "other_document_type_entered"
  | "doc_request_panel_dismissed"
  | "doc_request_confirmation_closed";

export interface DocumentRequestPanelOpenedEventData extends EventData {
  type: "customerportal:DOC_REQUEST_PANEL_OPENED" | string;
  initiationPoint: DocumentRequestInitiationPoint;
  itemCount: number;
}

export interface DocumentRequestSelectContentEventData extends EventData {
  type: "customerportal:SELECT_CONTENT" | string;
  initiationPoint: DocumentRequestInitiationPoint;
  interactionType: DocumentRequestSelectContentInteractionType;
  itemCount?: number;
  documentType?: string;
}

export interface DocumentRequestItemRemovedEventData extends EventData {
  type: "customerportal:DOC_REQUEST_ITEM_REMOVED" | string;
  initiationPoint: DocumentRequestInitiationPoint;
  itemCount: number;
}

export interface DocumentRequestAbandonedEventData extends EventData {
  type: "customerportal:DOC_REQUEST_ABANDONED" | string;
  initiationPoint: DocumentRequestInitiationPoint;
  itemCount: number;
  documentTypeSelected: boolean;
  hadNotes: boolean;
}

export interface DocumentRequestInitiatedEventData extends EventData {
  type: "customerportal:DOC_REQUEST_INITIATED" | string;
  initiationPoint: DocumentRequestInitiationPoint;
  itemCount: number;
  documentType: string;
}

export interface DocumentRequestSubmittedEventData extends EventData {
  type: "customerportal:DOC_REQUEST_SUBMITTED" | string;
  initiationPoint: DocumentRequestInitiationPoint;
  itemCount: number;
  documentType: string;
}

export interface DocumentRequestSubmissionErrorEventData extends EventData {
  type: "customerportal:DOC_REQUEST_SUBMISSION_ERROR" | string;
  initiationPoint: DocumentRequestInitiationPoint;
  itemCount: number;
  errorType: string;
}

/** Data required to send a Sitecore Cloud SDK IDENTITY event after profile fetch. */
export interface IdentityEventData {
  firstName?: string;
  lastName?: string;
  email: string;
}
