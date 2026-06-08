import type { ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import { readLinkGroupParamValue } from 'components/link-group/linkGroupUtils';
import { normalizeMediaTileThemeKey } from 'components/media-tile/mediaTileUtils';
import type { MediaTileHeadlineThemeKey } from 'components/media-tile/MediaTile.type';

import type {
  ArticleListingsFieldNode,
  FeaturedNewsArticleRow,
  FeaturedNewsFields,
} from './FeaturedNews.type';

export const FEATURED_NEWS_REGION_ARIA = 'Featured news';

export const FEATURED_NEWS_EMPTY_DATASOURCE = 'Featured News';

/** Accessible name for hero thumbnail link when title and category are absent. */
export const FEATURED_NEWS_HERO_THUMB_LINK_FALLBACK_ARIA = 'News article';

export const FEATURED_NEWS_LIST_FALLBACK_ARIA = 'More news';

/** Empty-state hint when editing and the first article slot has no resolver rows yet. */
export const FEATURED_NEWS_EMPTY_LISTINGS_EDITING_HINT =
  'Article listings will appear here after configuration.';

/** Parsed General Link JSON shape from FeaturedNewsContentResolver `ViewAllLink.value`. */
interface ViewAllLinkJson {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
  target?: string;
  querystring?: string;
}

/**
 * Reads a rendering param (e.g. `ColorScheme`, `CardSize`) using the same layout shapes as Link Group.
 */
export function readFeaturedNewsParamValue(
  params: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  return readLinkGroupParamValue(params, key);
}

function stripHtmlToPlain(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Normalizes summary/description for plain-text display (resolver may return HTML).
 *
 * @param raw - Summary string from article row
 */
export function stripFeaturedNewsSummaryHtml(raw: string | undefined | null): string {
  if (raw == null || raw === '') return '';
  return stripHtmlToPlain(String(raw));
}

function trimNonEmpty(s: string | undefined | null): s is string {
  return typeof s === 'string' && s.trim().length > 0;
}

/**
 * Hero / thumbnail URL: hero image, else video cover when present.
 *
 * @param row - Article listing row
 */
export function resolveArticleThumbnailUrl(row: FeaturedNewsArticleRow): string | undefined {
  if (trimNonEmpty(row.Image)) return row.Image!.trim();
  const cover = row.Video?.CoverImage;
  if (trimNonEmpty(cover)) return cover!.trim();
  return undefined;
}

/**
 * Unwraps `ArticleListings` whether Edge sends `{ value: [] }` or a bare array.
 *
 * @param node - Raw field node from layout
 */
export function extractArticleListings(node: ArticleListingsFieldNode): FeaturedNewsArticleRow[] {
  if (node == null) return [];
  if (Array.isArray(node)) {
    return node.filter((r): r is FeaturedNewsArticleRow => r != null && typeof r === 'object');
  }
  const arr = node.value;
  if (!Array.isArray(arr)) return [];
  return arr.filter((r): r is FeaturedNewsArticleRow => r != null && typeof r === 'object');
}

/**
 * Parses `ViewAllLink.value` JSON string into a Content SDK `LinkField`.
 *
 * @param field - `fields.ViewAllLink` from layout
 */
export function parseViewAllLinkField(field: FeaturedNewsFields['ViewAllLink']): LinkField | undefined {
  const raw = field?.value;
  if (typeof raw !== 'string' || raw.trim() === '') return undefined;
  let parsed: ViewAllLinkJson;
  try {
    parsed = JSON.parse(raw) as ViewAllLinkJson;
  } catch {
    return undefined;
  }
  const href = typeof parsed.url === 'string' ? parsed.url.trim() : '';
  if (!href) return undefined;
  const text =
    (typeof parsed.name === 'string' && parsed.name.trim()) ||
    (typeof parsed.displayName === 'string' && parsed.displayName.trim()) ||
    undefined;
  const target = typeof parsed.target === 'string' && parsed.target.trim() ? parsed.target.trim() : undefined;
  const query = typeof parsed.querystring === 'string' && parsed.querystring.trim() ? parsed.querystring.trim() : '';
  const hrefWithQs = query ? `${href}${href.includes('?') ? '&' : '?'}${query}` : href;

  return {
    value: {
      href: hrefWithQs,
      text: text ?? hrefWithQs,
      title: typeof parsed.displayName === 'string' ? parsed.displayName : undefined,
      target,
      id: typeof parsed.id === 'string' ? parsed.id : undefined,
    },
  };
}

/**
 * Builds a minimal `ImageField` for `NextImage` from an absolute media URL string.
 *
 * @param src - Resolved thumbnail URL
 * @param alt - Alt text (from title when image has no CMS alt)
 */
export function imageFieldFromUrl(src: string, alt: string): ImageField {
  return {
    value: {
      src,
      alt: alt.trim() || undefined,
    },
  };
}

/**
 * Article detail URL from a listing row. Resolver emits `Url`; Experience Edge /
 * layout JSON often surfaces the same value as camelCase `url`.
 *
 * @param row - Article row from `ArticleListings`
 */
export function getArticleListingUrl(row: FeaturedNewsArticleRow): string {
  if (typeof row.Url === 'string' && row.Url.trim()) return row.Url.trim();
  if (typeof row.url === 'string' && row.url.trim()) return row.url.trim();
  return '';
}

/**
 * Stable React key for listing rows when Sitecore does not emit item id.
 *
 * @param row - Article row
 * @param index - Position in full listings array (not role-based)
 */
export function featuredNewsListingKey(row: FeaturedNewsArticleRow, index: number): string {
  const t = typeof row.Title === 'string' ? row.Title : '';
  const d = typeof row.PostDate === 'string' ? row.PostDate : '';
  const base = `${d}::${t}`.trim();
  if (base.length > 0) return base;
  return `featured-news-row-${index}`;
}

export function featuredNewsHasVisitorContent(listings: FeaturedNewsArticleRow[]): boolean {
  if (listings.length === 0) return false;
  return listings.some((row) => {
    const title = typeof row.Title === 'string' && row.Title.trim().length > 0;
    const summary = stripFeaturedNewsSummaryHtml(row.Summary).length > 0;
    const img = Boolean(resolveArticleThumbnailUrl(row));
    const type = typeof row.ArticleType === 'string' && row.ArticleType.trim().length > 0;
    const date = typeof row.PostDate === 'string' && row.PostDate.trim().length > 0 && !row.HideDate;
    const url = getArticleListingUrl(row).length > 0;
    return title || summary || img || type || date || url;
  });
}

/**
 * Normalizes the Sitecore `Theme` rendering param for Featured News (same tokens as Media Tile).
 *
 * @param raw - Raw `Theme` from merged params (e.g. `Article`, `Landing Page`, `Compact`).
 */
export function normalizeFeaturedNewsThemeKey(raw: string | undefined): MediaTileHeadlineThemeKey {
  return normalizeMediaTileThemeKey(raw);
}

export type FeaturedNewsCardSizeKey = 'sm' | 'lg' | 'default';

/**
 * @param cardSizeRaw - `CardSize` rendering param
 */
export function resolveFeaturedNewsCardSizeKey(
  cardSizeRaw: string | undefined,
): FeaturedNewsCardSizeKey {
  const v = cardSizeRaw?.toLowerCase().trim();
  if (v === 'sm' || v === 'small') return 'sm';
  if (v === 'lg' || v === 'large') return 'lg';
  return 'default';
}

