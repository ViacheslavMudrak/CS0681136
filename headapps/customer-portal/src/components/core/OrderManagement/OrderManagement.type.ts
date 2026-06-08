import type { Field, ImageField, LinkField, TextField } from "@sitecore-content-sdk/nextjs";
import type { QuoteRequestCmsFields } from "./OrderManagementQuoteRequest.type";

import type { IDocumentRequestPanelFields } from "@/lib/document-request-panel-types";
import type { SitecoreDocumentRequestSelectionFieldValue } from "@/lib/document-request-cms.types";

/** Keys aligned with {@link BeltSelections} in orderManagementUtils. */
export type BeltSubgroupKey = "series" | "style" | "material" | "color";

/** Belt filter column: Sitecore label field + static/API options (mock until API). */
export interface BeltSubgroupMetaRow {
  key: BeltSubgroupKey;
  labelField?: Field<string>;
  label?: string;
  options: string[];
}

/** Status filter option (or legacy single-value option). */
export interface OrderManagementValueItem {
  id: string;
  displayName?: string;
  fields?: {
    Value?: Field<string>;
    StatusValue?: Field<string>;
    Statuskey?: Field<string>;
    StatusIcon?: ImageField;
  };
}

/** Search attribute definition (CMS multilist). */
export interface OrderManagementSearchAttributeItem {
  id: string;
  displayName?: string;
  fields?: {
    Value?: Field<string>;
  };
}

/** Grid column definition from CMS. */
export interface OrderManagementGridColumnItem {
  id: string;
  name?: string;
  displayName?: string;
  fields?: {
    GridName?: Field<string>;
    Sortable?: Field<boolean>;
  };
}

/** Page size option row (Orders tab multilist). */
export interface OrderManagementPageSizeOptionItem {
  id: string;
  displayName?: string;
  fields?: {
    Value?: Field<string>;
  };
}

/**
 * Shipment row field from Sitecore (expanded orders list) — `Value` is the column label; `url` last segment
 * identifies which API field to bind (e.g. `.../tracking-number` → tracking).
 */
export interface OrderManagementShipmentDetailItem {
  id: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Value?: Field<string>;
  };
}

/** Shipments carrier row from Sitecore (maps carrier name to tracking URL template). */
export interface OrderManagementCarrierSelectionItem {
  id: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    URL?: Field<string>;
  };
}

/** Date preset row from CMS. */
export interface OrderManagementDatePresetItem {
  id: string;
  /** Item name in Sitecore (used with {@link OrderManagementTabFields.DefaultSelection}). */
  name?: string;
  displayName?: string;
  fields?: {
    PresentValue?: Field<string>;
    IsDefault?: Field<boolean>;
    PresentLabel?: Field<string>;
  };
}

/** Status phrase mapping (dictionary / CMS). */
export interface OrderManagementStatusPhraseItem {
  id: string;
  displayName?: string;
  fields?: {
    Key?: Field<string>;
    Phrase?: Field<string>;
  };
}

/**
 * Permission row from Sitecore (PermissionSelection multilist on a tab).
 * `PermissionCode` is matched (normalized) against DXP user permission codes from the API.
 */
export interface OrderManagementPermissionItem {
  id: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    PermissionName?: Field<string>;
    PermissionCode?: Field<string>;
  };
}

/** Fields for a single tab (Orders, Shipments, etc.). */
export interface OrderManagementTabFields {
  SearchPlaceholder?: Field<string>;
  SearchAttribute?: OrderManagementSearchAttributeItem[];
  FilterLabel?: Field<string>;
  FilterOptions?: OrderManagementValueItem[];
  HideFilter?: Field<boolean>;
  HideBeltFilter?: Field<boolean>;
  BeltStyleLabel?: Field<string>;
  BeltMaterialLabel?: Field<string>;
  BeltFilterLabel?: Field<string>;
  BeltSeriesLabel?: Field<string>;
  BeltColorLabel?: Field<string>;
  BeltScrollableListThreshold?: Field<string>;
  BeltSearchDisplayThreshold?: Field<string>;
  BeltSearchPlaceholder?: Field<string>;
  GridSelection?: OrderManagementGridColumnItem[];
  ShipmentDetailsItemSelection?: OrderManagementShipmentDetailItem[];
  CarrierSelection?: OrderManagementCarrierSelectionItem[];
  RequestQuoteButtonIcon?: ImageField;
  RequestQuoteButtonLabel?: Field<string>;
  EmptyStatusIcon?: ImageField;
  EmptyStatusTitle?: Field<string>;
  EmptyStatusCTA?: LinkField;
  HideCTA?: Field<boolean>;
  EmptyStatusDescription?: Field<string>;
  DatePickerSelection?: OrderManagementDatePresetItem[];
  /**
   * Default date preset for this tab: matches a `DatePickerSelection` item `name` or `displayName`
   * (e.g. "Yesterday", "Last 12 Months"). When set, this takes precedence over `IsDefault` on list items.
   */
  DefaultSelection?: Field<string>;
  /**
   * Default status filter for this tab (e.g. "Placed"). Matches {@link FilterOptions} label / status key.
   * Applied on first visit until the user changes status filters (persisted per account).
   */
  DefaultFilterSelection?: Field<string>;
  RollingDuration?: Field<string>;
  /**
   * Shown when start/end are within the calendar window but the inclusive day span exceeds
   * {@link OrderManagementTabFields.RollingDuration} (optional; see orderManagementLabels fallbacks).
   */
  ValidationError?: Field<string>;
  /** Optional override when start or end falls outside [today − rolling days, today]. */
  DateRangeOutsideCalendarBoundsMessage?: Field<string>;
  /** Optional override when end date is before start date. */
  DateRangeEndBeforeStartMessage?: Field<string>;
  /** Optional override when start/end manual date fields have an incomplete or invalid year. */
  DateRangeInvalidYearMessage?: Field<string>;
  /** Optional override (reserved; date validation uses {@link ValidationError} for span vs rolling). */
  DateRangeExceedsMaxSpanMessage?: Field<string>;
  DatePickerIcon?: ImageField;
  CustomDateRange?: Field<boolean>;
  StatusItemsSelection?: OrderManagementStatusPhraseItem[];
  TabName?: Field<string>;
  TabURL?: LinkField;
  BannerIcon?: ImageField;
  BannerDescription?: Field<string>;
  HideBanner?: Field<boolean>;
  BannerTitle?: Field<string>;
  OrdersApiErrorMessage?: Field<string>;
  /** Tab-level overrides (e.g. Shipments) — fall back to component root when absent. */
  DefaultPageSize?: Field<string>;
  PageSizeOptionList?: OrderManagementPageSizeOptionItem[];
  ResultSummaryPattern?: Field<string>;
  /** Invoices: days-until-due at or below this value show urgent styling. */
  DueSoonThreshold?: Field<string>;
  DownloadInvoiceActionIcon?: ImageField;
  DownloadInvoiceActionLabel?: Field<string>;
  /** Quotes tab: PDF / document download CTA */
  DownloadQuoteLabel?: Field<string>;
  DownloadQuoteIcon?: ImageField;
  /** Shipments tab: packing slip column / download CTA */
  PackingSlipLabel?: Field<string>;
  PackingSlipIcon?: ImageField;
  RegenerateLabel?: Field<string>;
  RegenerateIcon?: ImageField;
  /** Integer days: expires-in from 0 through this threshold (inclusive) → urgency styling on EXPIRES IN. */
  ExpirySoonThreshold?: Field<string>;
  /** Icon after EXPIRES IN value when urgency applies. */
  UrgencyIcon?: ImageField;
  PermissionSelection?: OrderManagementPermissionItem[];
  /**
   * Document request panel CMS bundle (tab-level). Prefer {@link DocumentSelection} when available;
   * {@link QuoteSelection} is the interim field name on the same template.
   */
  DocumentSelection?: SitecoreDocumentRequestSelectionFieldValue;
  QuoteSelection?: SitecoreDocumentRequestSelectionFieldValue;
  LineItemModifyQuoteLabel?: Field<string>;
}

