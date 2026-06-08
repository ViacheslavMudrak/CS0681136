import type { QuickLinkCardType } from '../quick-link/QuickLink.type';
import { readNestedParamValue } from '../quick-link/quickLinkUtils';
import type { QuickLinkGroupCountField } from './QuickLinkGroup.type';

export type QuickLinkGroupColumnCount = 2 | 3 | 4;

/** Sitecore `Styles` token for press-inquiries aside modifier (not a CSS class). */
export const QUICK_LINK_GROUP_STYLE_TOKEN_ASIDE_PRESS_INQUIRIES =
  'press-inquiries-aside' as const;

/** Authoring / accessibility chrome for Quick Link Group (not primary visitor copy). */
export const QUICK_LINK_GROUP_LABELS = {
  emptyDatasource: 'Quick Link Group',
  emptyList: 'No quick links configured',
  sectionAria: 'Quick links',
  asideFallbackAria: 'Supplementary information',
  linkListRegionAria: 'Supplementary links',
  caseStudiesRailRegionAria: 'Case studies',
  learnMoreFallback: 'Learn More',
} as const;

export const QUICK_LINK_GROUP_SIDEBAR_DIVIDER_TEST_ID =
  'quick-link-group-sidebar-divider' as const;

/**
 * @param value - Raw single-line field value.
 * @returns `true` when trimmed text is non-empty (visitor-visible copy).
 */
export function hasPlainTextVisitorValue(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

/**
 * @param html - Raw RTE HTML from Sitecore.
 * @returns `true` when visible text remains after stripping markup and `&nbsp;` entities.
 */
export function hasRichTextVisitorValue(html: string | undefined): boolean {
  if (html == null) return false;
  const trimmed = html.trim();
  if (!trimmed) return false;
  const text = trimmed
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>\s*<p>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 0;
}

/**
 * @param visibleItemCount - Count after visitor-content filter.
 * @param isEditing - XM Cloud Pages edit mode.
 * @param headlineValue - Optional headline plain text.
 * @param descriptionHtml - Optional description RTE HTML.
 * @returns `true` when the aside-only layout should render instead of the tile list.
 */
export function shouldShowQuickLinkGroupAsideLayout(
  visibleItemCount: number,
  isEditing: boolean,
  headlineValue: string | undefined,
  descriptionHtml: string | undefined,
): boolean {
  if (visibleItemCount > 0) return false;
  if (isEditing) return true;
  return (
    hasPlainTextVisitorValue(headlineValue) ||
    hasRichTextVisitorValue(descriptionHtml)
  );
}

/**
 * Whether ListofLinks **sidebar-column** tiles use the **Questions?** rail link palette instead of
 * the blue case-study row anchor for **Downloads**.
 *
 * @param sidebarColumnLayout - True when the group uses ListofLinks + base card rail layout.
 * @param headlinePlain - Group `Headline` field plain text.
 */
export function resolveContactRailLinkTone(
  sidebarColumnLayout: boolean,
  headlinePlain: string | undefined,
): boolean {
  return sidebarColumnLayout && /question/i.test(String(headlinePlain ?? ''));
}

/**
 * Reads `QuickLinkCount` reference `fields.Value` and maps to a supported column count.
 *
 * @param countField - Sitecore `QuickLinkCount` field from the group datasource.
 * @returns `2`, `3`, or `4`; defaults to `3` when unset or invalid.
 */
export function resolveQuickLinkGroupColumnCount(
  countField: QuickLinkGroupCountField | undefined,
): QuickLinkGroupColumnCount {
  const raw = countField?.fields?.Value?.value;
  const n = parseInt(String(raw ?? '').trim(), 10);
  if (n === 2 || n === 3 || n === 4) return n;
  return 3;
}

/**
 * Normalizes `Styles` / `styles` rendering params into lowercase tokens.
 *
 * @param params - Merged Quick Link Group rendering params.
 */
/**
 * **QuickLinkItems** + **ListofLinks** on **base**: vertical Case Studies → rule → Downloads.
 */
export function shouldShowQuickLinkGroupStackedSidebarRail(
  usedQuickLinkItems: boolean,
  showSupplementaryLinkList: boolean,
  cardType: QuickLinkCardType,
): boolean {
  return usedQuickLinkItems && showSupplementaryLinkList && cardType === 'base';
}

/** Parses SXA `Styles` / `styles` rendering params into lowercase tokens (not Tailwind). */
export function parseQuickLinkGroupStyleTokenList(
  params: Record<string, unknown> | undefined,
): string[] {
  const fromNested =
    readNestedParamValue(params, 'Styles') ??
    readNestedParamValue(params, 'styles');
  const fromFlatString =
    typeof params?.Styles === 'string'
      ? params.Styles.trim()
      : typeof params?.styles === 'string'
        ? params.styles.trim()
        : '';
  const raw = fromNested || fromFlatString;
  if (!raw) return [];
  return raw
    .toLowerCase()
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}
