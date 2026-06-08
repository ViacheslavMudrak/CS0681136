import type { Field, LinkField, TextField } from "@sitecore-content-sdk/nextjs";

import { getFieldStringValue } from "components/divider/dividerUtils";

import type {
  TestimonialCompanyField,
  TestimonialCompanyReference,
  TestimonialFields,
  TestimonialFieldsGraphQL,
  TestimonialNormalizedFields,
  TestimonialTextAlignment,
} from "./Testimonial.type";

export type {
  TestimonialFigureSurface,
  TestimonialTextAlignment,
} from "./Testimonial.type";

/**
 * User-visible fallbacks when Sitecore fields and rendering displayName are empty.
 */
export const TESTIMONIAL_ARIA_FALLBACK = "Testimonial";

export const TESTIMONIAL_SECTION_ARIA_FALLBACK = "Testimonial section";

export const TESTIMONIAL_COMPANY_DATA_ATTR =
  "data-testimonial-company" as const;

export const getTextValue = (field?: TextField | Field<string>): string => {
  if (!field) return "";
  return typeof field.value === "string" ? field.value : "";
};

export const hasNonEmptyTextField = (
  field?: TextField | Field<string>,
): boolean => {
  const v = field?.value;
  if (v == null) return false;
  if (typeof v !== "string") return true;
  return v.trim().length > 0;
};

/**
 * Parses Sitecore alignment (`params.Alignment` string or label from `params.Position` droplist).
 * Defaults to `left` when missing or unknown.
 */
export function parseTestimonialAlignment(
  raw: string | undefined,
): TestimonialTextAlignment {
  if (raw == null || String(raw).trim() === "") return "left";
  const v = String(raw).trim().toLowerCase();
  if (v === "center" || v === "centre") return "center";
  return "left";
}

/**
 * Merges layout `rendering.params` with the `params` object passed to the component.
 */
export function getMergedTestimonialParams(
  rendering: unknown,
  params: Record<string, unknown>,
): Record<string, unknown> {
  const r = rendering as { params?: unknown } | null | undefined;
  const fromRendering =
    r != null &&
    typeof r === "object" &&
    r.params != null &&
    typeof r.params === "object" &&
    !Array.isArray(r.params)
      ? (r.params as Record<string, unknown>)
      : {};
  return { ...fromRendering, ...params };
}

function droplistParamDisplayValue(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw === "string") return raw.trim();
  const o = raw as Record<string, unknown>;
  const inner = o.Value ?? o.value;
  if (inner != null && typeof inner === "object") {
    const iv = (inner as { value?: unknown }).value;
    if (typeof iv === "string" && iv.trim() !== "") return iv.trim();
  }
  if (typeof inner === "string" && inner.trim() !== "") return inner.trim();
  return getFieldStringValue(raw).trim();
}

export function getTestimonialAlignmentRawFromParams(
  params: Record<string, unknown>,
): string {
  const alignment = params.Alignment;
  if (typeof alignment === "string" && alignment.trim() !== "") {
    return alignment.trim();
  }
  return droplistParamDisplayValue(params.Position);
}

export const isTestimonialCompanyItemReference = (
  company: TestimonialCompanyField,
): company is TestimonialCompanyReference => {
  if (company == null || typeof company !== "object") return false;
  if ("fields" in company && company.fields != null) return true;
  if (
    "value" in company &&
    !("id" in company) &&
    !("displayName" in company) &&
    !("url" in company)
  ) {
    return false;
  }
  return (
    "id" in company ||
    "displayName" in company ||
    "name" in company ||
    "url" in company
  );
};

export const getCompanyTextFieldForSdk = (
  company?: TestimonialCompanyField,
): TextField | Field<string> | undefined => {
  if (!company) return undefined;
  if (isTestimonialCompanyItemReference(company)) {
    return company.fields?.Name;
  }
  return company as TextField;
};

export const getCompanyItemFallbackLabel = (
  company?: TestimonialCompanyField,
): string => {
  if (!company || !isTestimonialCompanyItemReference(company)) return "";
  const fromName = getTextValue(company.fields?.Name);
  if (fromName.trim().length > 0) return "";
  return (company.displayName ?? company.name ?? "").trim();
};

export const getCompanyMetadataValue = (
  company?: TestimonialCompanyField,
): string => {
  if (!company) return "";
  if (isTestimonialCompanyItemReference(company)) {
    const fromName = getTextValue(company.fields?.Name);
    if (fromName.trim()) return fromName.trim();
    return (company.displayName ?? company.name ?? "").trim();
  }
  return getTextValue(company as TextField).trim();
};

export const getAriaLabel = (
  quote?: string,
  attribution?: string,
  fallback?: string,
): string => {
  return quote || attribution || fallback || TESTIMONIAL_ARIA_FALLBACK;
};

export const getQuotePlainText = (field?: Field<string>): string => {
  const v = field?.value;
  if (v == null) return "";
  if (typeof v !== "string") return "";
  return v
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const hasMeaningfulQuote = (field?: Field<string>): boolean => {
  return getQuotePlainText(field).length > 0;
};

export const hasVisibleTestimonialContent = (
  fields: TestimonialNormalizedFields | null | undefined,
  isEditing: boolean,
): boolean => {
  if (isEditing) return true;
  if (!fields) return false;
  const {
    Quote,
    Attribution,
    JobTitle,
    Image,
    Link: linkField,
    Company,
  } = fields;
  const href = linkField?.value?.href;
  const hasLink =
    href != null && typeof href === "string" && href.trim().length > 0;

  return (
    hasMeaningfulQuote(Quote) ||
    hasNonEmptyTextField(Attribution) ||
    hasNonEmptyTextField(JobTitle) ||
    !!Image?.value?.src ||
    hasLink ||
    getCompanyMetadataValue(Company).length > 0
  );
};

export const parseTestimonialImageDimension = (
  raw: unknown,
  fallback: number,
): number => {
  if (raw == null) return fallback;
  if (typeof raw !== "string" && typeof raw !== "number") return fallback;
  const n = typeof raw === "string" ? Number.parseInt(raw, 10) : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.round(n), 2048);
};

export const getTestimonialLinkAriaFallback = (
  displayName: string | undefined,
  linkField: LinkField | undefined,
): string | undefined => {
  const dn = displayName?.trim();
  if (dn) return dn;
  const title = linkField?.value?.title;
  const titleStr = title != null ? String(title).trim() : "";
  if (titleStr) return titleStr;
  const href = linkField?.value?.href;
  if (href != null && typeof href === "string") {
    const h = href.trim();
    if (h) return h;
  }
  return undefined;
};

function isGraphQLShape(
  fields: TestimonialFields,
): fields is TestimonialFieldsGraphQL {
  return "data" in fields && fields?.data != null;
}

export const getNormalizedTestimonialFields = (
  fields: TestimonialFields | null | undefined,
): TestimonialNormalizedFields | null => {
  if (!fields) return null;

  if (isGraphQLShape(fields)) {
    const ds = fields?.data?.datasource;
    if (!ds) return null;
    return {
      Quote: ds.quote?.jsonValue,
      Attribution: ds.attribution?.jsonValue ?? ds.authorName?.jsonValue,
      JobTitle: ds.jobTitle?.jsonValue ?? ds.authorTitle?.jsonValue,
      Image: ds.image?.jsonValue,
      Link: ds.link?.jsonValue,
      Company: ds.company?.jsonValue,
    };
  }

  return {
    Quote: fields.Quote,
    Attribution: fields.Attribution,
    JobTitle: fields.JobTitle,
    Image: fields.Image,
    Link: fields.Link,
    Company: fields.Company,
  };
};
