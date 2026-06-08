import type { Field } from '@sitecore-content-sdk/nextjs';

import { readFeaturedNewsParamValue } from 'components/featured-news/featuredNewsUtils';
import { normalizeMediaTileThemeKey } from 'components/media-tile/mediaTileUtils';
import type {
  CaseStudyListingsFieldNode,
  RelatedCaseStudiesFields,
  RelatedCaseStudyRow,
} from 'components/related-case-studies/RelatedCaseStudies.type';

export const RELATED_CASE_STUDIES_REGION_ARIA = 'Related case studies';

export const RELATED_CASE_STUDIES_EMPTY_DATASOURCE = 'Related Case Studies';

export const RELATED_CASE_STUDIES_EMPTY_LIST_EDITING_HINT =
  'Case study listings will appear here after configuration.';

/**
 * Card media URL: `Image` when set, otherwise `Video.CoverImage` (video rows without a poster fall back).
 *
 * @param row - Case study row
 */
export function getCaseStudyListingImageUrl(row: RelatedCaseStudyRow): string {
  const img = typeof row.Image === 'string' ? row.Image.trim() : '';
  if (img.length > 0) return img;
  const cover = row.Video != null && typeof row.Video === 'object' ? row.Video.CoverImage : undefined;
  return typeof cover === 'string' ? cover.trim() : '';
}

/** Responsive `sizes` hint for base-grid cards by column count. */
const BASE_IMAGE_SIZES_MAP: Readonly<Record<number, string>> = {
  2: '(max-width: 599px) 100vw, 50vw',
  3: '(max-width: 599px) 100vw, (max-width: 1023px) 50vw, 33vw',
  4: '(max-width: 599px) 100vw, (max-width: 1023px) 50vw, 25vw',
  5: '(max-width: 599px) 100vw, (max-width: 1023px) 50vw, 20vw',
};

/**
 * Parses `ItemCount` as the number of **columns** for the `CardSize` = **base** grid.
 * Valid range is **2–5**; out-of-range or non-integer values fall back to **3** (default).
 *
 * @param raw - `fields.ItemCount?.Value`
 */
export function parseRelatedCaseStudiesColumnCount(raw: string | undefined): number {
  const n = Number.parseInt(String(raw ?? '').trim(), 10);
  if (!Number.isFinite(n) || n < 2 || n > 5) return 3;
  return n;
}

/**
 * @param columns - Column count 2–5.
 * @returns `sizes` string for base-grid card images.
 */
export function resolveRelatedCaseStudiesBaseImageSizes(columns: number): string {
  const clamped = Math.min(Math.max(Math.round(columns), 2), 5);
  return BASE_IMAGE_SIZES_MAP[clamped] ?? BASE_IMAGE_SIZES_MAP[3]!;
}

/**
 * Unwraps `CaseStudyListings` whether Edge sends `{ value: [] }` or a bare array.
 *
 * @param node - Raw field node from layout
 */
export function extractCaseStudyListings(node: CaseStudyListingsFieldNode): RelatedCaseStudyRow[] {
  if (node == null) return [];
  if (Array.isArray(node)) {
    return node.filter((r): r is RelatedCaseStudyRow => r != null && typeof r === 'object');
  }
  const arr = node.value;
  if (!Array.isArray(arr)) return [];
  return arr.filter((r): r is RelatedCaseStudyRow => r != null && typeof r === 'object');
}

/**
 * Case study detail URL from a listing row (resolver may emit `Url` or camelCase `url`).
 *
 * @param row - Case study row
 */
export function getCaseStudyListingUrl(row: RelatedCaseStudyRow): string {
  if (typeof row.Url === 'string' && row.Url.trim()) return row.Url.trim();
  if (typeof row.url === 'string' && row.url.trim()) return row.url.trim();
  return '';
}

/**
 * Resolved display title: `Headline` preferred, then `Title`.
 *
 * @param row - Case study row
 */
export function getCaseStudyHeadlineText(row: RelatedCaseStudyRow): string {
  const h = typeof row.Headline === 'string' ? row.Headline.trim() : '';
  if (h.length > 0) return h;
  const t = typeof row.Title === 'string' ? row.Title.trim() : '';
  return t;
}

function readRecordString(obj: Record<string, unknown> | null | undefined, keys: readonly string[]): string {
  if (obj == null) return '';
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === 'string') {
      const t = v.trim();
      if (t.length > 0) return t;
    }
  }
  return '';
}

