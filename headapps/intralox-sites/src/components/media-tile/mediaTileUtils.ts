/**
 * Media Tile: param merging, aspect/surface resolution, field normalization, and preview helpers.
 * Tailwind classes belong on JSX only — no class maps or builders in this module.
 */
import type { CSSProperties } from 'react';

import type { Field } from '@sitecore-content-sdk/nextjs';

import {
  extractCalloutsFromDatasource,
  fieldFromGraphqlNode,
  normalizeCalloutItemsFieldShapes,
  normalizeCalloutsField,
  normalizeLinkFieldNode,
  calloutItemHasPreviewContent,
} from '../callout/calloutUtils';
import type { IVideoFields } from '../../utils/interface';

import type {
  MediaTileFields,
  MediaTileHeadlineThemeKey,
  MediaTileLayoutConfig,
  MediaTileMediaAspectKey,
  MediaTileParamValueShape,
  MediaTileSurfaceColor,
} from './MediaTile.type';

export const MEDIA_TILE_SPLIT_MAX_PX = 1200;

export const MEDIA_TILE_LANDSCAPE_FRAME_STYLE: CSSProperties = {
  aspectRatio: '560 / 371.84',
};

/**
 * Extracts a string value from a Sitecore rendering parameter.
 * Handles plain strings, `{ Value: { value } }`, and flat `{ value }` (Edge / layout variants).
 * @param param - Raw param from Sitecore layout JSON.
 * @returns The string value or undefined.
 */
export function getMediaTileParamValue(
  param: MediaTileParamValueShape | string | { value?: unknown } | undefined | null,
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

/**
 * Collects rendering parameters from `rendering.params` and, when present, `rendering.parameters`
 * (alternate Layout Service / host shapes). Later blocks overwrite earlier keys.
 */
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

/** Copies own keys from `source` onto `target`, skipping `undefined` (avoids wiping layout droplists). */
function assignDefinedParams(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const [k, v] of Object.entries(source)) {
    if (v !== undefined) {
      target[k] = v;
    }
  }
}

/**
 * Merges layout `rendering.params` / `rendering.parameters` with the `params` object passed to the component.
 * @param rendering - Layout component rendering (may carry full `params`)
 * @param params - Props from the renderer
 * @returns Merged parameter record.
 */
export function mergeMediaTileRenderingParams(
  rendering: unknown,
  params: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...sitecoreRenderingParamRecord(rendering) };
  assignDefinedParams(out, params);
  return out;
}

/**
 * Params for embedded Callout under Media Tile: removes `ColorScheme` / `colorscheme`.
 * @param params - Rendering params to clone and strip.
 * @returns Params without color-scheme keys.
 */
export function omitColorSchemeParamForEmbeddedCallout(
  params: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...params };
  delete next.ColorScheme;
  delete next.colorscheme;
  return next;
}

