import type { ImageField, TextField } from '@sitecore-content-sdk/nextjs';

import { unwrapSitecoreImageField } from 'components/media/mediaUtils';
import { isRichTextEffectivelyEmpty } from 'components/rich-text/richTextUtils';
import { extractMediaTileBrightcoveId } from 'components/media-tile/mediaTileUtils';
import { hasVisibleImageField, hasVisibleTextField } from 'components/text-aside/textAsideUtils';
import type { IVideoFields } from '../../utils/interface';
import type { MediaBoxFields, MediaBoxParamValueShape } from './MediaBox.type';

export const MEDIA_BOX_EMPTY_HINT = 'Media Box' as const;

export const MEDIA_BOX_SECTION_FALLBACK = 'Content Block' as const;

export const MEDIA_BOX_LINK_ARIA_FALLBACK = 'Link' as const;

/**
 * Accessibility label for the Media Box Link field CTA (text, description, then fallback).
 *
 * @param fields - Resolved Media Box datasource fields.
 */
export function resolveMediaBoxLinkAriaLabel(fields: MediaBoxFields): string {
  const text = fields.Link?.value?.text;
  const desc = fields.Link?.value?.description;
  const t = typeof text === 'string' ? text.trim() : '';
  if (t) return t;
  const d = typeof desc === 'string' ? desc.trim() : '';
  if (d) return d;
  return MEDIA_BOX_LINK_ARIA_FALLBACK;
}

export const MEDIA_BOX_VIDEO_EMPTY_HINT = 'Video' as const;

export const MEDIA_BOX_MEDIA_PLACEHOLDER = 'Media' as const;

/** `aria-label` for rail image when Content Options opens an enlarged image in a dialog. */
export const MEDIA_BOX_IMAGE_MODAL_ARIA_FALLBACK = 'View larger image' as const;

/** Visitor CTA when `MediaType` is Video with Brightcove id (text beside circle-play). */
export const MEDIA_BOX_WATCH_THE_VIDEO = 'Watch the video' as const;

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
 * Merges layout `rendering.params` / `rendering.parameters` with props `params`
 * so droplist values (e.g. Theme) are not lost when the placeholder passes a thin `params` object.
 */
export function mergeMediaBoxRenderingParams(
  rendering: unknown,
  params: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...sitecoreRenderingParamRecord(rendering) };
  assignDefinedParams(out, params);
  return out;
}

/**
 * @param param - Raw Sitecore rendering parameter.
 * @returns String value or undefined.
 */
export function getMediaBoxParamValue(
  param: MediaBoxParamValueShape | string | { value?: unknown } | undefined | null,
): string | undefined {
  if (param == null) return undefined;
  if (typeof param === 'string') return param;
  if (typeof param !== 'object') return undefined;
  const o = param as Record<string, unknown>;
  if ('value' in o && (typeof o.value === 'string' || typeof o.value === 'number')) {
    return String(o.value);
  }
  const nested = o.Value as { value?: unknown } | undefined;
  if (nested != null && typeof nested === 'object' && nested.value != null) {
    const nv = nested.value;
    if (typeof nv === 'string' || typeof nv === 'number') return String(nv);
  }
  return undefined;
}

export type MediaBoxThemeKey = 'light' | 'dark';

/**
 * Normalizes Theme rendering param to light or dark.
 */
export function resolveMediaBoxThemeKey(mergedParams: Record<string, unknown>): MediaBoxThemeKey {
  const raw = getMediaBoxParamValue(
    mergedParams.Theme as MediaBoxParamValueShape | string | undefined,
  )
    ?.trim()
    .toLowerCase();
  return raw === 'dark' ? 'dark' : 'light';
}

/**
 * Optional data attribute value for ContentOptions (e.g. Downloadable) — hooks for future styling.
 */
export function resolveMediaBoxContentOptionsDataValue(
  mergedParams: Record<string, unknown>,
): string | undefined {
  const v = getMediaBoxParamValue(
    mergedParams.ContentOptions as MediaBoxParamValueShape | string | undefined,
  )?.trim();
  return v && v.length > 0 ? v : undefined;
}