export interface OrderManagementTabItem {
  id: string;
  displayName?: string;
  fields?: OrderManagementTabFields;
}

/**
 * One entry in the Order Management `QuoteSelection` multilist (e.g. “Quote Request”, “Document Request”).
 */
export interface OrderManagementQuoteSelection {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: QuoteRequestCmsFields;
}

/** `QuoteSelection` on Order Management and Order Detail datasources. */
export type OrderManagementQuoteSelectionList =
  | OrderManagementQuoteSelection[]
  | OrderManagementQuoteSelection
  | undefined;

/**
 * Minimum shape to resolve request-quote copy via `getQuoteRequestCmsFields`
 * (shared with Order Detail line-item actions using the same multilist).
 */
export type QuoteSelectionFieldSource = {
  QuoteSelection?: OrderManagementQuoteSelectionList;
};

/**
 * Sitecore fields for Order Management (flat datasource shape).
 */
export interface IOrderManagementFields extends QuoteSelectionFieldSource {
  /**
   * Document request panel CMS bundle on OM root (optional). Orders tab `DocumentSelection` / `QuoteSelection`
   * overlays this when both are set (see `mergeOrderManagementDocumentRequestCms`).
   */
  DocumentSelection?: SitecoreDocumentRequestSelectionFieldValue;
  /** Header / toolbar CTA labels (Order Management item). */
  QuoteRequestNewLabelDesktop?: TextField;
  QuoteRequestNewLabelMobile?: TextField;
  QuoteModifyPendingLabelDesktop?: TextField;
  QuoteModifyPendingLabelMobile?: TextField;
  HideButton: Field<boolean>;
  RequestQuoteLabelMobile?: Field<string>;
  Title?: Field<string>;
  SubTitle?: Field<string>;
  RequestQuoteLabelDesktop?: Field<string>;
  RequestQuoteIcon?: ImageField;
  ModifyPendingQuoteIcon?: ImageField;
  ModifyPendingQuoteTitle?: Field<string>;
  /** Legacy CMS link; quote CTA may open the drawer instead when the URL is unset. */
  RequestQuoteURL?: LinkField;
  /** Toolbar filter cluster decorative icon (next to status/belt filters). */
  TabsFilterIcon?: ImageField;
  Tabs?: OrderManagementTabItem[];
  /** Default rows per page for the orders grid. */
  DefaultPageSize?: Field<string>;
  /** Multilist: each `Value` is a page size option (e.g. 10, 25, 50). */
  PageSizeOptionList?: OrderManagementPageSizeOptionItem[];
  /** Pagination summary, e.g. `Showing {start} – {end} of {total} results`. */
  ResultSummaryPattern?: Field<string>;
  /**
   * Single message for empty lists and API errors on all tabs (Orders, Shipments, Invoices).
   * Tab `EmptyStatusTitle` is used only as a fallback when this is blank.
   */
  NoRecordsMessage?: Field<string>;
}

/** CMS fields for the page header strip (title, subtitle, request-quote CTA). */
export interface OrderManagementHeaderProps {
  title?: Field<string>;
  subtitle?: Field<string>;
  requestQuoteLabelDesktop?: TextField;
  requestQuoteIcon?: ImageField;
  canRequestQuote?: boolean;
  hideRequestQuote: boolean;
  onRequestQuoteOpen?: () => void;
  quoteBadgeCount?: number;
  isModifyPendingQuote?: boolean;
}
