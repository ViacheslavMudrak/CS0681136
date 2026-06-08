import type {
  Field,
  ImageField,
  LinkField,
  TextField,
} from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from 'lib/component-props';

import { extractMediaTileBrightcoveId } from '../media-tile/mediaTileUtils';
import type { SitecoreValueItem } from '../media-tile/MediaTile.type';
import type { FocalPointType } from '../shared/ImageView/ImageViewTypes';
import type { IVideoFields } from '../../utils/interface';

/**
 * Integrated GraphQL / layout `data.datasource` node for Media (keys may be Pascal or camel case).
 */
export interface MediaFieldsDatasource {
  Image?: unknown;
  image?: unknown;
  Video?: unknown;
  video?: unknown;
  MediaType?: unknown;
  mediaType?: unknown;
  Format?: unknown;
  format?: unknown;
  Link?: unknown;
  MediaCaption?: unknown;
}

/** Datasource fields for the Media rendering (Image / Video). */
export interface MediaFields {
  Link?: LinkField;
  MediaType?: SitecoreValueItem;
  /** Video / modal trigger layout (Link, Button, Video, etc.) from datasource when not on rendering params. */
  Format?: SitecoreValueItem;
  /** Primary caption on the Media datasource. */
  MediaCaption?: Field<string> | TextField;
  /** Referenced Brightcove video item (global content). */
  Video?: IVideoFields | null;
  /** Image media, or optional video cover when Media type is Video. */
  Image?: ImageField;
  /** Present when the rendering uses an integrated query shape. */
  data?: {
    datasource?: MediaFieldsDatasource;
  };
}

export type MediaProps = ComponentProps & {
  fields?: MediaFields;
};

export type MediaLabels = {
  emptyHint: string;
  videoEmptyHint: string;
  imageEmptyHint: string;
  coverImageEmptyHint: string;
  playVideoFallback: string;
  videoAriaFallback: string;
  playerNotConfigured: string;
  linkAriaFallback: string;
};

export const MEDIA_LABELS: Readonly<MediaLabels> = {
  emptyHint: 'Media',
  videoEmptyHint: 'Video',
  imageEmptyHint: 'Image',
  coverImageEmptyHint: 'Cover image',
  playVideoFallback: 'Play video',
  videoAriaFallback: 'Video',
  playerNotConfigured: 'Video player is not configured.',
  linkAriaFallback: 'Link',
} as const;
const FOCAL_POINTS: readonly FocalPointType[] = [
  'center',
  'left-top',
  'right-top',
  'top',
  'left-bottom',
  'right-bottom',
  'bottom',
  'left',
  'right',
] as const;

const FOCAL_TO_OBJECT_POSITION: Record<FocalPointType, string> = {
  'left-top': 'left top',
  top: 'top',
  'right-top': 'right top',
  left: 'left',
  center: 'center',
  right: 'right',
  'left-bottom': 'left bottom',
  bottom: 'bottom',
  'right-bottom': 'right bottom',
};

/** Query param for deep-linked video modals (`?video=<slug>`). */
export const MEDIA_VIDEO_QUERY_KEY = 'video';

/** Modal `variant="media"` video frame sizes: 256×144 mobile, 720×405 md, 718×403.88 lg. */

/**
 * @param raw - Layout param (string or `{ Value: { value } }`).
 * @returns Normalized string or undefined.
 */
export function readMediaParamString(raw: unknown): string | undefined {
  if (typeof raw === 'string' && raw.trim() !== '') {
    return raw;
  }
  if (raw && typeof raw === 'object' && 'Value' in raw) {
    const inner = (raw as { Value?: { value?: unknown } }).Value?.value;
    if (typeof inner === 'string') return inner;
    if (inner !== undefined && inner !== null) return String(inner);
  }
  return undefined;
}

/**
 * True when Media Type droplist is Video.
 *
 * @param mediaType - Sitecore MediaType item field.
 */
export function isVideoMediaType(mediaType: MediaFields['MediaType']): boolean {
  const raw = mediaType?.fields?.Value?.value;
  const s = typeof raw === 'number' ? String(raw) : (raw ?? '');
  return s.trim().toLowerCase() === 'video';
}

/**
 * Slug for `?video=` deep links, derived from the video item title (CMS).
 *
 * @param title - Video Title field value.
 * @returns Kebab-case slug; empty when title is missing or only punctuation.
 */