/** Parsed company link: href from `url` / `Url`, optional query string and `target`. */
interface ParsedCompanyLink {
  href: string;
  query: string;
  target?: string;
}

/**
 * Normalizes `Company.Link` (object, `{ value: { url } }`, or JSON string) into href + query + target.
 *
 * @param link - Raw `Company.Link` from layout
 */
function parseCompanyLinkNode(link: unknown): ParsedCompanyLink | null {
  if (link == null) return null;

  if (typeof link === 'string') {
    const s = link.trim();
    if (s.length === 0) return null;
    try {
      return parseCompanyLinkNode(JSON.parse(s) as unknown);
    } catch {
      return null;
    }
  }

  if (typeof link !== 'object') return null;
  const rec = link as Record<string, unknown>;
  const value = rec.value;
  if (value != null && typeof value === 'object') {
    const inner = parseCompanyLinkRecord(value as Record<string, unknown>);
    if (inner) return inner;
  }
  return parseCompanyLinkRecord(rec);
}

function parseCompanyLinkRecord(rec: Record<string, unknown>): ParsedCompanyLink | null {
  const href = readRecordString(rec, ['url', 'Url']);
  if (href.length === 0) return null;
  const query = readRecordString(rec, ['querystring', 'Querystring']);
  const targetRaw = readRecordString(rec, ['target', 'Target']);
  return { href, query, target: targetRaw.length > 0 ? targetRaw : undefined };
}

function companyHrefWithQuery(parsed: ParsedCompanyLink): string {
  const { href, query } = parsed;
  if (query.length === 0) return href;
  return `${href}${href.includes('?') ? '&' : '?'}${query}`;
}

/**
 * Company display name from a listing row (`Company.Name`).
 *
 * @param row - Case study row
 */
export function getCaseStudyCompanyNameText(row: RelatedCaseStudyRow): string {
  const n = row.Company?.Name;
  return typeof n === 'string' ? n.trim() : '';
}

/**
 * Company navigation URL for the company-name link. Resolution order:
 * 1. **`Company.Link`** — `url` / `Url` (plus `querystring`), or `value` wrapper / JSON string.
 * 2. **`Company.url`** / **`Company.Url`** when set on the company object.
 * 3. **`row.url`** / **`row.Url`** when `Company.Link` is empty (e.g. `{}`) but the listing row carries the path.
 *
 * @param row - Case study row
 */
export function getCaseStudyCompanyLinkUrl(row: RelatedCaseStudyRow): string {
  const company = row.Company;
  if (company == null) return '';

  const fromLink = parseCompanyLinkNode(company.Link);
  if (fromLink != null) return companyHrefWithQuery(fromLink);

  const topCamel = typeof company.url === 'string' ? company.url.trim() : '';
  if (topCamel.length > 0) return topCamel;
  const topPascal = typeof company.Url === 'string' ? company.Url.trim() : '';
  if (topPascal.length > 0) return topPascal;

  return getCaseStudyListingUrl(row);
}

/**
 * Link `target` from `Company.Link` when present (e.g. `_blank`).
 *
 * @param row - Case study row
 */
export function getCaseStudyCompanyLinkTarget(row: RelatedCaseStudyRow): string | undefined {
  const company = row.Company;
  if (company == null) return undefined;
  return parseCompanyLinkNode(company.Link)?.target;
}

/**
 * Parses `ItemCount` from the datasource field. When unset or invalid, returns `Number.MAX_SAFE_INTEGER`
 * so all available listings are shown. A valid positive integer is respected without an upper cap.
 *
 * @param raw - `fields.ItemCount?.Value`
 */
export function parseRelatedCaseStudiesMaxCount(raw: string | undefined): number {
  const n = Number.parseInt(String(raw ?? '').trim(), 10);
  if (!Number.isFinite(n) || n < 1) return Number.MAX_SAFE_INTEGER;
  return n;
}

/**
 * Reads datasource **Show Company** from layout (`{ value: boolean }` from `CaseStudiesContentResolver`).
 *
 * @param fields - Related Case Studies fields
 */
export function readRelatedCaseStudiesShowCompany(
  fields: RelatedCaseStudiesFields | null | undefined,
): boolean {
  if (fields == null) return false;
  const raw = fields.ShowCompany as unknown;
  if (typeof raw === 'boolean') return raw;
  if (raw != null && typeof raw === 'object') {
    const rec = raw as Record<string, unknown>;
    const v = rec.value ?? rec.Value;
    if (typeof v === 'boolean') return v;
    if (v === '1' || v === 'true' || v === 'True') return true;
    if (v === '0' || v === 'false' || v === 'False') return false;
  }
  return false;
}

