import type {
  Field,
  ImageField,
  LinkField,
  TextField,
} from "@sitecore-content-sdk/nextjs";

import type { ComponentProps } from "lib/component-props";

export const LOCATION_LIST_EMPTY_HINT = "Location List";

export const LOCATION_LIST_INTRO_NAV_ARIA = "Location quick links";

export const LOCATION_LIST_MAP_LINK_FALLBACK_ARIA =
  "Open map for this location";

export const LOCATION_LIST_CARD_REGION_FALLBACK_ARIA = "Location";

export const LOCATION_LIST_LABEL_TEL = "Tel:";

export const LOCATION_LIST_LABEL_FAX = "Fax:";

export const LOCATION_LIST_LABEL_TOLL_FREE = "Toll Free:";

/** Reference item for `LocationType` droplist from Edge / layout. */
export interface LocationListLocationTypeRef {
  id?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Value?: TextField;
  };
}

export interface LocationListChildFields {
  Locality?: TextField;
  Region?: TextField;
  PostalCode?: TextField;
  LocationType?: LocationListLocationTypeRef;
  CompanyName?: TextField;
  NavTitle?: TextField;
  NavValue?: TextField;
  FeaturedImage?: ImageField;
  StreetAddress?: TextField;
  Country?: TextField;
  Telephone?: TextField;
  Fax?: TextField;
  TollFree?: TextField;
  MapURL?: LinkField;
  Order?: Field<number>;
  FullAddress?: Field<string>;
}

export interface LocationListChildItem {
  id: string;
  displayName?: string;
  fields?: LocationListChildFields;
}

export interface LocationListFields {
  Locations?: LocationListChildItem[] | null;
}

export type LocationListProps = ComponentProps & {
  fields: LocationListFields | null | undefined;
};

export type LocationListSectionKey =
  | "Headquarters"
  | "United States"
  | "Global Assembly Centers"
  | "other";

export interface LocationListIntroLink {
  anchorId: string;
  label: string;
}

export interface LocationListIntroGroup {
  sectionKey: LocationListSectionKey;
  sectionHeading: string;
  links: LocationListIntroLink[];
}

/** Canonical section order for intro links and body sections. */
export const LOCATION_LIST_SECTION_ORDER: readonly LocationListSectionKey[] = [
  "Headquarters",
  "United States",
  "Global Assembly Centers",
  "other",
] as const;

const SECTION_HEADING: Record<
  Exclude<LocationListSectionKey, "other">,
  string
> = {
  Headquarters: "Headquarters",
  "United States": "United States",
  "Global Assembly Centers": "Global Assembly Centers",
};

/**
 * Converts `NavTitle` to an in-page hash slug (e.g. `new-orleans`).
 * Compact CMS tokens are lowercased as-is; author punctuation is kebab-cased.
 *
 * @param raw - `NavTitle` field value
 */
