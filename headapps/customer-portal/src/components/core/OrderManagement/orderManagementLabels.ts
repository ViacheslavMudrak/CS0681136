/**
 * Internal chrome and DXP permission codes for Order Management.
 * Fallback when CMS does not yet expose an orders API error message field.
 */

export const DEFAULT_PAGE_SIZE = 10;

export const MAX_DATE_RANGE_MONTHS = 12;
export const MAX_DATE_RANGE_DAYS = 365;

export const ORDERS_GENERIC_ERROR_MESSAGE = "We could not load your orders. Please try again.";

/**
 * Default title when the list is empty or the API fails (override with Order Management root `NoRecordsMessage` in Sitecore).
 */
export const ORDER_MANAGEMENT_NO_RECORDS_FALLBACK = "No records available";

export const RETRY_ACTION_LABEL = "Retry";

/** Virtual preset id when applying default "last 12 months" (not always a CMS item). */
export const PRESET_LAST_12_MONTHS_ID = "__last_12_months__";

/** No date range applied until the user selects presets or a custom range and applies. */
export const PRESET_NONE_ID = "__none__";

/** Virtual preset for custom range selection mode. */
export const PRESET_CUSTOM_ID = "__custom__";

/** Mobile combined filter sheet (status + belt) — authoring fallbacks when not in CMS. */
export const MOBILE_FILTER_SHEET_HEADING = "Filter by";

export const MOBILE_ORDER_STATUS_SECTION = "Order Status";

export const MOBILE_BELT_SECTION_FALLBACK = "Belt Configuration";

export const MOBILE_FILTERS_CLEAR_ALL = "Clear All";

export const MOBILE_DATE_SHEET_TITLE = "Date Range Pickers";

export const MOBILE_DATE_PRESET_SELECT_LABEL = "Date range preset";

/** Fallback when CMS does not set {@link OrderManagementTabFields.DateRangeEndBeforeStartMessage}. */
export const DATE_RANGE_END_BEFORE_START_FALLBACK =
  "The end date must be on or after the start date.";

/** Fallback when CMS does not set {@link OrderManagementTabFields.DateRangeOutsideCalendarBoundsMessage}. */
export const DATE_RANGE_OUTSIDE_ROLLING_FALLBACK =
  "The selected dates must fall within the allowed date window.";

/** Fallback when CMS does not set {@link OrderManagementTabFields.ValidationError} for max range span. */
export const DATE_RANGE_SPAN_EXCEEDS_ROLLING_FALLBACK =
  "The selected date range cannot exceed 12 months.";

/** Fallback when CMS does not set {@link OrderManagementTabFields.DateRangeInvalidYearMessage}. */
export const DATE_RANGE_INVALID_YEAR_FALLBACK = "Invalid year.";
