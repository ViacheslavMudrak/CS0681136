import type { PolicyStatementsFields, RouteData } from './PolicyStatements.type';
import type { RawPolicyStatementsData } from 'components/country-language-dropdown/countryLanguageDropdownUtils';
import type { LanguageDocumentItem } from 'components/country-language-dropdown/CountryLanguageDropdown.type';

export const POLICY_STATEMENTS_EMPTY_HINT = 'Policy Statements';

/**
 * Extracts the `PolicyStatementsData` bag from either the GraphQL-integrated
 * shape (`fields.data.PolicyStatementsData`) or a direct flat reference.
 */
export function extractPolicyStatementsData(
  fields: PolicyStatementsFields | null | undefined,
): RawPolicyStatementsData | null {
  return fields?.data?.PolicyStatementsData ?? null;
}

/**
 * Reads the `CountryLabel` string from the raw data bag.
 */
export function readCountryLabel(data: RawPolicyStatementsData | null): string {
  return data?.CountryLabel?.value?.trim() ?? '';
}

/**
 * Reads the `LanguageLabel` string from the raw data bag.
 */
export function readLanguageLabel(data: RawPolicyStatementsData | null): string {
  return data?.LanguageLabel?.value?.trim() ?? '';
}

/**
 * Extracts the `RouteData` bag from `fields.data.RouteData`.
 * Returns `null` when the context item has no Country/Documents fields
 * (e.g. on the Policy Statements listing page).
 */
export function extractRouteData(
  fields: PolicyStatementsFields | null | undefined,
): RouteData | null {
  return fields?.data?.RouteData ?? null;
}

/**
 * Reads the ISO country code of the current route item's `Country` reference.
 * Returns an empty string when not on a country-specific page.
 */
export function readRouteCountryCode(routeData: RouteData | null | undefined): string {
  return routeData?.CurrentCountry?.data?.Code?.value?.trim() ?? '';
}

// Layout Service (REST) fallback — reads directly from page.layout.sitecore.route.fields

/**
 * Sitecore Layout Service shape for a single Document item's fields.
 * This is the REST format returned in `route.fields.Documents[]`.
 */
interface LayoutServiceDocumentItem {
  id?: string;
  fields?: {
    Language?: {
      fields?: {
        Value?: { value?: string };
      };
    };
    DocumentLink?: {
      value?: {
        href?: string;
        target?: string;
      };
    };
  };
}

/**
 * Sitecore Layout Service shape for the `Country` field on the route item.
 */
interface LayoutServiceCountryField {
  fields?: {
    Code?: { value?: string };
  };
}

/**
 * Reads the ISO country code from `route.fields.Country` in the Sitecore
 * Layout Service (REST) format.  This is always populated regardless of
 * whether the Edge GraphQL `$contextItem` query has been deployed.
 */
export function readLayoutRouteCountryCode(
  routeFields: Record<string, unknown> | null | undefined,
): string {
  const country = routeFields?.Country as LayoutServiceCountryField | undefined;
  return country?.fields?.Code?.value?.trim() ?? '';
}

/**
 * Converts `route.fields.Documents` (Sitecore Layout Service REST array) into
 * `LanguageDocumentItem[]` ready for the language dropdown.
 *
 * Use as a fallback when the Edge GraphQL `RouteData` query has not yet been
 * deployed to the Sitecore instance.
 */
export function normalizeLayoutRouteDocuments(
  routeFields: Record<string, unknown> | null | undefined,
): LanguageDocumentItem[] {
  const docs = routeFields?.Documents as LayoutServiceDocumentItem[] | undefined;
  if (!docs?.length) return [];

  return docs
    .filter((d): d is NonNullable<typeof d> => d != null)
    .map((d, index) => ({
      id: d.id?.trim() || `layout-doc-${index}`,
      language: d.fields?.Language?.fields?.Value?.value?.trim() ?? '',
      href: d.fields?.DocumentLink?.value?.href?.trim() ?? '',
      target: d.fields?.DocumentLink?.value?.target ?? undefined,
    }))
    .filter((d) => d.href !== '');
}