export function locationListNavTitleToAnchorSlug(
  raw: string | number | null | undefined,
): string {
  const t = trimTextValue(raw);
  if (!t) {
    return "";
  }
  if (!/\s/u.test(t) && !/[,()]/u.test(t)) {
    return t.toLowerCase();
  }
  return t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Returns a stable DOM id for a location card anchor target.
 * Prefers `NavValue` (CMS navigation slug); falls back to `NavTitle` slug, then item id.
 *
 * @param item - Location list child item
 */
export function locationListCardAnchorId(item: LocationListChildItem): string {
  const fromNavValue = locationListNavTitleToAnchorSlug(
    item.fields?.NavValue?.value,
  );
  if (fromNavValue) {
    return fromNavValue;
  }
  const fromNavTitle = locationListNavTitleToAnchorSlug(
    item.fields?.NavTitle?.value,
  );
  if (fromNavTitle) {
    return fromNavTitle;
  }
  return `location-${String(item.id).toLowerCase()}`;
}

/**
 * Trims a Sitecore single-line text value for visitor display logic.
 */
export function trimTextValue(
  value: string | number | null | undefined,
): string {
  if (value == null) {
    return "";
  }
  return String(value).trim();
}

/**
 * Builds one visitor-facing postal block from card fields: street line, then locality / region / postal
 * (space-separated on one line, no punctuation), then country — each logical line separated by `\n` for a
 * single `whitespace-pre-line` container.
 *
 * @param fields - Location card fields (optional)
 * @returns Joined lines, or empty string when nothing to show
 */
export function buildLocationCardAddressPlainText(
  fields: LocationListChildFields | undefined,
): string {
  const f = fields ?? {};
  const lines: string[] = [];

  const street = trimTextValue(f.StreetAddress?.value);
  if (street) {
    lines.push(street);
  }

  const locality = trimTextValue(f.Locality?.value);
  const region = trimTextValue(f.Region?.value);
  const postal = trimTextValue(f.PostalCode?.value);
  const regionPostal = [region, postal].filter(Boolean).join(" ");
  const mid = [locality, regionPostal].filter(Boolean).join(" ");
  if (mid) {
    lines.push(mid);
  }

  const country = trimTextValue(f.Country?.value);
  if (country) {
    lines.push(country);
  }

  return lines.join("\n");
}

/**
 * Resolves the location type label from a reference droplist item.
 */
export function resolveLocationTypeLabel(
  locationType: LocationListLocationTypeRef | undefined,
): string {
  if (!locationType || typeof locationType !== "object") {
    return "";
  }
  const fromValue = trimTextValue(locationType.fields?.Value?.value);
  if (fromValue) {
    return fromValue;
  }
  return (
    trimTextValue(locationType.displayName) || trimTextValue(locationType.name)
  );
}

/**
 * Maps a CMS location type label to a canonical section bucket.
 *
 * @param label - Raw type label from Sitecore
 */
export function canonicalLocationSectionKey(
  label: string,
): LocationListSectionKey {
  const lower = label.toLowerCase();
  if (lower.includes("headquarters")) {
    return "Headquarters";
  }
  if (lower.includes("united states")) {
    return "United States";
  }
  if (lower.includes("global assembly")) {
    return "Global Assembly Centers";
  }
  if (!label.trim()) {
    return "other";
  }
  return "other";
}

/**
 * Human-readable nav label from `NavTitle` (supports slug-style values).
 *
 * @param raw - `NavTitle` field value
 */
export function formatLocationNavTitleForDisplay(
  raw: string | number | null | undefined,
): string {
  const t = trimTextValue(raw);
  if (!t) {
    return "";
  }
  return t
    .split(/[-_\s]+/u)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Intro-nav link text from `NavTitle`: matches live intralox.com — copy with spaces, commas, or
 * parentheses is shown verbatim (e.g. `Americas (New Orleans)`, `Grand Rapids, MI`). Compact
 * tokens (`grand-rapids`, `brazil`) use {@link formatLocationNavTitleForDisplay}.
 *
 * @param raw - `NavTitle` field value
 */
export function formatLocationNavTitleForIntroNav(
  raw: string | number | null | undefined,
): string {
  const t = trimTextValue(raw);
  if (!t) {
    return "";
  }
  if (/\s/u.test(t) || /[,()]/u.test(t)) {
    return t;
  }
  return formatLocationNavTitleForDisplay(t);
}

/**
 * Reads numeric `Order` from layout / Edge (`value` or nested `Value.value`).
 *
 * @param order - Sitecore number field node
 */
export function readLocationListOrderNumber(
  order: LocationListChildFields["Order"] | undefined,
): number | null {
  if (order == null || typeof order !== "object") {
    return null;
  }
  const o = order as unknown as Record<string, unknown>;
  const coerce = (v: unknown): number | null => {
    if (v == null) {
      return null;
    }
    const n = typeof v === "string" ? Number.parseFloat(v.trim()) : Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const direct = coerce(o.value);
  if (direct != null) {
    return direct;
  }
  const nested = o.Value as { value?: unknown } | undefined;
  if (nested != null && typeof nested === "object") {
    return coerce(nested.value);
  }
  return null;
}

/**
 * Reads configured grid column count from rendering parameters (1–4, default 3).
 *
 * @param params - Sitecore rendering params (may nest `Value` like SXA droplists)
 */
export function readLocationListColumnCount(
  params: Record<string, unknown>,
): number {
  const tryScalar = (v: unknown): string => {
    if (v == null) {
      return "";
    }
    if (typeof v === "object" && v !== null && "Value" in v) {
      const inner = (v as { Value?: { value?: unknown } }).Value?.value;
      return inner == null ? "" : String(inner).trim();
    }
    return String(v).trim();
  };

  const raw =
    tryScalar(params.Columns) ||
    tryScalar(params.NumberOfColumns) ||
    tryScalar(params.GridColumns) ||
    "3";
  const n = Number.parseInt(raw, 10);
  if (Number.isFinite(n) && n >= 1 && n <= 4) {
    return n;
  }
  return 3;
}

function sortByOrder(
  a: LocationListChildItem,
  b: LocationListChildItem,
): number {
  const ao = readLocationListOrderNumber(a.fields?.Order);
  const bo = readLocationListOrderNumber(b.fields?.Order);
  const aOk = ao != null;
  const bOk = bo != null;
  if (aOk && bOk) {
    return ao - bo;
  }
  if (aOk) {
    return -1;
  }
  if (bOk) {
    return 1;
  }
  return 0;
}

/**
 * Groups location items by canonical section and sorts by `Order` within each group.
 *
 * @param items - Raw `Locations` array from the datasource
 * @param isEditing - When true, include items missing a type so authors can fix them
 */
export function groupLocationListItemsBySection(
  items: LocationListChildItem[] | null | undefined,
  isEditing: boolean,
): Map<LocationListSectionKey, LocationListChildItem[]> {
  const map = new Map<LocationListSectionKey, LocationListChildItem[]>();
  for (const key of LOCATION_LIST_SECTION_ORDER) {
    map.set(key, []);
  }

  const list = Array.isArray(items) ? items.filter((row) => row?.fields) : [];

  for (const item of list) {
    const typeLabel = resolveLocationTypeLabel(item.fields?.LocationType);
    const key = canonicalLocationSectionKey(typeLabel);
    if (key === "other" && !isEditing && !typeLabel) {
      continue;
    }
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
  }

  // for (const [k, arr] of map) {
  //   if (!arr.length) {
  //     continue;
  //   }
  //   map.set(
  //     k,
  //     [...arr].sort((a, b) => {
  //       const o = sortByOrder(a, b);
  //       if (o !== 0) {
  //         return o;
  //       }
  //       return String(a.displayName ?? a.id).localeCompare(String(b.displayName ?? b.id));
  //     }),
  //   );
  // }

  return map;
}

export type LocationListIntroSectionKey = Exclude<
  LocationListSectionKey,
  "other"
>;

/**
 * Visitor-facing intro-nav label from `NavTitle` (author copy or slug-friendly formatting).
 *
 * @param _sectionKey - Section bucket (not `other`); reserved for future section-specific labels
 * @param item - Location list child item
 */
export function locationListIntroLinkLabel(
  _sectionKey: LocationListIntroSectionKey,
  item: LocationListChildItem,
): string {
  const f = item.fields ?? {};
  const nav = formatLocationNavTitleForIntroNav(f.NavTitle?.value);
  const company = trimTextValue(f.CompanyName?.value);
  const display = trimTextValue(item.displayName);
  return nav || company || display;
}

/**
 * Builds intro nav groups (ordered) with anchor ids and display labels.
 *
 * @param grouped - Output of {@link groupLocationListItemsBySection}
 */
export function buildLocationListIntroGroups(
  grouped: Map<LocationListSectionKey, LocationListChildItem[]>,
): LocationListIntroGroup[] {
  const out: LocationListIntroGroup[] = [];

  for (const sectionKey of LOCATION_LIST_SECTION_ORDER) {
    if (sectionKey === "other") {
      continue;
    }
    const items = grouped.get(sectionKey) ?? [];
    const links = items
      .map((item) => {
        const label = locationListIntroLinkLabel(sectionKey, item);
        if (!label) {
          return null;
        }
        return {
          anchorId: locationListCardAnchorId(item),
          label,
        };
      })
      .filter((x): x is { anchorId: string; label: string } => x != null);

    if (!links.length) {
      continue;
    }

    out.push({
      sectionKey,
      sectionHeading: SECTION_HEADING[sectionKey],
      links,
    });
  }

  return out;
}

/**
 * Visitor-visible section title for a canonical section key.
 */
export function locationListSectionTitle(
  sectionKey: LocationListSectionKey,
): string {
  if (sectionKey === "other") {
    return "Other locations";
  }
  return SECTION_HEADING[sectionKey];
}

/**
 * DOM id for a section heading (safe for `id` attribute — no spaces).
 */
export function locationListSectionDomId(
  sectionKey: LocationListSectionKey,
): string {
  return `location-section-${sectionKey.replace(/\s+/g, "-").toLowerCase()}`;
}
