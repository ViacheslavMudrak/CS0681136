import type { IQuoteDetailFields } from "@/components/core/QuoteDetail/QuoteDetail.type";
import { normalizeQuoteDetailCmsFields } from "@/lib/quote-detail-cms-fields";

const t = (value: string) => ({ value });

/** Experience Editor / layout preview placeholders (merged under normalized CMS in editing mode). */
export function getBlankQuoteDetailFields(): IQuoteDetailFields {
  return {
    BackLinkLabel: t("Back"),
    QuoteNumberPrefix: t("Quote"),
    CreatedDatePrefix: t("Created"),
    CreatedByPrefix: t("by"),
    ExpiresLabel: t("Expires"),
    ExpiredLabel: t("Expired"),
    ReadyStatusLabel: t("Ready"),
    ExpiredStatusLabel: t("Expired"),
    NotFoundStatusLabel: t("Not found"),
    RequestDocumentsButtonLabel: t("Request Documents"),
    RequestUpdatedQuoteButtonLabel: t("Request Updated Quote"),
    SectionTitlePattern: t("Quoted Items ({ITEM_COUNT})"),
    ExpandAllLabel: t("Expand All Items"),
    CollapseAllLabel: t("Collapse All Items"),
    ColumnHeader: t("PART # / DESCRIPTION"),
    CustomerPartLabel: t("Customer Part"),
    IntraloxPartLabel: t("Intralox Part"),
    PricingSectionTitle: t("Pricing Information"),
    SubTotalLabel: t("Subtotal"),
    TaxLabel: t("Tax"),
    TotalLabel: t("Total"),
    CostExpiredPanelHeading: t("Cost Estimate Expired"),
    CostExpiredPanelBody: t("Pricing information is no longer available for this quote."),
    CostExpiredPanelLinkLabel: t("Request an updated quote"),
    CostExpiredPanelPostLinkText: t("to view current pricing and availability."),
    SupportInfoMessage: t("Have questions about this quote?"),
    SupportInfoLinkLabel: t("Contact Us"),
    KebabRequestQuoteLabel: t("Request a Quote"),
    KebabRequestDocumentLabel: t("Request Document"),
    ApiErrorMessage: t("Unable to load quote details. Please try again."),
    QuoteNotFoundMessage: t("This quote could not be found."),
    EmptyStateHeading: t("Quote details unavailable"),
    EmptyStateBody: t("We couldn't load this quote. Please try again or contact support."),
    EmptyStateRetryButtonLabel: t("Retry"),
  };
}

/**
 * Normalizes Sitecore field aliases, then optionally merges editor blanks so
 * Experience Editor still shows labels when the datasource is empty.
 */
export function resolveQuoteDetailFields(
  raw: Partial<IQuoteDetailFields> | Record<string, unknown> | null | undefined,
  isEditing: boolean
): IQuoteDetailFields {
  const normalized = normalizeQuoteDetailCmsFields(raw ?? {});
  if (!isEditing) return normalized;
  return { ...getBlankQuoteDetailFields(), ...normalized };
}

/** @deprecated Use {@link resolveQuoteDetailFields} with `isEditing: false` */
export function mergeQuoteDetailCmsFields(
  sc: Partial<IQuoteDetailFields> | Record<string, unknown> | null | undefined
): IQuoteDetailFields {
  return resolveQuoteDetailFields(sc, false);
}