export function titleToVideoSlug(title: string | undefined | null): string {
  if (!title) return '';
  return title
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * How video playback and triggers are presented for visitors.
 * Maps Sitecore **Format** (and **Play in modal**) for the Media rendering.
 */
export type MediaVideoPresentation =
  | 'inline'
  | 'modal-link'
  | 'modal-button'
  | 'modal-button-contrast'
  | 'modal-poster';

/**
 * Maps Format + play-in-modal to presentation mode. Captions render only for inline/poster video, not Link/Button CTAs.
 *
 * @param formatRaw - Format droplist value.
 * @param playInModal - Poster + modal when true for video format.
 */
export function resolveMediaVideoPresentation(
  formatRaw: string | undefined,
  playInModal: boolean,
): MediaVideoPresentation {
  const raw = (formatRaw ?? '').trim();
  const f = raw.toLowerCase();
  const compact = f.replace(/[^a-z0-9]/g, '');

  const isLink = f === 'link' || compact === 'link';
  const buttonMentioned = f.includes('button') || compact.includes('button');
  const hasContrast = f.includes('contrast') || compact.includes('contrast');
  const isButton =
    f === 'button' ||
    compact === 'button' ||
    compact.includes('customlabel') ||
    (buttonMentioned && (f.includes('custom') || compact.includes('custom')));

  if (isLink) return 'modal-link';

  if (buttonMentioned && hasContrast) return 'modal-button-contrast';
  if (isButton || buttonMentioned) return 'modal-button';

  if (playInModal) return 'modal-poster';

  return 'inline';
}

/**
 * @param datasourceImage - Media Image field.
 * @param video - Referenced video item.
 */
export function resolveMediaVideoCoverImage(
  datasourceImage: ImageField | undefined,
  video: IVideoFields | undefined,
): ImageField | undefined {
  const ds =
    unwrapSitecoreImageField(datasourceImage as unknown) ?? datasourceImage;
  const dsSrc = ds?.value?.src;
  if (typeof dsSrc === 'string' && dsSrc.trim() !== '') {
    return ds;
  }
  return (
    unwrapSitecoreImageField(video?.fields?.CoverImage as unknown) ??
    (video?.fields?.CoverImage as ImageField | undefined)
  );
}

/**
 * Normalizes focal point strings from CMS (e.g. "Center") to ImageView values.
 *
 * @param raw - FocalPoint param string.
 */
export function normalizeMediaFocalPoint(raw: string | undefined): FocalPointType | undefined {
  if (!raw) return undefined;
  const v = raw.trim().toLowerCase() as FocalPointType;
  return FOCAL_POINTS.includes(v) ? v : 'center';
}

/**
 * CSS `object-position` for intrinsic image layouts (aligned with {@link ImageView}).
 *
 * @param focal - Normalized focal point from rendering params.
 */
export function mediaFocalPointToObjectPosition(focal: FocalPointType | undefined): string {
  return FOCAL_TO_OBJECT_POSITION[focal ?? 'center'];
}

/**
 * Unwraps `jsonValue` envelopes and similar shapes from integrated GraphQL / layout payloads.
 *
 * @param raw - Raw image field node from Sitecore.
 */
export function unwrapSitecoreImageField(raw: unknown): ImageField | undefined {
  if (raw == null || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  if ('jsonValue' in o && o.jsonValue != null && typeof o.jsonValue === 'object') {
    return unwrapSitecoreImageField(o.jsonValue);
  }
  if ('value' in o) {
    return raw as ImageField;
  }
  return undefined;
}

function mediaImageFieldHasSrc(image: ImageField | undefined): boolean {
  const src = image?.value?.src;
  return typeof src === 'string' && src.trim().length > 0;
}

/** @param fields - Raw Media fields (flat or integrated GraphQL). */
export function resolveMediaLayoutFields(fields: MediaFields): MediaFields {
  const ds = fields.data?.datasource;

  let Image = unwrapSitecoreImageField(fields.Image) ?? fields.Image;
  if (!mediaImageFieldHasSrc(Image) && ds) {
    const fromDs =
      unwrapSitecoreImageField(ds.Image) ?? unwrapSitecoreImageField(ds.image);
    if (mediaImageFieldHasSrc(fromDs)) {
      Image = fromDs;
    }
  }

  let Video = fields.Video;
  if (!Video && ds) {
    const v = (ds.Video ?? ds.video) as unknown;
    if (v && typeof v === 'object' && 'fields' in (v as Record<string, unknown>)) {
      Video = v as IVideoFields;
    }
  }

  let MediaType = fields.MediaType;
  if (!MediaType && ds) {
    const m = ds.MediaType ?? ds.mediaType;
    if (m && typeof m === 'object') {
      MediaType = m as MediaFields['MediaType'];
    }
  }

  let Format = fields.Format;
  if (!Format && ds) {
    const rawFmt = ds.Format ?? ds.format;
    if (rawFmt && typeof rawFmt === 'object') {
      const o = rawFmt as Record<string, unknown>;
      if ('jsonValue' in o && o.jsonValue && typeof o.jsonValue === 'object') {
        Format = o.jsonValue as SitecoreValueItem;
      } else if ('fields' in o) {
        Format = rawFmt as SitecoreValueItem;
      }
    }
  }

  return { ...fields, Image, Video, MediaType, Format };
}

/**
 * Reads the Media **Format** droplist from resolved datasource fields (carousel items, embedded media).
 *
 * @param fields - Fields after {@link resolveMediaLayoutFields}.
 * @returns Trimmed format string for {@link resolveMediaVideoPresentation}, or undefined.
 */
export function readMediaFormatFromResolvedFields(fields: MediaFields): string | undefined {
  const item = fields.Format;
  if (!item) return undefined;
  const raw = item.fields?.Value?.value;
  if (typeof raw === 'string') {
    const s = raw.trim();
    return s === '' ? undefined : s;
  }
  if (raw !== undefined && raw !== null) {
    const s = String(raw).trim();
    return s === '' ? undefined : s;
  }
  return undefined;
}

/**
 * Parses Object fit param to ImageView `objectFit`.
 *
 * @param raw - ObjectFit param string.
 */
export function normalizeMediaObjectFit(raw: string | undefined): 'cover' | 'contain' | undefined {
  const v = (raw ?? '').trim().toLowerCase();
  if (v === 'cover' || v === 'contain') return v;
  return undefined;
}

/**
 * Parses Region param for caption chrome.
 *
 * @param raw - Region param string.
 */
export function normalizeMediaRegion(raw: string | undefined): 'aside' | 'default' | undefined {
  const v = (raw ?? '').trim().toLowerCase();
  if (v === 'aside') return 'aside';
  if (v === 'default') return 'default';
  return undefined;
}

/**
 * Whether Play in modal is enabled from rendering params.
 * Accepts plain strings and Sitecore `{ Value: { value: "1" } }` shapes.
 *
 * @param raw - PlayInModel / PlayInModal param.
 */
export function readPlayInModal(raw: unknown): boolean {
  const s = readMediaParamString(raw);
  if (s !== undefined) {
    const v = s.trim().toLowerCase();
    return v === '1' || v === 'true' || v === 'yes';
  }
  if (raw === true || raw === 1) return true;
  return false;
}

/**
 * Whether the section should use dark background styling from params.
 * Accepts plain strings and Sitecore `{ Value: { value: "1" } }` shapes.
 *
 * @param raw - HasDarkBackground param.
 */
export function readHasDarkBackground(raw: unknown): boolean {
  const s = readMediaParamString(raw);
  if (s !== undefined) {
    const v = s.trim().toLowerCase();
    return v === '1' || v === 'true' || v === 'yes';
  }
  if (raw === true || raw === 1) return true;
  return false;
}

/** Brightcove inline/modal behavior after merging `Playback` param with video item fields. */
export interface MediaPlaybackOptions {
  autoplay: boolean;
  loop: boolean;
}

/**
 * Merges Sitecore **Playback** rendering param with the video item’s Autoplay/Loop.
 * When `playbackParamRaw` is empty, returns the video item values only.
 *
 * Recognized substrings (case-insensitive): `autoplay` → autoplay on; `manual`, `click to play`,
 * `pause`, `paused` → autoplay off; `loop` → loop on; `no loop` / `noloop` → loop off.
 *
 * @param playbackParamRaw - Raw Playback param (may be nested in `Value`).
 * @param videoAutoplay - Video content item Autoplay field.
 * @param videoLoop - Video content item Loop field.
 */
export function resolveMediaPlaybackOptions(
  playbackParamRaw: string | undefined,
  videoAutoplay: boolean,
  videoLoop: boolean,
): MediaPlaybackOptions {
  const raw = (playbackParamRaw ?? '').trim().toLowerCase();
  if (!raw) {
    return { autoplay: videoAutoplay, loop: videoLoop };
  }

  let autoplay = videoAutoplay;
  let loop = videoLoop;

  const noLoop = raw.includes('no loop') || raw.includes('noloop');
  if (raw.includes('loop') && !noLoop) {
    loop = true;
  }
  if (noLoop) {
    loop = false;
  }

  if (raw.includes('autoplay')) {
    autoplay = true;
  }
  if (
    raw.includes('manual') ||
    raw.includes('click to play') ||
    raw.includes('clicktoplay') ||
    raw === 'pause' ||
    raw.includes('paused')
  ) {
    autoplay = false;
  }

  return { autoplay, loop };
}
/**
 * Parses Sitecore image width/height (often strings in layout JSON) for layout math.
 *
 * @param image - Image field from layout.
 */
export function parseMediaImageDimensions(
  image: ImageField | undefined,
): { width: number; height: number } | null {
  const w = image?.value?.width;
  const h = image?.value?.height;
  const nw = typeof w === 'string' ? parseFloat(w) : Number(w);
  const nh = typeof h === 'string' ? parseFloat(h) : Number(h);
  if (!Number.isFinite(nw) || !Number.isFinite(nh) || nw <= 0 || nh <= 0) {
    return null;
  }
  return { width: nw, height: nh };
}

/** Layout fallback when Sitecore omits width/height but `src` is present (NextImage needs numeric dimensions). */
const MEDIA_IMAGE_DIMENSION_FALLBACK = { width: 1200, height: 675 } as const;

/** @param image - Sitecore image field; falls back to 16:9 when src exists without dimensions. */
export function parseMediaImageDimensionsWithFallback(
  image: ImageField | undefined,
): { width: number; height: number } | null {
  const parsed = parseMediaImageDimensions(image);
  if (parsed) return parsed;
  const src = image?.value?.src;
  if (typeof src === 'string' && src.trim() !== '') {
    return { ...MEDIA_IMAGE_DIMENSION_FALLBACK };
  }
  return null;
}

function readSitecoreNumericField(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/**
 * Reads optional Width/Height from a video item (Pascal or camel) for aspect-ratio framing.
 *
 * @param video - Brightcove video content item from layout/GraphQL.
 */
export function parseVideoItemDimensions(
  video: IVideoFields | undefined,
): { width: number; height: number } | null {
  const f = video?.fields as
    | (IVideoFields['fields'] & {
        width?: { value?: unknown };
        height?: { value?: unknown };
        VideoWidth?: { value?: unknown };
        VideoHeight?: { value?: unknown };
      })
    | undefined;
  if (!f) return null;
  const w = readSitecoreNumericField(
    f.Width?.value ?? f.width?.value ?? f.VideoWidth?.value,
  );
  const h = readSitecoreNumericField(
    f.Height?.value ?? f.height?.value ?? f.VideoHeight?.value,
  );
  if (w === null || h === null) return null;
  return { width: w, height: h };
}

/**
 * CSS `aspect-ratio` style from video item dimensions when present.
 *
 * @param video - Video item with optional Width/Height.
 */
export function mediaVideoAspectBoxStyle(
  video: IVideoFields | undefined,
): { aspectRatio: string } | undefined {
  const dims = parseVideoItemDimensions(video);
  if (!dims) return undefined;
  return { aspectRatio: `${dims.width} / ${dims.height}` };
}

/** @param image - Image field with width/height for aspect-ratio box. */
export function mediaImageAspectBoxStyle(
  image: ImageField | undefined,
): { aspectRatio: string } | undefined {
  const dims = parseMediaImageDimensionsWithFallback(image);
  if (!dims) return undefined;
  return { aspectRatio: `${dims.width} / ${dims.height}` };
}

/**
 * Non-empty trimmed string check for scalar field values.
 *
 * @param value - Field value.
 */
export function hasNonEmptyText(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  return String(value).trim().length > 0;
}

/**
 * Derives anchor accessibility and security props from a Sitecore Link field.
 *
 * @param link - Sitecore link field (may be undefined in optional UI).
 * @param ariaFallback - Used when link text and description are both empty.
 * @returns `aria-label`, optional `target`, and `rel` when opening in a new tab.
 */
export function getCmsLinkAnchorProps(
  link: LinkField | undefined,
  ariaFallback: string,
): {
  'aria-label': string;
  target?: string;
  rel?: string;
} {
  const text =
    typeof link?.value?.text === 'string' && link.value.text.trim() !== ''
      ? link.value.text.trim()
      : typeof link?.value?.description === 'string' && link.value.description.trim() !== ''
        ? link.value.description.trim()
        : '';
  const rawTarget = link?.value?.target;
  const target = typeof rawTarget === 'string' && rawTarget !== '' ? rawTarget : undefined;
  return {
    'aria-label': text || ariaFallback,
    target,
    rel: target === '_blank' ? 'noopener noreferrer' : undefined,
  };
}

/**
 * Visitor-visible media after {@link resolveMediaLayoutFields} (image src or Brightcove id).
 *
 * @param fields - Resolved Media datasource fields.
 * @param isEditing - XM Cloud Pages editing mode.
 */
export function mediaHasVisitorContent(fields: MediaFields | undefined, isEditing: boolean): boolean {
  if (!fields) return isEditing;
  if (isEditing) return true;
  if (isVideoMediaType(fields.MediaType)) {
    return Boolean(extractMediaTileBrightcoveId(fields.Video));
  }
  return mediaImageFieldHasSrc(unwrapSitecoreImageField(fields.Image) ?? fields.Image);
}