/** PascalCase + camelCase + kebab-case (e.g. `callout-direction`) for layout / Edge / GraphQL. */
function firstMediaTileCalloutParam(
  src: Record<string, unknown>,
  pascalKey: string,
  camelKey: string,
): string | undefined {
  const kebabKey = pascalKey.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  for (const key of [pascalKey, camelKey, kebabKey]) {
    const v = getMediaTileParamValue(src[key] as MediaTileParamValueShape | string | undefined);
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return undefined;
}

/**
 * When the Media Tile datasource uses `ButtonAlignment` (e.g. Center) but the rendering has no `TextAlign`,
 * maps that value onto params so the embedded Callout matches CTA alignment.
 */
export function mergeMediaTileButtonAlignmentIntoCalloutParams(
  params: Record<string, unknown>,
  fields: MediaTileFields | undefined,
): Record<string, unknown> {
  const fromCalloutAlign = firstMediaTileCalloutParam(params, 'CalloutTextAlign', 'calloutTextAlign');
  if (fromCalloutAlign != null && fromCalloutAlign !== '') {
    return params;
  }

  const fromParams =
    getMediaTileParamValue(params.TextAlign as MediaTileParamValueShape | string | undefined) ??
    getMediaTileParamValue(params.textAlign as MediaTileParamValueShape | string | undefined);
  if (fromParams != null && String(fromParams).trim() !== '') {
    return params;
  }

  const raw = fields?.ButtonAlignment?.fields?.Value?.value;
  const s = typeof raw === 'number' ? String(raw) : (raw ?? '');
  const v = s.trim().toLowerCase();
  if (v !== 'center' && v !== 'left') {
    return params;
  }

  const display = v === 'center' ? 'Center' : 'Left';
  return { ...params, TextAlign: { Value: { value: display } } };
}

function sitecoreDroplistParam(value: string): { Value: { value: string } } {
  return { Value: { value: value } };
}

function titleCaseDroplistToken(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (t === t.toUpperCase() && t.length <= 3) return t;
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

/** Media Tile rendering parameters → shared Callout param names. */
export const MEDIA_TILE_CALLOUT_PARAM_TO_CALLOUT_PARAM = {
  CalloutStyle: 'Style',
  CalloutDirection: 'Direction',
  CalloutTextSize: 'TextSize',
  CalloutTextAlign: 'TextAlign',
  CalloutColorScheme: 'ColorScheme',
} as const;

/**
 * Maps Media Tile–prefixed callout params onto Callout keys for embedded stats.
 */
export function mapMediaTilePrefixedCalloutParamsForEmbeddedCallout(
  paramsForEmbeddedCallout: Record<string, unknown>,
  fullMediaTileLayoutParams: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...paramsForEmbeddedCallout };
  const src = fullMediaTileLayoutParams;

  const calloutStyle = firstMediaTileCalloutParam(src, 'CalloutStyle', 'calloutStyle');
  if (calloutStyle != null && calloutStyle !== '') {
    out.Style = sitecoreDroplistParam(calloutStyle);
  } else {
    delete out.Style;
  }

  const calloutDirection = firstMediaTileCalloutParam(src, 'CalloutDirection', 'calloutDirection');
  if (calloutDirection != null && calloutDirection !== '') {
    out.Direction = sitecoreDroplistParam(titleCaseDroplistToken(calloutDirection));
  }

  const calloutTextSize = firstMediaTileCalloutParam(src, 'CalloutTextSize', 'calloutTextSize');
  if (calloutTextSize != null && calloutTextSize !== '') {
    const t = calloutTextSize;
    out.TextSize = sitecoreDroplistParam(t.length <= 3 && t === t.toUpperCase() ? t : titleCaseDroplistToken(t));
  }

  const calloutTextAlign = firstMediaTileCalloutParam(src, 'CalloutTextAlign', 'calloutTextAlign');
  if (calloutTextAlign != null && calloutTextAlign !== '') {
    out.TextAlign = sitecoreDroplistParam(titleCaseDroplistToken(calloutTextAlign));
  }

  const calloutColorScheme = firstMediaTileCalloutParam(
    src,
    'CalloutColorScheme',
    'calloutColorScheme',
  );
  if (calloutColorScheme != null && calloutColorScheme !== '') {
    out.ColorScheme = sitecoreDroplistParam(titleCaseDroplistToken(calloutColorScheme));
  }

  return out;
}

function normalizeMediaRatioKey(ratioRaw: string | undefined): string {
  return ratioRaw?.trim().replace(/\s+/g, '') ?? '';
}

/**
 * Resolves media aspect mode and optional inline frame style from `MediaRatio`.
 * @param ratioRaw - Raw MediaRatio param from Sitecore.
 */
export function resolveMediaTileMediaAspect(ratioRaw: string | undefined): {
  aspectKey: MediaTileMediaAspectKey;
  frameStyle: CSSProperties | null;
} {
  const key = normalizeMediaRatioKey(ratioRaw).toLowerCase();

  if (key === '1:1') {
    return { aspectKey: 'square', frameStyle: null };
  }
  if (key === '2:3' || key === '1.5') {
    return { aspectKey: 'portrait', frameStyle: null };
  }
  return { aspectKey: 'landscape', frameStyle: MEDIA_TILE_LANDSCAPE_FRAME_STYLE };
}

function normalizeMediaTileAspectRatio(
  aspectRatio: CSSProperties['aspectRatio'] | undefined,
): string {
  if (aspectRatio == null) return '';
  return String(aspectRatio).replace(/\s+/g, '');
}

/**
 * Whether the tile uses the default 560×371.84 landscape frame (not square/portrait Tailwind ratios).
 */
export function isMediaTileDefaultLandscapeFrame(
  mediaFrameStyle: CSSProperties | null | undefined,
  resolvedAspectStyle: CSSProperties | undefined,
): boolean {
  if (mediaFrameStyle === null) return false;
  if (mediaFrameStyle === undefined) return true;
  return (
    normalizeMediaTileAspectRatio(resolvedAspectStyle?.aspectRatio) ===
    normalizeMediaTileAspectRatio(MEDIA_TILE_LANDSCAPE_FRAME_STYLE.aspectRatio)
  );
}

/** Match `HasWhiteBackground` / `hasWhiteBackground` regardless of casing (layout / Edge JSON). */
const HAS_WHITE_BACKGROUND_PARAM_KEY_NORMALIZED = 'haswhitebackground';

function getHasWhiteBackgroundParamEntry(params: Record<string, unknown>): {
  raw: unknown;
  found: boolean;
} {
  for (const key of Object.keys(params)) {
    if (key.toLowerCase() === HAS_WHITE_BACKGROUND_PARAM_KEY_NORMALIZED) {
      return { raw: params[key], found: true };
    }
  }
  return { raw: undefined, found: false };
}

function isSitecoreCheckboxChecked(raw: unknown): boolean {
  const v =
    typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean'
      ? raw
      : getMediaTileParamValue(raw as MediaTileParamValueShape | string | undefined);
  if (v == null) return false;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  const s = String(v).trim().toLowerCase();
  if (s === '' || s === '0' || s === 'false' || s === 'no' || s === 'off') return false;
  if (s === '1' || s === 'true' || s === 'yes' || s === 'on') return true;
  return false;
}

/** Whether the tile should use a white full-bleed section instead of the default gray strip. */
export function resolveMediaTileHasWhiteBackground(params: Record<string, unknown>): boolean {
  const { raw, found } = getHasWhiteBackgroundParamEntry(params);
  if (!found) return false;
  return isSitecoreCheckboxChecked(raw);
}

function resolveMediaTileSurfaceColor(params: Record<string, unknown>): MediaTileSurfaceColor {
  const colorRaw = getMediaTileParamValue(params.Color as MediaTileParamValueShape | string | undefined)
    ?.trim()
    .toLowerCase();
  if (colorRaw === 'dark') return 'dark';
  if (colorRaw === 'gray' || colorRaw === 'grey') return 'gray';
  return 'default';
}

function resolveMediaTileIsCard(params: Record<string, unknown>): boolean {
  const styleRaw = getMediaTileParamValue(
    params.Style as MediaTileParamValueShape | string | undefined,
  )
    ?.trim()
    .toLowerCase();
  return styleRaw === 'card';
}

/**
 * Normalizes the Sitecore `Theme` rendering param to a headline theme key.
 * @param raw - Raw Theme value from CMS (e.g. "Article", "Landing Page", "Compact").
 */
export function normalizeMediaTileThemeKey(raw: string | undefined): MediaTileHeadlineThemeKey {
  const key = raw?.trim().toLowerCase() ?? '';
  if (!key || key === 'base') return 'base';
  if (key.includes('article')) return 'article';
  if (key.includes('compact')) return 'compact';
  if (key.includes('landing')) return 'landing';
  return 'base';
}

/**
 * CSS `object-position` for Next.js `fill` images (matches live 50% 50% default).
 */
export function focalPointToCssObjectPosition(focalValue: string | undefined): string {
  const v = focalValue?.trim().toLowerCase() ?? '';
  if (v.includes('top') && v.includes('left')) return 'left top';
  if (v.includes('top') && v.includes('right')) return 'right top';
  if (v.includes('bottom') && v.includes('left')) return 'left bottom';
  if (v.includes('bottom') && v.includes('right')) return 'right bottom';
  if (v.startsWith('top')) return 'top';
  if (v.startsWith('bottom')) return 'bottom';
  if (v.includes('left')) return 'left';
  if (v.includes('right')) return 'right';
  return '50% 50%';
}

/**
 * Resolves headline tag from HeadingLevel param (never h1).
 */
export function resolveMediaTileHeadingTag(
  params: Record<string, unknown>,
): 'h2' | 'h3' | 'h4' {
  const raw = getMediaTileParamValue(params.HeadingLevel as MediaTileParamValueShape | string | undefined)
    ?.trim()
    .toUpperCase();
  if (raw === 'H3') return 'h3';
  if (raw === 'H4') return 'h4';
  return 'h2';
}

function resolveMediaWidth(params: Record<string, unknown>): 50 | 40 {
  const raw = getMediaTileParamValue(params.MediaWidth as MediaTileParamValueShape | string | undefined);
  if (raw?.includes('40')) return 40;
  return 50;
}

/**
 * Resolves rendering params and field-derived options into layout config.
 */
export function resolveMediaTileLayoutConfig(
  params: Record<string, unknown>,
): MediaTileLayoutConfig {
  const pos = getMediaTileParamValue(
    params.MediaPosition as MediaTileParamValueShape | string | undefined,
  )
    ?.trim()
    .toLowerCase() ?? '';
  const mediaOnRight = pos !== 'left' && !/\bleft\b/.test(pos);

  const ratioRaw = getMediaTileParamValue(
    params.MediaRatio as MediaTileParamValueShape | string | undefined,
  )?.trim();
  const { aspectKey: mediaAspectKey, frameStyle: mediaFrameStyle } =
    resolveMediaTileMediaAspect(ratioRaw);

  const headlineSizeRaw =
    getMediaTileParamValue(params.HeadlineSize as MediaTileParamValueShape | string | undefined)
      ?.trim()
      .toLowerCase() ?? 'base';
  const headlineSizeKey = headlineSizeRaw === 'small' ? 'sm' : headlineSizeRaw === 'large' ? 'lg' : 'base';

  const headlineWidthRaw = getMediaTileParamValue(
    params.HeadlineWidth as MediaTileParamValueShape | string | undefined,
  )
    ?.trim()
    .toLowerCase();
  const headlineWidthFull = !headlineWidthRaw || headlineWidthRaw === 'full';

  const themeRaw = getMediaTileParamValue(
    params.Theme as MediaTileParamValueShape | string | undefined,
  );
  const themeKey = normalizeMediaTileThemeKey(themeRaw);

  const colorSchemeRaw = getMediaTileParamValue(
    params.ColorScheme as MediaTileParamValueShape | string | undefined,
  );

  return {
    mediaOnRight,
    mediaWidthPercent: resolveMediaWidth(params),
    mediaAspectKey,
    mediaFrameStyle,
    headingTag: resolveMediaTileHeadingTag(params),
    themeKey,
    headlineSizeKey,
    headlineWidthFull,
    surfaceColor: resolveMediaTileSurfaceColor(params),
    isCard: resolveMediaTileIsCard(params),
    hasWhiteBackground: resolveMediaTileHasWhiteBackground(params),
    colorSchemeRaw,
  };
}

/**
 * `sizes` for next/image fill: stacked &lt;600 full width; split layout uses the flex column share (`vw`).
 */
export function resolveMediaTileImageSizes(mediaWidthPercent: 50 | 40): string {
  const columnVw = mediaWidthPercent === 40 ? '40vw' : '50vw';
  return `(max-width: 599px) 100vw, ${columnVw}`;
}

/** Sitecore / GraphQL datasource keys that carry the media tile body copy. */
const DATASOURCE_RICHTEXT_KEYS = [
  'Description',
  'description',
  'Body',
  'body',
  'Content',
  'content',
  'Copy',
  'copy',
  'RichText',
  'richText',
] as const;

export function descriptionHasVisibleContent(description: Field<string> | undefined): boolean {
  const raw = description?.value;
  if (typeof raw !== 'string') return false;
  const stripped = raw.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  return stripped.length > 0;
}

export function hasNonEmptyScalarField(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  return String(value).trim().length > 0;
}

export function pickDatasourceRichText(
  datasource: Record<string, unknown> | undefined,
  requireVisible: boolean,
): Field<string> | undefined {
  if (!datasource) return undefined;
  for (const key of DATASOURCE_RICHTEXT_KEYS) {
    const f = fieldFromGraphqlNode(datasource[key]);
    if (!f) continue;
    if (!requireVisible || descriptionHasVisibleContent(f)) return f;
  }
  return undefined;
}

export function asDatasourceRecord(ds: unknown): Record<string, unknown> | undefined {
  if (!ds || typeof ds !== 'object') return undefined;
  return ds as Record<string, unknown>;
}

/** Hoists Callouts / Footnote / Link from `data.datasource` when omitted on root `fields`. */
export function mergeMediaTileDatasourceExtras(
  fields: MediaTileFields,
  ds: Record<string, unknown> | undefined,
  isEditing: boolean,
): MediaTileFields {
  if (!ds) return fields;

  let out = fields;
  const existingCallouts = fields.Callouts?.filter((c) => c?.id) ?? [];

  if (existingCallouts.length === 0) {
    const fromDs = extractCalloutsFromDatasource(ds);
    if (fromDs.length > 0) {
      out = { ...out, Callouts: fromDs };
    }
  }

  if (!hasNonEmptyScalarField(fields.Footnote?.value)) {
    const fn = fieldFromGraphqlNode(ds.Footnote ?? ds.footnote);
    if (fn && (isEditing || descriptionHasVisibleContent(fn))) {
      out = { ...out, Footnote: fn };
    }
  }

  if (!fields.Link?.value?.href) {
    const link = normalizeLinkFieldNode(ds.Link ?? ds.link);
    if (link && (isEditing || Boolean(link.value?.href))) {
      out = { ...out, Link: link };
    }
  }

  return out;
}

/** Maps root-level `CalloutItems` / `callouts` onto `Callouts` when `Callouts` is empty. */
export function coalesceRootCalloutLists(fields: MediaTileFields): MediaTileFields {
  const fromCallouts = normalizeCalloutsField(fields.Callouts);
  if (fromCallouts.length > 0) {
    return { ...fields, Callouts: fromCallouts };
  }
  const fromItems = normalizeCalloutsField(fields.CalloutItems);
  if (fromItems.length > 0) {
    return { ...fields, Callouts: fromItems };
  }
  const fromRoot = extractCalloutsFromDatasource(fields as unknown as Record<string, unknown>);
  if (fromRoot.length > 0) {
    return { ...fields, Callouts: fromRoot };
  }
  return fields;
}

/**
 * Maps alternate rich-text fields onto `Description` and hoists datasource extras.
 */
export function resolveMediaTileFields(
  fields: MediaTileFields | undefined,
  isEditing: boolean,
): MediaTileFields | undefined {
  if (!fields) return undefined;

  let result: MediaTileFields = coalesceRootCalloutLists(fields);
  const ds = asDatasourceRecord(result.data?.datasource);

  if (isEditing) {
    const fromDsEdit = pickDatasourceRichText(ds, false);
    const orderedEdit: (Field<string> | undefined)[] = [
      fields.Description,
      fields.Body,
      fields.Content,
      fields.Copy,
      fromDsEdit,
    ];
    const binding = orderedEdit.find((f) => f !== undefined && f !== null);
    if (binding && binding !== fields.Description) {
      result = { ...result, Description: binding };
    }
  } else {
    const fromDsPreview = pickDatasourceRichText(ds, true);
    const orderedPreview: (Field<string> | undefined)[] = [
      fields.Description,
      fields.Body,
      fields.Content,
      fields.Copy,
      fromDsPreview,
    ];
    const forPreview = orderedPreview.find(descriptionHasVisibleContent);
    if (forPreview && forPreview !== fields.Description) {
      result = { ...result, Description: forPreview };
    }
  }

  let merged = mergeMediaTileDatasourceExtras(result, ds, isEditing);
  if (merged.Callouts?.length) {
    merged = { ...merged, Callouts: normalizeCalloutItemsFieldShapes(merged.Callouts) };
  }
  return merged;
}

/** Whether to render the embedded Callout block under the media tile split. */
export function mediaTileShouldRenderEmbeddedCallout(
  fields: MediaTileFields | undefined,
  isEditing: boolean,
): boolean {
  if (!fields) return false;
  const filtered = fields.Callouts?.filter((item) => item?.id) ?? [];
  const visible = isEditing
    ? filtered
    : filtered.filter((item) => calloutItemHasPreviewContent(item.fields));
  if (visible.length > 0) return true;
  if (hasNonEmptyScalarField(fields.Footnote?.value)) return true;
  if (fields.Link?.value?.href) return true;
  return false;
}

const BRIGHTCOVE_ID_FIELD_KEYS = ['BrightcoveId', 'brightcoveId', 'brightCoveId'] as const;

function videoReferenceItemFieldsBlock(item: Record<string, unknown>): Record<string, unknown> | undefined {
  const block = (item.fields ?? item.Fields) as unknown;
  if (block != null && typeof block === 'object' && !Array.isArray(block)) {
    return block as Record<string, unknown>;
  }
  return undefined;
}

function readSitecoreScalarFieldValue(node: unknown): string | undefined {
  if (node === undefined || node === null) return undefined;
  if (typeof node === 'string' || typeof node === 'number') {
    const s = String(node).trim();
    return s.length > 0 ? s : undefined;
  }
  if (typeof node !== 'object') return undefined;
  const o = node as Record<string, unknown>;
  if ('jsonValue' in o && o.jsonValue != null) {
    return readSitecoreScalarFieldValue(o.jsonValue);
  }
  if ('value' in o) {
    return readSitecoreScalarFieldValue(o.value);
  }
  return undefined;
}

function videoFieldsBlockHasBrightcoveId(fields: Record<string, unknown> | undefined): boolean {
  if (!fields) return false;
  return BRIGHTCOVE_ID_FIELD_KEYS.some((k) => typeof fields[k] !== 'undefined');
}

function readBrightcoveIdFromVideoFieldsBlock(fields: Record<string, unknown> | undefined): string | undefined {
  if (!fields) return undefined;
  for (const key of BRIGHTCOVE_ID_FIELD_KEYS) {
    const s = readSitecoreScalarFieldValue(fields[key]);
    if (s) return s;
  }
  return undefined;
}

function unwrapVideoFieldForBrightcoveId(raw: unknown): IVideoFields | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const innerFields = videoReferenceItemFieldsBlock(o);
  if (innerFields && videoFieldsBlockHasBrightcoveId(innerFields)) {
    return raw as IVideoFields;
  }
  if ('jsonValue' in o && o.jsonValue != null && typeof o.jsonValue === 'object') {
    return unwrapVideoFieldForBrightcoveId(o.jsonValue);
  }
  return undefined;
}