export function mediaBoxContentOptionsIsModal(mergedParams: Record<string, unknown>): boolean {
  const raw = getMediaBoxParamValue(
    mergedParams.ContentOptions as MediaBoxParamValueShape | string | undefined,
  )
    ?.trim()
    .toLowerCase();
  return raw === 'modal' || raw === 'model';
}

/**
 * Accessible name for the image-enlarge control (image alt, then heading, then fallback).
 *
 * @param fields - Media Box fields (heading fallback).
 * @param image - Image field shown in the rail / modal.
 */
export function resolveMediaBoxImageModalAriaLabel(
  fields: MediaBoxFields,
  image: ImageField | undefined,
): string {
  const alt = image?.value?.alt;
  const a = typeof alt === 'string' ? alt.trim() : '';
  if (a) return a;
  const h = fields.Heading?.value;
  const t = typeof h === 'string' ? h.trim() : '';
  if (t) return t;
  return MEDIA_BOX_IMAGE_MODAL_ARIA_FALLBACK;
}

function mediaBoxImageHasSrc(image: ImageField | undefined): boolean {
  const src = image?.value?.src;
  return typeof src === 'string' && src.trim().length > 0;
}

/**
 * Layout / Edge may use PascalCase (`Video`) or camelCase (`video`) on the same template.
 */
function coerceMediaBoxFieldKeys(fields: MediaBoxFields): MediaBoxFields {
  const r = fields as unknown as Record<string, unknown>;
  return {
    ...fields,
    Video: (fields.Video ?? r.video) as MediaBoxFields['Video'],
    MediaType: (fields.MediaType ?? r.mediaType) as MediaBoxFields['MediaType'],
    Thumbnail: (fields.Thumbnail ?? r.thumbnail) as ImageField | undefined,
    Media: (fields.Media ?? r.media) as ImageField | undefined,
    Image: (fields.Image ?? r.image) as ImageField | undefined,
    Heading: fields.Heading ?? (r.heading as MediaBoxFields['Heading']),
    Description: fields.Description ?? (r.description as MediaBoxFields['Description']),
    Link: fields.Link ?? (r.link as MediaBoxFields['Link']),
    data: fields.data ?? (r.data as MediaBoxFields['data']),
  };
}

/** Merges flat and GraphQL datasource fields (Pascal/camelCase + image jsonValue). */
export function resolveMediaBoxFields(fields: MediaBoxFields): MediaBoxFields {
  const base = coerceMediaBoxFieldKeys(fields);
  const ds = base.data?.datasource as
    | (Partial<MediaBoxFields> & Record<string, unknown>)
    | undefined;
  if (!ds) {
    return base;
  }

  let Video = base.Video;
  if (extractMediaTileBrightcoveId(Video) === undefined) {
    for (const candidate of [ds.Video, ds.video] as const) {
      if (
        candidate != null &&
        typeof candidate === 'object' &&
        extractMediaTileBrightcoveId(candidate as IVideoFields) !== undefined
      ) {
        Video = candidate as IVideoFields;
        break;
      }
    }
  }

  const MediaType =
    base.MediaType ??
    (ds.MediaType as MediaBoxFields['MediaType']) ??
    (ds.mediaType as MediaBoxFields['MediaType']);

  let Media = (unwrapSitecoreImageField(base.Media) ?? base.Media) as ImageField | undefined;
  if (!mediaBoxImageHasSrc(Media)) {
    const fromDs = unwrapSitecoreImageField(ds.Media) ?? unwrapSitecoreImageField(ds.media);
    if (mediaBoxImageHasSrc(fromDs)) {
      Media = fromDs;
    }
  }

  let Image = (unwrapSitecoreImageField(base.Image) ?? base.Image) as ImageField | undefined;
  if (!mediaBoxImageHasSrc(Image)) {
    const fromDs = unwrapSitecoreImageField(ds.Image) ?? unwrapSitecoreImageField(ds.image);
    if (mediaBoxImageHasSrc(fromDs)) {
      Image = fromDs;
    }
  }

  let Thumbnail = (unwrapSitecoreImageField(base.Thumbnail) ?? base.Thumbnail) as
    | ImageField
    | undefined;
  if (!mediaBoxImageHasSrc(Thumbnail)) {
    const fromDs =
      unwrapSitecoreImageField(ds.Thumbnail) ?? unwrapSitecoreImageField(ds.thumbnail);
    if (mediaBoxImageHasSrc(fromDs)) {
      Thumbnail = fromDs;
    }
  }

  return { ...base, Video, MediaType, Media, Image, Thumbnail };
}

