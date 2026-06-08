import type { ImageField, TextField } from '@sitecore-content-sdk/nextjs';

export const BANNER_EMPTY_HINT = 'Banner';
export const BANNER_SECTION_ARIA_FALLBACK = 'Page banner';

/** Fixed banner image band height (`background-size: cover` region). */
export const BANNER_IMAGE_HEIGHT_PX = 256;
/** Bottom strip height (px); keep in sync with `.banner-strip` in `Banner.tsx`. */
export const BANNER_SCRIM_HEIGHT_PX = 90;
/** Max width for title column inside scrim / solid bar. */
export const BANNER_TITLE_MAX_WIDTH_PX = 1200;
export const BANNER_TITLE_INNER_PADDING_X_PX = 16;
export const BANNER_TITLE_TEXT_MAX_WIDTH_PX = 1168;
export const BANNER_TITLE_TEXT_TABLET_MAX_WIDTH_PX = 768;
/** Inner text line box max width for large tablet / iPad Pro (992–1199); see `banner.scss`. */
export const BANNER_TITLE_TEXT_LARGE_TABLET_MAX_WIDTH_PX = 992;
export const BANNER_TITLE_TEXT_HEIGHT_PX = 37.5;

/**
 * Whether the rendering requests the page image layer (`ShowImage` or legacy `hasBanner`).
 *
 * @param params - Rendering parameters from layout service
 * @returns True when image should be shown if a valid src exists
 */
export function isShowImageParamOn(params: Record<string, unknown>): boolean {
  const raw = params.ShowImage ?? params.hasBanner;
  return raw === '1' || String(raw).toLowerCase() === 'true';
}

/**
 * @param field - Sitecore text field
 * @returns True when trimmed display text is non-empty
 */
export function trimmedTitleHasContent(field: TextField | undefined): boolean {
  const v = field?.value;
  if (v === undefined || v === null) return false;
  return String(v).trim().length > 0;
}

/**
 * @param field - Sitecore image field
 * @returns True when `src` is a non-empty string
 */
export function imageFieldHasSrc(field: ImageField | undefined): boolean {
  const src = field?.value?.src;
  return typeof src === 'string' && src.trim().length > 0;
}

/**
 * Resolves title from component fields or route fields (page item).
 *
 * @param fields - Optional rendering fields
 * @param routeFields - `page.layout.sitecore.route.fields`
 */
export function resolveTitleField(
  fields: { Title?: TextField } | null | undefined,
  routeFields: { Title?: TextField } | undefined,
): TextField | undefined {
  return fields?.Title ?? routeFields?.Title;
}

/**
 * Resolves image from component fields or route fields (page item).
 *
 * @param fields - Optional rendering fields
 * @param routeFields - `page.layout.sitecore.route.fields`
 */
export function resolveImageField(
  fields: { Image?: ImageField } | null | undefined,
  routeFields: { Image?: ImageField } | undefined,
): ImageField | undefined {
  return fields?.Image ?? routeFields?.Image;
}

/**
 * Parses numeric dimensions from the image field for NextImage.
 *
 * @param field - Sitecore image field
 * @param fallbackW - Width fallback
 * @param fallbackH - Height fallback
 */
export function parseBannerImageDimensions(
  field: ImageField | undefined,
  fallbackW: number,
  fallbackH: number,
): { width: number; height: number } {
  const w = Number(field?.value?.width);
  const h = Number(field?.value?.height);
  const width = Number.isFinite(w) && w > 0 ? Math.round(w) : fallbackW;
  const height = Number.isFinite(h) && h > 0 ? Math.round(h) : fallbackH;
  return { width, height };
}

/**
 * Whether a visitor should see any banner chrome (title text and/or photo).
 *
 * @param showImageParam - Rendering flag for image
 * @param hasImageSrc - Route/component image has src
 * @param hasTitle - Trimmed title non-empty
 */
export function visitorBannerHasContent(
  showImageParam: boolean,
  hasImageSrc: boolean,
  hasTitle: boolean,
): boolean {
  if (hasTitle) return true;
  if (showImageParam && hasImageSrc) return true;
  return false;
}