function unwrapVideoReferenceValueEnvelope(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const o = raw as Record<string, unknown>;
  if ('value' in o && o.value != null && typeof o.value === 'object') {
    const inner = o.value as Record<string, unknown>;
    if (
      videoReferenceItemFieldsBlock(inner) !== undefined ||
      typeof inner.jsonValue !== 'undefined' ||
      videoFieldsBlockHasBrightcoveId(inner)
    ) {
      return unwrapVideoReferenceValueEnvelope(o.value);
    }
  }
  return raw;
}

/** Brightcove video id from Media Tile `Video` item. */
export function extractMediaTileBrightcoveId(
  video: IVideoFields | null | undefined | unknown,
): string | undefined {
  const normalized = unwrapVideoReferenceValueEnvelope(video);
  const resolved =
    unwrapVideoFieldForBrightcoveId(normalized) ?? (normalized as IVideoFields | undefined);
  if (!resolved || typeof resolved !== 'object') return undefined;
  const item = resolved as unknown as Record<string, unknown>;
  const vf = videoReferenceItemFieldsBlock(item);
  return readBrightcoveIdFromVideoFieldsBlock(vf);
}

/** Whether the tile has visitor-visible content (excluding edit-only placeholders). */
export function mediaTileHasPreviewContent(fields: MediaTileFields | undefined): boolean {
  if (!fields) return false;
  const f = fields;
  if (hasNonEmptyScalarField(f.Eyebrow?.value)) return true;
  if (hasNonEmptyScalarField(f.Headline?.value)) return true;
  if (descriptionHasVisibleContent(f.Description)) return true;
  if (f.Image?.value?.src) return true;

  const mediaTypeVal = f.MediaType?.fields?.Value?.value;
  const mediaTypeStr =
    typeof mediaTypeVal === 'number' ? String(mediaTypeVal) : (mediaTypeVal ?? '');
  const isVideoMedia = mediaTypeStr.trim().toLowerCase() === 'video';
  if (isVideoMedia && extractMediaTileBrightcoveId(f.Video)) return true;

  const links = f.Links?.filter((item) => item?.fields) ?? [];
  for (const item of links) {
    if (item.fields?.Link?.value?.href) return true;
  }

  if (mediaTileShouldRenderEmbeddedCallout(fields, false)) return true;

  return false;
}

/** Whether `ColorScheme` param label includes "dark" (InfoBox accent list markers). */
export function isMediaTileDarkColorScheme(colorSchemeRaw: string | undefined): boolean {
  const key = colorSchemeRaw?.trim().toLowerCase() ?? '';
  return /\bdark\b/.test(key);
}

/** Whether `ColorScheme` param resolves to gray/grey plain copy. */
export function isMediaTileGrayColorScheme(colorSchemeRaw: string | undefined): boolean {
  const key = colorSchemeRaw?.trim().toLowerCase() ?? '';
  return /\bgray\b/.test(key) || /\bgrey\b/.test(key);
}

/** Whether `ColorScheme` param resolves to light or dark plain black copy. */
export function isMediaTileLightOrDarkColorScheme(colorSchemeRaw: string | undefined): boolean {
  const key = colorSchemeRaw?.trim().toLowerCase() ?? '';
  return /\bdark\b/.test(key) || /\blight\b/.test(key);
}