/**
 * @returns Primary image field when Media/Image has a src.
 */
export function resolveMediaBoxPrimaryImageField(fields: MediaBoxFields): ImageField | undefined {
  const m = fields.Media ?? fields.Image;
  if (hasVisibleImageField(m)) return m;
  return undefined;
}

/**
 * Image shown when the text CTA opens the enlarged-image dialog (Content Options Modal, image mode).
 * Matches the main rail asset: primary when present, otherwise thumbnail-as-hero only.
 *
 * @param fields - Resolved Media Box fields.
 * @param mergedParams - Merged rendering params for {@link normalizeMediaBoxMediaType}.
 * @returns Field to pass to the shared modal opener, or undefined when there is no visitor rail image.
 */
export function resolveMediaBoxImageModalCtaImageField(
  fields: MediaBoxFields,
  mergedParams?: Record<string, unknown>,
): ImageField | undefined {
  const kind = normalizeMediaBoxMediaType(fields, mergedParams);
  if (kind !== 'image') return undefined;

  const primaryImage = resolveMediaBoxPrimaryImageField(fields);
  const thumbPrimaryOnly = mediaBoxThumbnailIsPrimaryOnly(fields);

  if (primaryImage && !thumbPrimaryOnly && hasVisibleImageField(primaryImage)) {
    return primaryImage;
  }
  if (thumbPrimaryOnly && hasVisibleImageField(fields.Thumbnail)) {
    return fields.Thumbnail;
  }
  return undefined;
}

/**
 * @returns True when datasource uses Thumbnail as the sole image (no separate primary).
 */
export function mediaBoxThumbnailIsPrimaryOnly(fields: MediaBoxFields): boolean {
  return !resolveMediaBoxPrimaryImageField(fields) && hasVisibleImageField(fields.Thumbnail);
}

/**
 * Walks `jsonValue` chains on droplist / droplink items (integrated GraphQL / Content SDK).
 */
function unwrapMediaBoxMediaTypeNode(mt: Record<string, unknown>): Record<string, unknown> {
  if (mt.jsonValue != null && typeof mt.jsonValue === 'object' && !Array.isArray(mt.jsonValue)) {
    return unwrapMediaBoxMediaTypeNode(mt.jsonValue as Record<string, unknown>);
  }
  return mt;
}

/**
 * Reads Video / Image label from a MediaType reference item (`fields` or `Fields`).
 */
function rawLabelFromMediaTypeItem(mt: Record<string, unknown> | undefined): string | undefined {
  if (!mt || typeof mt !== 'object') return undefined;
  const node = unwrapMediaBoxMediaTypeNode(mt);
  const mtFields = (node.fields ?? node.Fields) as Record<string, unknown> | undefined;
  let raw: unknown = (mtFields?.Value as { value?: unknown } | undefined)?.value;
  if (raw === undefined && mtFields != null) {
    raw = (mtFields.value as { value?: unknown } | undefined)?.value ?? mtFields.value;
  }
  if (raw === undefined) {
    raw = (node as { value?: unknown }).value;
  }
  if (raw === undefined) {
    raw = typeof node.name === 'string' ? node.name : node.displayName;
  }
  const s = raw === undefined || raw === null ? '' : String(raw).trim().toLowerCase();
  return s.length > 0 ? s : undefined;
}

