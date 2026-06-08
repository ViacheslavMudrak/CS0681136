import type { OrderManagementTabFields, OrderManagementValueItem } from "./OrderManagement.type";
import {
  defaultLabelFromOrderStatusKey,
  fallbackApiOrderStatusFromStatusKey,
  normalizeCmsStatusKeyToFilterKey,
} from "@/lib/orderManagementUtils";

const asLoose = (tabFields: OrderManagementTabFields) => tabFields as unknown as Record<string, unknown>;

export function readLooseFilterLabel(
  tabFields: OrderManagementTabFields
): OrderManagementTabFields["FilterLabel"] | undefined {
  if (tabFields.FilterLabel?.value && String(tabFields.FilterLabel.value).trim()) {
    return tabFields.FilterLabel;
  }
  const loose = asLoose(tabFields);
  const cand = loose.filterLabel ?? loose.FilterLabel;
  if (cand && typeof cand === "object" && cand !== null && "value" in cand) {
    return cand as OrderManagementTabFields["FilterLabel"];
  }
  return undefined;
}

export function readLooseFilterOptions(tabFields: OrderManagementTabFields): OrderManagementValueItem[] | undefined {
  if (Array.isArray(tabFields.FilterOptions) && tabFields.FilterOptions.length > 0) {
    return tabFields.FilterOptions;
  }
  const loose = asLoose(tabFields);
  const cand = loose.filterOptions ?? loose.FilterOptions;
  if (Array.isArray(cand) && cand.length > 0) return cand as OrderManagementValueItem[];
  return undefined;
}

export function readLooseSearchPlaceholder(
  tabFields: OrderManagementTabFields
): OrderManagementTabFields["SearchPlaceholder"] | undefined {
  if (tabFields.SearchPlaceholder?.value && String(tabFields.SearchPlaceholder.value).trim()) {
    return tabFields.SearchPlaceholder;
  }
  const loose = asLoose(tabFields);
  const cand = loose.searchPlaceholder ?? loose.SearchPlaceholder;
  if (cand && typeof cand === "object" && cand !== null && "value" in cand) {
    return cand as OrderManagementTabFields["SearchPlaceholder"];
  }
  return undefined;
}

export function readLooseSearchAttributes(
  tabFields: OrderManagementTabFields
): OrderManagementTabFields["SearchAttribute"] | undefined {
  if (Array.isArray(tabFields.SearchAttribute) && tabFields.SearchAttribute.length > 0) {
    return tabFields.SearchAttribute;
  }
  const loose = asLoose(tabFields);
  const cand = loose.searchAttribute ?? loose.SearchAttribute;
  if (Array.isArray(cand) && cand.length > 0) return cand as OrderManagementTabFields["SearchAttribute"];
  return undefined;
}

export interface TabFilterLooseFallbacks {
  filterLabel: string;
  filterOptions: OrderManagementValueItem[];
}

/**
 * Merges canonical Sitecore tab fields with alternate casing (`filterLabel`, `filterOptions`, …)
 * and applies fallbacks when label/options are missing (Invoices / Quotes tabs).
 */
export function normalizeTabFilterFieldsWithLooseShape(
  tabFields: OrderManagementTabFields | undefined | null,
  fallbacks: TabFilterLooseFallbacks
): OrderManagementTabFields | undefined | null {
  if (!tabFields) return tabFields;

  const looseLabel = readLooseFilterLabel(tabFields);
  const looseOptions = readLooseFilterOptions(tabFields);
  const looseSearchPlaceholder = readLooseSearchPlaceholder(tabFields);
  const looseSearchAttributes = readLooseSearchAttributes(tabFields);

  const labelOk = Boolean(looseLabel?.value && String(looseLabel.value).trim());
  const optionsOk = Boolean(looseOptions && looseOptions.length > 0);
  const searchPlaceholderOk = Boolean(
    looseSearchPlaceholder?.value && String(looseSearchPlaceholder.value).trim()
  );
  const searchAttributesOk = Boolean(looseSearchAttributes && looseSearchAttributes.length > 0);

  const nextLabel = labelOk
    ? looseLabel!
    : ({ value: fallbacks.filterLabel } as OrderManagementTabFields["FilterLabel"]);
  const nextOptions = optionsOk ? looseOptions! : fallbacks.filterOptions;

  const canonicalLabelOk = Boolean(tabFields.FilterLabel?.value?.trim());
  const canonicalOptionsOk = Boolean(tabFields.FilterOptions?.length);
  const canonicalSearchPlaceholderOk = Boolean(tabFields.SearchPlaceholder?.value?.trim());
  const canonicalSearchAttributesOk = Boolean(tabFields.SearchAttribute?.length);

  if (
    canonicalLabelOk &&
    canonicalOptionsOk &&
    labelOk &&
    optionsOk &&
    (!searchPlaceholderOk || canonicalSearchPlaceholderOk) &&
    (!searchAttributesOk || canonicalSearchAttributesOk)
  ) {
    return tabFields;
  }

  return {
    ...tabFields,
    FilterLabel: nextLabel,
    FilterOptions: nextOptions,
    SearchPlaceholder: canonicalSearchPlaceholderOk
      ? tabFields.SearchPlaceholder
      : (looseSearchPlaceholder ?? tabFields.SearchPlaceholder),
    SearchAttribute: tabFields.SearchAttribute?.length
      ? tabFields.SearchAttribute
      : (looseSearchAttributes ?? tabFields.SearchAttribute),
  };
}

function normalizedCmsStatusKeys(opts: OrderManagementValueItem[]): Set<string> {
  const keys = new Set<string>();
  for (const opt of opts) {
    const cms = opt.fields?.Statuskey?.value ?? opt.fields?.StatusValue?.value;
    if (cms) keys.add(normalizeCmsStatusKeyToFilterKey(cms));
  }
  return keys;
}

/**
 * Preserves all CMS {@link OrderManagementTabFields.FilterOptions}. When list rows include a
 * `statusKey` not defined in CMS, appends synthetic options (`syntheticIdPrefix` + key).
 * If CMS defines no options, forces `FilterOptions: []` once rows exist (no fabricated CMS list).
 */
export function mergeTabFilterOptionsAppendUnknownStatuses<T extends { statusKey: string }>(
  tabFields: OrderManagementTabFields | undefined | null,
  rows: T[] | null,
  syntheticIdPrefix: string
): OrderManagementTabFields | undefined | null {
  if (!tabFields) return tabFields;
  if (rows === null) return tabFields;

  const cmsOpts = tabFields.FilterOptions ?? [];
  if (cmsOpts.length === 0) {
    if (rows.length === 0) return tabFields;
    return { ...tabFields, FilterOptions: [] };
  }

  if (rows.length === 0) return tabFields;

  const cmsKeys = normalizedCmsStatusKeys(cmsOpts);
  const synthetics: OrderManagementValueItem[] = [];
  for (const statusKey of new Set(rows.map((r) => r.statusKey).filter(Boolean))) {
    if (cmsKeys.has(statusKey)) continue;
    synthetics.push({
      id: `${syntheticIdPrefix}-${statusKey}`,
      displayName: defaultLabelFromOrderStatusKey(statusKey),
      fields: {
        Statuskey: { value: statusKey },
        StatusValue: { value: fallbackApiOrderStatusFromStatusKey(statusKey) },
      },
    });
  }
  synthetics.sort((a, b) =>
    String(a.fields?.Statuskey?.value ?? "").localeCompare(String(b.fields?.Statuskey?.value ?? ""))
  );
  if (synthetics.length === 0) return tabFields;
  return { ...tabFields, FilterOptions: [...cmsOpts, ...synthetics] };
}
