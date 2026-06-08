import type { Field, ImageField, TextField } from '@sitecore-content-sdk/nextjs';
import type { IVideoFields } from '../../utils/interface';
import { extractMediaTileBrightcoveId } from '../media-tile/mediaTileUtils';
import { isRichTextEffectivelyEmpty } from '../rich-text/richTextUtils';
import type {
  TextAndAsideFields,
  TextAndAsideLayoutFields,
  TextAndAsideParams,
  TextAsideGraphqlDatasource,
  TextAsideParamValue,
} from './TextAndAside.type';
export const TEXT_ASIDE_EMPTY_HINT = 'Text and aside';

/** CMS background param → surface token (Tailwind on JSX). */
export type TextAsideBackgroundSurface =
  | 'surface'
  | 'surface-muted-light'
  | 'surface-muted'
  | 'surface-inverse'
  | 'surface-strong'
  | 'surface-panel'
  | 'accent-teal';

/**
 * Reads `BackgroundColor` rendering param (no Tailwind strings).
 *
 * @param raw - Trimmed or raw background param value.
 */
export function readTextAsideBackgroundSurface(
  raw: string | undefined,
): TextAsideBackgroundSurface {
  if (!raw) return 'surface';

  const v = raw.toLowerCase().replace(/\s+/g, ' ').trim();
  if (v === 'none' || v === 'default' || v === 'white') {
    return 'surface';
  }
  if (v.includes('lighter') && (v.includes('gray') || v.includes('grey'))) {
    return 'surface-muted-light';
  }
  if (v.includes('light gray') || v.includes('light grey')) {
    return 'surface-muted';
  }
  if (v.includes('dark gray') || v.includes('dark grey') || v.includes('charcoal')) {
    return 'surface-inverse';
  }
  if (v.includes('gray') || v.includes('grey')) {
    return 'surface-muted';
  }
  if (v.includes('black')) {
    return 'surface-strong';
  }
  if (v.includes('submenu')) {
    return 'surface-panel';
  }
  if (v.includes('light blue') || v === 'blue' || v.includes('teal')) {
    return 'accent-teal';
  }

  return 'surface';
}

/**
 * @param fields - Raw Text and Aside fields
 * @returns True when payload uses integrated GraphQL `data` envelope
 */
function isTextAsideGraphQlEnvelope(fields: TextAndAsideFields): boolean {
  return 'data' in fields && fields.data != null;
}

/**
 * @param root - Field from flat layout
 * @param node - Optional GraphQL `{ jsonValue }` node
 * @returns Datasource value when set, otherwise root
 */
function mergeJsonField<T>(root: T | undefined, node: { jsonValue?: T } | undefined): T | undefined {
  const jv = node?.jsonValue;
  if (jv !== undefined && jv !== null) return jv;
  return root;
}

/**
 * @param root - Full raw fields including optional `data`
 * @param ds - Datasource node or undefined when only flat fields are used
 * @returns Flat fields without `data`
 */
function mergeTextAsideDatasource(
  root: TextAndAsideFields,
  ds: TextAsideGraphqlDatasource | undefined
): TextAndAsideLayoutFields {
  if (!ds) {
    const { data: _omit, ...rest } = root;
    return rest;
  }
  return {
    Title: mergeJsonField(root.Title, ds.title ?? ds.Title),
    Description: mergeJsonField(root.Description, ds.description ?? ds.Description),
    MediaCaption: mergeJsonField(root.MediaCaption, ds.mediaCaption ?? ds.MediaCaption),
    MediaType: mergeJsonField(root.MediaType, ds.mediaType ?? ds.MediaType),
    Image: mergeJsonField(root.Image, ds.image ?? ds.Image),
    Video: mergeJsonField(root.Video, ds.video ?? ds.Video),
    HasTextContentPlaceholder: mergeJsonField(
      root.HasTextContentPlaceholder,
      ds.hasTextContentPlaceholder ?? ds.HasTextContentPlaceholder
    ),
    HasAsideContentPlaceholder: mergeJsonField(
      root.HasAsideContentPlaceholder,
      ds.hasAsideContentPlaceholder ?? ds.HasAsideContentPlaceholder
    ),
  };
}

/**
 * Unwraps Edge / layout `Video` when it is still `{ jsonValue: { fields: { BrightcoveId }}}` or similar.
 */