/**
 * Stable React key when item ids are absent from resolver JSON.
 *
 * @param row - Case study row
 * @param index - Position in displayed slice
 */
export function relatedCaseStudyListingKey(row: RelatedCaseStudyRow, index: number): string {
  const company = getCaseStudyCompanyNameText(row);
  const title = getCaseStudyHeadlineText(row);
  const base = `${company}::${title}`.trim();
  if (base.length > 0) return base;
  return `related-case-study-${index}`;
}

/**
 * Whether the component should render visitor-visible body content.
 *
 * @param rows - Listing rows (already capped if desired)
 */
export function relatedCaseStudiesHasVisitorContent(rows: RelatedCaseStudyRow[]): boolean {
  if (rows.length === 0) return false;
  return rows.some((row) => {
    const company = getCaseStudyCompanyNameText(row).length > 0;
    const title = getCaseStudyHeadlineText(row).length > 0;
    const url = getCaseStudyListingUrl(row).length > 0;
    const companyUrl = getCaseStudyCompanyLinkUrl(row).length > 0;
    const summary = typeof row.Summary === 'string' && row.Summary.trim().length > 0;
    const media = getCaseStudyListingImageUrl(row).length > 0;
    return company || title || url || companyUrl || summary || media;
  });
}

export type RelatedCaseStudiesCardSizeKey = 'compact' | 'base';

/** CMS-driven layout flags for `ColorScheme` (Tailwind applied on JSX in `RelatedCaseStudies.tsx`). */
export type RelatedCaseStudiesColorSchemeLayout = {
  isDarkSurface: boolean;
  isGraySurface: boolean;
  isLegacyRailHeadline: boolean;
  isArticleRailHeadline: boolean;
  isCompactRailHeadline: boolean;
  isThemedRailHeadline: boolean;
  isArticleBaseHeadline: boolean;
  landingDescriptionBold: boolean;
};

/**
 * Reads surface band and headline palette flags from `ColorScheme` (no Tailwind strings).
 *
 * @param colorSchemeRaw - Raw `ColorScheme` rendering param.
 */
export function readRelatedCaseStudiesColorSchemeLayout(
  colorSchemeRaw: string | undefined,
): RelatedCaseStudiesColorSchemeLayout {
  const colorSchemeTrimmed = colorSchemeRaw != null ? String(colorSchemeRaw).trim() : '';
  const colorSchemeLower = colorSchemeTrimmed.toLowerCase();
  const isDarkSurface = colorSchemeLower === 'dark';
  const isGraySurface = colorSchemeLower === 'gray' || colorSchemeLower === 'grey';
  const isHeadlinePaletteColorScheme =
    colorSchemeTrimmed !== '' &&
    colorSchemeLower !== 'default' &&
    colorSchemeLower !== 'dark' &&
    colorSchemeLower !== 'gray' &&
    colorSchemeLower !== 'grey' &&
    colorSchemeLower !== 'light';
  const mediaTileThemeKey = normalizeMediaTileThemeKey(colorSchemeRaw);

  return {
    isDarkSurface,
    isGraySurface,
    isLegacyRailHeadline: !isHeadlinePaletteColorScheme,
    isArticleRailHeadline: isHeadlinePaletteColorScheme && mediaTileThemeKey === 'article',
    isCompactRailHeadline: isHeadlinePaletteColorScheme && mediaTileThemeKey === 'compact',
    isThemedRailHeadline:
      isHeadlinePaletteColorScheme &&
      mediaTileThemeKey !== 'article' &&
      mediaTileThemeKey !== 'compact',
    isArticleBaseHeadline: isHeadlinePaletteColorScheme && mediaTileThemeKey === 'article',
    landingDescriptionBold: isHeadlinePaletteColorScheme && mediaTileThemeKey === 'landing',
  };
}