/**
 * Normalizes MediaType droplink to video or image (default image).
 * Accepts nested `fields` / `Fields`, `fields.Value.value`, `jsonValue`, droplist `name` / `displayName`, plain string,
 * or — when the field is absent — rendering param `Format` (Video / Image).
 */
export function normalizeMediaBoxMediaType(
  fields: MediaBoxFields,
  mergedParams?: Record<string, unknown>,
): 'video' | 'image' {
  const mtUnknown = fields.MediaType as unknown;
  if (typeof mtUnknown === 'string' || typeof mtUnknown === 'number') {
    const s = String(mtUnknown).trim().toLowerCase();
    return s === 'video' ? 'video' : 'image';
  }

  const label = rawLabelFromMediaTypeItem(mtUnknown as Record<string, unknown> | undefined);
  if (label === 'video') return 'video';
  if (label === 'image') return 'image';
  if (label !== undefined) return 'image';

  const formatRaw =
    mergedParams != null ?
      getMediaBoxParamValue(mergedParams.Format as MediaBoxParamValueShape | string | undefined)
    : undefined;
  const f = formatRaw?.trim().toLowerCase();
  if (f === 'video') return 'video';
  if (f === 'image') return 'image';
  return 'image';
}

/**
 * True when the text CTA should use the “Watch the video” chrome (video mode + Brightcove id), including in XM Pages
 * where {@link MediaBoxVideoPlayProvider} does not expose modal context during editing.
 */
export function mediaBoxWatchVideoCtaChromeApplies(
  fields: MediaBoxFields,
  mergedParams?: Record<string, unknown>,
): boolean {
  if (normalizeMediaBoxMediaType(fields, mergedParams) !== 'video') return false;
  return extractMediaTileBrightcoveId(fields.Video ?? undefined) != null;
}

function hasVisibleLinkHref(fields: MediaBoxFields): boolean {
  const href = fields.Link?.value?.href;
  return typeof href === 'string' && href.trim() !== '';
}

/**
 * True when any visitor-visible content exists (preview mode).
 */
export function mediaBoxHasVisitorContent(
  fields: MediaBoxFields,
  mergedParams?: Record<string, unknown>,
): boolean {
  const hasText =
    hasVisibleTextField(fields.Heading as TextField | undefined) ||
    !isRichTextEffectivelyEmpty(fields.Description?.value?.toString());
  if (hasText || hasVisibleLinkHref(fields)) return true;

  const kind = normalizeMediaBoxMediaType(fields, mergedParams);
  if (kind === 'video') {
    if (extractMediaTileBrightcoveId(fields.Video) !== undefined) {
      return true;
    }
    /** Thumbnail-only rail when video id missing (visitor) still counts as visible media. */
    return hasVisibleImageField(fields.Thumbnail);
  }

  const primary = resolveMediaBoxPrimaryImageField(fields);
  if (hasVisibleImageField(primary)) return true;
  return hasVisibleImageField(fields.Thumbnail);
}

export const MEDIA_BOX_MEDIA_IMAGE_SIZES = '124px' as const;

export const MEDIA_BOX_MEDIA_THUMB_SIZES = '100px' as const;

/** Decode width cap for primary/hero images in the narrow rail (2× display for retina). */
export const MEDIA_BOX_MEDIA_IMAGE_CROP_WIDTH = 248 as const;

/** Decode width cap for secondary thumbnail. */
export const MEDIA_BOX_MEDIA_THUMB_CROP_WIDTH = 200 as const;

/** Design-reference thumbnail frame width (px); pairs with {@link MEDIA_BOX_THUMB_FRAME_HEIGHT}. */
export const MEDIA_BOX_THUMB_FRAME_WIDTH = 100 as const;

/** Design-reference thumbnail frame height (px); matches computed `height` on ref media element. */
export const MEDIA_BOX_THUMB_FRAME_HEIGHT = 77.25 as const;