export function normalizeTextAsideVideoField(
  raw: IVideoFields | null | undefined | unknown
): IVideoFields | null | undefined {
  if (raw == null) return undefined;
  if (typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const innerFields = o.fields as Record<string, unknown> | undefined;
  if (innerFields && typeof innerFields.BrightcoveId !== 'undefined') {
    return raw as IVideoFields;
  }
  if ('jsonValue' in o && o.jsonValue != null && typeof o.jsonValue === 'object') {
    return normalizeTextAsideVideoField(o.jsonValue);
  }
  return undefined;
}

export function resolveTextAndAsideLayoutFields(
  fields: TextAndAsideFields | undefined
): TextAndAsideLayoutFields | null {
  if (!fields) return null;
  if (isTextAsideGraphQlEnvelope(fields) && fields.data?.datasource == null) {
    return null;
  }
  const merged = mergeTextAsideDatasource(fields, fields.data?.datasource);
  const normalizedVideo =
    normalizeTextAsideVideoField(merged.Video) ?? (merged.Video as IVideoFields | undefined);
  return {
    ...merged,
    Video: normalizedVideo ?? merged.Video,
  };
}

const ASIDE_WIDTH_MAIN_FR = {
  '40%': '3fr',
  '50%': '1fr',
} as const;

const ASIDE_WIDTH_ASIDE_FR = {
  '40%': '2fr',
  '50%': '1fr',
} as const;
export function resolveTextAsideParamString(
  raw: TextAsideParamValue | string | undefined
): string | undefined {
  if (raw == null) return undefined;
  if (typeof raw === 'string') {
    const s = raw.trim();
    return s.length ? s : undefined;
  }
  const v = raw.Value?.value;
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}

export function resolveTextAsideDividerParam(
  params: Pick<TextAndAsideParams, 'Divider' | 'HasDivider'>
): string | undefined {
  const fromDivider = resolveTextAsideParamString(params.Divider);
  if (fromDivider !== undefined) return fromDivider;
  const h = params.HasDivider;
  if (h === undefined || h === null) return undefined;
  if (typeof h === 'boolean') {
    return h ? 'yes' : 'no';
  }
  if (typeof h === 'number') {
    return String(h).trim() || undefined;
  }
  if (typeof h === 'string') {
    const s = h.trim();
    return s.length ? s : undefined;
  }
  return resolveTextAsideParamString(h as TextAsideParamValue);
}

export function isTextAsidePreferLeft(raw: string | undefined): boolean {
  const v = (raw ?? '').toLowerCase();
  return !v.includes('right');
}

/**
 * @param raw - Aside width label from CMS (e.g. 40%, 40, 50%)
 * @returns Normalized 40% or 50% column ratio key
 */
export function normalizeAsideWidthLabel(raw: string | undefined): '40%' | '50%' {
  const n = (raw ?? '').trim().toLowerCase().replace(/\s+/g, '');
  if (n.includes('40')) return '40%';
  return '50%';
}

/**
 * @param raw - AsideWidth param (40% / 50%).
 * @returns Fr values for [main, aside] when aside is on the right.
 */
export function getTextAsideGridTemplateColumns(
  raw: string | undefined
): { mainFr: string; asideFr: string } {
  const key = normalizeAsideWidthLabel(raw);
  return {
    mainFr: ASIDE_WIDTH_MAIN_FR[key],
    asideFr: ASIDE_WIDTH_ASIDE_FR[key],
  };
}

/**
 * @param raw - Divider dropdown value
 * @returns True when a vertical rule should show between columns
 */
export function isTextAsideDividerEnabled(raw: string | undefined): boolean {
  if (!raw) return false;
  const v = raw.toLowerCase().trim();
  if (v === 'none' || v === 'no' || v === 'false' || v === 'off' || v === '0') return false;
  if (v === '1') return true;
  return (
    v.includes('yes') ||
    v.includes('show') ||
    v.includes('true') ||
    v.includes('on') ||
    v.includes('divider')
  );
}

/**
 * @param field - Rich text field
 * @returns True when HTML-stripped content has visible text
 */
export function hasVisibleRichText(field: Field<string> | undefined): boolean {
  const val = field?.value;
  if (val === undefined || val === null) return false;
  return !isRichTextEffectivelyEmpty(String(val));
}

/**
 * @param field - Single-line text field
 * @returns True when trimmed string value is non-empty
 */
export function hasVisibleTextField(field: TextField | undefined): boolean {
  const val = field?.value;
  if (val === undefined || val === null) return false;
  return String(val).trim().length > 0;
}

/**
 * @param image - Sitecore image field
 * @returns True when a non-empty image src is present
 */
export function hasVisibleImageField(image: ImageField | undefined): boolean {
  const src = image?.value?.src;
  return typeof src === 'string' && src.trim().length > 0;
}

/**
 * @param video - Referenced video item with Brightcove id
 * @returns True when Brightcove id is non-empty
 */
export function hasVisibleVideoReference(video: IVideoFields | null | undefined | unknown): boolean {
  const normalized = normalizeTextAsideVideoField(video);
  const candidate = normalized ?? (video as IVideoFields | null | undefined);
  return extractMediaTileBrightcoveId(candidate) !== undefined;
}

export interface TextAsideMediaChoice {
  showImage: boolean;
  showVideo: boolean;
}

/** Preview: render text placeholder instead of Title/Description when datasource flag is set. */
export function shouldTextAsidePreferTextPlaceholderOverFields(
  showTextPlaceholder: boolean,
  isEditing: boolean
): boolean {
  return showTextPlaceholder && !isEditing;
}

/** Preview: render aside placeholder instead of image/video/caption when datasource flag is set. */
export function shouldTextAsidePreferAsidePlaceholderOverFields(
  showAsidePlaceholder: boolean,
  isEditing: boolean
): boolean {
  return showAsidePlaceholder && !isEditing;
}

/**
 * @returns True when {@link TextAndAsideAside} renders non-null (must match its early-exit condition).
 */
export function shouldRenderTextAsideAsideContent(
  fields: TextAndAsideLayoutFields,
  media: TextAsideMediaChoice,
  showAsidePlaceholder: boolean,
  isEditing: boolean
): boolean {
  const suppressAsideFields = shouldTextAsidePreferAsidePlaceholderOverFields(
    showAsidePlaceholder,
    isEditing
  );
  const showImageBlock =
    !suppressAsideFields &&
    media.showImage &&
    (hasVisibleImageField(fields.Image) || isEditing);
  const showVideoBlock =
    !suppressAsideFields &&
    media.showVideo &&
    (hasVisibleVideoReference(fields.Video) || isEditing);
  return !(!showImageBlock && !showVideoBlock && !showAsidePlaceholder && !isEditing);
}

/**
 * Media Type from CMS may be a plain {@link Field} or a droplink item with `fields.Value.value` (see Media Tile).
 */
export function resolveTextAsideMediaTypeLabel(
  mediaType: Field<string> | null | undefined | unknown
): string {
  if (mediaType == null) return '';
  if (typeof mediaType === 'object' && mediaType !== null && 'value' in mediaType) {
    const v = (mediaType as Field<string>).value;
    if (v !== undefined && v !== null) return String(v).toLowerCase();
  }
  const nested = mediaType as { fields?: { Value?: { value?: unknown } } };
  const inner = nested?.fields?.Value?.value;
  if (inner !== undefined && inner !== null) return String(inner).toLowerCase();
  return '';
}

export function isTextAsidePlaceholderEnabled(field: Field<boolean> | undefined): boolean {
  if (field == null) return false;
  const v = field.value as unknown;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes' || s === 'on';
  }
  return false;
}

export function resolveTextAsideMediaVisibility(
  mediaType: Field<string> | null | undefined | unknown,
  image: ImageField | undefined,
  video: IVideoFields | null | undefined | unknown
): TextAsideMediaChoice {
  const resolvedVideo = normalizeTextAsideVideoField(video) ?? (video as IVideoFields | null | undefined);
  const hasImg = hasVisibleImageField(image);
  const hasVid = hasVisibleVideoReference(resolvedVideo);
  if (!hasImg && !hasVid) return { showImage: false, showVideo: false };

  const mt = resolveTextAsideMediaTypeLabel(mediaType);
  if (mt.includes('video')) {
    return { showImage: false, showVideo: hasVid };
  }
  if (mt.includes('image')) {
    return { showImage: hasImg, showVideo: false };
  }
  if (hasVid) return { showImage: false, showVideo: true };
  if (hasImg) return { showImage: true, showVideo: false };
  return { showImage: false, showVideo: false };
}