/** Parses SXA `Styles` / `styles` rendering params into lowercase tokens (not Tailwind). */
export function parseRelatedCaseStudiesStyleTokenList(
  mergedParams: Record<string, unknown> | undefined,
): string[] {
  if (mergedParams == null) return [];
  const fromLower = typeof mergedParams.styles === 'string' ? mergedParams.styles : '';
  const fromUpperRaw = typeof mergedParams.Styles === 'string' ? mergedParams.Styles : '';
  const fromUpper = readFeaturedNewsParamValue(mergedParams, 'Styles') ?? '';
  return [fromLower, fromUpperRaw, fromUpper]
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .join(' ')
    .split(/\s+/)
    .map((token) => token.toLowerCase())
    .filter((token) => token.length > 0);
}

/**
 * Normalizes `CardSize` from merged params. **`compact`** (and unknown / empty) selects the rail layout;
 * **`base`** selects the standalone three-card grid with image tiles.
 *
 * @param mergedParams - Output of {@link mergeRelatedCaseStudiesRenderingParams}
 */
export function resolveRelatedCaseStudiesCardSizeKey(
  mergedParams: Record<string, unknown> | undefined,
): RelatedCaseStudiesCardSizeKey {
  const fromDroplist = readFeaturedNewsParamValue(mergedParams, 'CardSize')?.trim().toLowerCase();
  if (fromDroplist === 'base') return 'base';
  if (fromDroplist === 'compact') return 'compact';

  const block = mergedParams?.CardSize;
  if (block != null && typeof block === 'object' && !Array.isArray(block)) {
    const flat = (block as Record<string, unknown>).value;
    if (typeof flat === 'string') {
      const t = flat.trim().toLowerCase();
      if (t === 'base') return 'base';
      if (t === 'compact') return 'compact';
    }
  }

  return 'compact';
}

function sitecoreRenderingParamRecord(rendering: unknown): Record<string, unknown> {
  const r = rendering as Record<string, unknown> | null | undefined;
  if (r == null || typeof r !== 'object') return {};
  const out: Record<string, unknown> = {};
  for (const key of ['params', 'parameters'] as const) {
    const block = r[key];
    if (block != null && typeof block === 'object' && !Array.isArray(block)) {
      Object.assign(out, block as Record<string, unknown>);
    }
  }
  return out;
}

function assignDefinedParams(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const [k, v] of Object.entries(source)) {
    if (v !== undefined) {
      target[k] = v;
    }
  }
}

/**
 * Merges `rendering.params` / `rendering.parameters` with props `params` so placeholder-level keys
 * (e.g. `Description` RTE on the right column) are available when the layout service splits them.
 *
 * @param rendering - Current Sitecore rendering
 * @param params - Props `params` (wins on duplicate keys when defined)
 */
export function mergeRelatedCaseStudiesRenderingParams(
  rendering: unknown,
  params: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...sitecoreRenderingParamRecord(rendering) };
  assignDefinedParams(out, params);
  return out;
}

/**
 * Reads HTML for `Description` from merged rendering params — supports `{ value }` and `{ Value: { value } }`.
 *
 * @param params - Merged params record
 */
export function readRelatedCaseStudiesParamDescriptionHtml(
  params: Record<string, unknown> | undefined,
): string | undefined {
  if (params == null) return undefined;
  const block = params.Description;
  if (block == null || typeof block !== 'object') return undefined;
  const o = block as Record<string, unknown>;
  const nested = o.Value;
  let raw: unknown;
  if (nested != null && typeof nested === 'object' && !Array.isArray(nested)) {
    raw = (nested as { value?: unknown }).value;
  } else {
    raw = o.value;
  }
  if (raw === undefined || raw === null) return undefined;
  return String(raw);
}

function descriptionFieldTrimmed(field: Field<string> | undefined): string {
  if (field?.value == null) return '';
  return String(field.value).trim();
}

/**
 * RichText field for the rail description: non-empty datasource `Description` wins; otherwise HTML
 * from rendering `params.Description` (RTE stored on the placeholder / rendering root).
 *
 * @param fields - Datasource fields
 * @param mergedParams - Output of {@link mergeRelatedCaseStudiesRenderingParams}
 */
export function resolveRelatedCaseStudiesDescriptionField(
  fields: RelatedCaseStudiesFields,
  mergedParams: Record<string, unknown> | undefined,
): Field<string> | undefined {
  const fromDatasource = fields.Description;
  if (descriptionFieldTrimmed(fromDatasource).length > 0) {
    return fromDatasource;
  }
  const paramHtml = readRelatedCaseStudiesParamDescriptionHtml(mergedParams);
  if (paramHtml != null && paramHtml.trim().length > 0) {
    return { value: paramHtml };
  }
  return fromDatasource;
}
