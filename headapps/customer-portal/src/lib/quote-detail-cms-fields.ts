import type { Field, ImageField, LinkField } from "@sitecore-content-sdk/nextjs";

import type { IQuoteDetailFields } from "@/components/core/QuoteDetail/QuoteDetail.type";

type RawQuoteDetail = Partial<IQuoteDetailFields> & Record<string, unknown>;

interface SitecoreFieldListItem {
  name?: unknown;
  jsonValue?: unknown;
}

function flattenSitecoreFieldList(raw: RawQuoteDetail): Partial<IQuoteDetailFields> {
  const data = raw.data;
  if (!data || typeof data !== "object") return {};
  const item = (data as Record<string, unknown>).item;
  if (!item || typeof item !== "object") return {};
  const fields = (item as Record<string, unknown>).fields;
  if (!Array.isArray(fields)) return {};

  return fields.reduce<Partial<IQuoteDetailFields>>((acc, field) => {
    if (!field || typeof field !== "object") return acc;
    const { name, jsonValue } = field as SitecoreFieldListItem;
    if (typeof name === "string" && jsonValue !== undefined && jsonValue !== null) {
      acc[name as keyof IQuoteDetailFields] = jsonValue as never;
    }
    return acc;
  }, {});
}

function pickField<T extends Field<string> | ImageField | LinkField | undefined>(
  raw: RawQuoteDetail,
  canonical: keyof IQuoteDetailFields,
  ...aliases: string[]
): T | undefined {
  const direct = raw[canonical];
  if (direct !== undefined && direct !== null) return direct as T;
  for (const key of aliases) {
    const v = raw[key as keyof RawQuoteDetail];
    if (v !== undefined && v !== null) return v as T;
  }
  return undefined;
}

/**
 * Maps Sitecore Quote Detail datasource field API names (layout / GraphQL JSON)
 * onto {@link IQuoteDetailFields} canonical property names used by React components.
 * Canonical keys win when both are present.
 */
export function normalizeQuoteDetailCmsFields(
  raw: Partial<IQuoteDetailFields> | Record<string, unknown> | null | undefined
): IQuoteDetailFields {
  const input = (raw ?? {}) as RawQuoteDetail;
  const r = { ...flattenSitecoreFieldList(input), ...input } as RawQuoteDetail;

  return {
    ...r,
    PricingSectionTitle: pickField(r, "PricingSectionTitle", "SectionTitle"),
    SubTotalLabel: pickField(r, "SubTotalLabel", "SubtotalLabel"),
    CostExpiredPanelHeading: pickField(r, "CostExpiredPanelHeading", "CostPanelHeading"),
    CostExpiredPanelBody: pickField(r, "CostExpiredPanelBody", "CostPanelBodyText"),
    CostExpiredPanelLinkLabel: pickField(r, "CostExpiredPanelLinkLabel", "CostPanelLinkLabel"),
    CostExpiredPanelPostLinkText: pickField(r, "CostExpiredPanelPostLinkText", "CostPanelPostLinkText"),
    CostExpiredPanelIcon: pickField(r, "CostExpiredPanelIcon", "CostPanelIcon"),
    SupportInfoMessage: pickField(r, "SupportInfoMessage", "InfoPanelMessageText"),
    SupportInfoIcon: pickField(r, "SupportInfoIcon", "InfoPanelIcon"),
    SupportInfoLink: pickField(r, "SupportInfoLink", "InfoPanelLink"),
    SupportInfoLinkLabel: pickField(r, "SupportInfoLinkLabel", "InfoPanelLinkLabel"),
    RequestUpdatedQuoteButtonLabel: pickField(r, "RequestUpdatedQuoteButtonLabel", "RequestUpdateButtonLabel"),
    RequestUpdatedQuoteButtonIcon: pickField(r, "RequestUpdatedQuoteButtonIcon", "RequestUpdateButtonIcon"),
    KebabRequestDocumentLabel: pickField(r, "KebabRequestDocumentLabel", "RequestDocumentLabel"),
    KebabRequestQuoteLabel: pickField(r, "KebabRequestQuoteLabel", "RequestQuoteLabel"),
    KebabRequestDocumentIcon: pickField(r, "KebabRequestDocumentIcon", "RequestDocumentIcon"),
    KebabRequestQuoteIcon: pickField(r, "KebabRequestQuoteIcon", "RequestQuoteIcon"),
    CustomerPartLabel: pickField(r, "CustomerPartLabel", "CustomerPartPrefixLabel"),
    IntraloxPartLabel: pickField(r, "IntraloxPartLabel", "IntraloxPartPrefixLabel"),
    ApiErrorMessage: pickField(r, "ApiErrorMessage", "APIErrorMessage"),
    QuoteNotFoundMessage: pickField(r, "QuoteNotFoundMessage"),
    EmptyStateBody: pickField(r, "EmptyStateBody", "EmptyStateBodyText"),
  } as IQuoteDetailFields;
}

/**
 * Tolerates a common CMS typo: `{ITEM_COUNT}` not followed by `)`, so count replacement still reads well.
 */
export function normalizeSectionTitleItemCountToken(raw: string): string {
  return raw.replace(/\{ITEM_COUNT\}(?!\))/gi, "{ITEM_COUNT})");
}
