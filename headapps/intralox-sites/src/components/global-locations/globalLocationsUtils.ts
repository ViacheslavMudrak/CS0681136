import type { Field, ImageField, TextField } from '@sitecore-content-sdk/nextjs';

import { parseMediaImageDimensions } from 'components/media/mediaUtils';

import type { CalloutItem } from 'components/callout/Callout.type';
import { calloutFieldValueIsVisible, calloutItemHasPreviewContent as calloutStatRowHasVisitorPreview } from 'components/callout/calloutUtils';
import type { MediaTileLinkItem } from 'components/media-tile/MediaTile.type';
import { readLinkGroupParamValue } from 'components/link-group/linkGroupUtils';
import type { MediaTileParamValueShape } from 'components/media-tile/MediaTile.type';
import {
  getMediaTileParamValue,
  mergeMediaTileRenderingParams,
} from 'components/media-tile/mediaTileUtils';
import { isRichTextEffectivelyEmpty } from 'components/rich-text/richTextUtils';

import type { GlobalLocationsFields } from './GlobalLocations.type';

export const GLOBAL_LOCATIONS_LABELS = {
  emptyHint: 'Global Locations',
  noLinksConfigured: 'No links configured',
  linkFallback: 'Link',
  noCalloutsConfigured: 'No statistics configured',
  sectionAriaFallback: 'Global locations',
} as const;

/** Live map band aspect ratio at 1168px reference width. */
export const GLOBAL_LOCATIONS_MAP_FRAME_ASPECT = {
  width: 1168,
  height: 565.844,
} as const;

/** Default world-map NextImage intrinsic dimensions when Sitecore omits width/height. */
export const GLOBAL_LOCATIONS_MAP_DEFAULT_IMAGE_DIMENSIONS = {
  width: GLOBAL_LOCATIONS_MAP_FRAME_ASPECT.width,
  height: Math.round(GLOBAL_LOCATIONS_MAP_FRAME_ASPECT.height),
} as const;

/**
 * Frame aspect for the map band — always {@link GLOBAL_LOCATIONS_MAP_FRAME_ASPECT} (live layout ref).
 */
export function resolveGlobalLocationsMapFrameAspect(): typeof GLOBAL_LOCATIONS_MAP_FRAME_ASPECT {
  return GLOBAL_LOCATIONS_MAP_FRAME_ASPECT;
}

/**
 * NextImage width/height from Sitecore metadata (srcset / optimization only; not used for frame height).
 *
 * @param image - Global Locations map image field.
 */
export function resolveGlobalLocationsMapImageDimensions(
  image: ImageField | undefined,
): { width: number; height: number } {
  const parsed = parseMediaImageDimensions(image);
  if (parsed) return parsed;
  return { ...GLOBAL_LOCATIONS_MAP_DEFAULT_IMAGE_DIMENSIONS };
}

/**
 * Whether the statistics band should mount the shared Callout rendering.
 *
 * @param items - `CalloutItems` from the Global Locations datasource.
 * @param isEditing - XM Cloud Pages editing mode.
 */
export function globalLocationsShouldRenderCalloutStats(
  items: CalloutItem[] | undefined,
  isEditing: boolean,
): boolean {
  if (isEditing) return true;
  const rows =
    items?.filter((item) => item?.id != null && String(item.id).trim().length > 0 && item?.fields) ?? [];
  return rows.some((row) => calloutStatRowHasVisitorPreview(row.fields));
}

/**
 * Reads a rendering param string from Sitecore layout shapes (`Value.value`, plain string, droplink item).
 *
 * @param params - Raw Sitecore component params.
 * @param key - Param key (`BackgroundColor`, `backgroundColor`, …).
 */
function readGlobalLocationsParamString(
  params: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  if (!params) return undefined;
  const block = params[key];
  const fromShape = getMediaTileParamValue(
    block as MediaTileParamValueShape | string | undefined,
  );
  if (fromShape?.trim()) return fromShape.trim();

  if (block != null && typeof block === 'object' && !Array.isArray(block)) {
    const o = block as Record<string, unknown>;
    const fields = (o.fields ?? o.Fields) as Record<string, unknown> | undefined;
    const valueField = fields?.Value as { value?: unknown } | undefined;
    if (valueField?.value != null) {
      const s = String(valueField.value).trim();
      if (s.length > 0) return s;
    }
    const name = typeof o.name === 'string' ? o.name : o.displayName;
    if (typeof name === 'string' && name.trim()) return name.trim();
  }

  return readLinkGroupParamValue(params, key);
}

/**
 * Reads optional `BackgroundColor` / `backgroundColor` rendering param when set in Sitecore.
 *
 * @param params - Raw Sitecore component params.
 */
export function readGlobalLocationsBackgroundColorParam(
  params: Record<string, unknown> | undefined,
): string | undefined {
  return (
    readGlobalLocationsParamString(params, 'BackgroundColor') ??
    readGlobalLocationsParamString(params, 'backgroundColor')
  );
}

/**
 * Merges `rendering.params` / `rendering.parameters` with route `params`.
 *
 * @param rendering - Layout rendering node.
 * @param params - Props params from the placeholder.
 */
export function mergeGlobalLocationsRenderingParams(
  rendering: unknown,
  params: Record<string, unknown>,
): Record<string, unknown> {
  return mergeMediaTileRenderingParams(rendering, params);
}

/** CMS-driven section surface token (Tailwind applied on JSX). */
export type GlobalLocationsSectionSurface =
  | 'surface'
  | 'surface-muted'
  | 'accent-teal'
  | 'brand-red'
  | 'surface-inverse';

/**
 * Reads section surface from `BackgroundColor` or `ColorScheme` (no Tailwind strings).
 *
 * @param colorSchemeRaw - Raw `ColorScheme` param.
 * @param backgroundColorRaw - Raw `BackgroundColor` param.
 */
export function readGlobalLocationsSectionSurface(
  colorSchemeRaw: string | undefined,
  backgroundColorRaw: string | undefined,
): { surface: GlobalLocationsSectionSurface; isDarkSection: boolean } {
  const key = backgroundColorRaw?.trim().toLowerCase().replace(/\s+/g, ' ') ?? '';
  if (key.length > 0) {
    if (key === 'white' || key === 'default') {
      return { surface: 'surface', isDarkSection: false };
    }
    if (key === 'gray' || key === 'grey') {
      return { surface: 'surface-muted', isDarkSection: false };
    }
    if (
      key === 'light blue' ||
      key === 'lightblue' ||
      key === 'blue' ||
      key.includes('teal') ||
      (key.includes('light') && key.includes('blue'))
    ) {
      return { surface: 'accent-teal', isDarkSection: false };
    }
    if (
      key === 'brand primary' ||
      key === 'brandprimary' ||
      (key.includes('brand') && key.includes('primary'))
    ) {
      return { surface: 'brand-red', isDarkSection: true };
    }
  }

  const v = colorSchemeRaw?.toLowerCase().trim();
  if (v === 'dark') {
    return { surface: 'surface-inverse', isDarkSection: true };
  }
  if (v === 'gray' || v === 'grey') {
    return { surface: 'surface-muted', isDarkSection: false };
  }
  return { surface: 'surface', isDarkSection: false };
}

/**
 * Merges flat `fields` with optional `fields.data.datasource` (GraphQL shape) for the same template keys.
 *
 * @param fields - Layout fields from Sitecore.
 */
export function resolveGlobalLocationsFields(
  fields: GlobalLocationsFields | undefined,
): GlobalLocationsFields | undefined {
  if (!fields) return undefined;
  const ds = fields.data?.datasource as GlobalLocationsFields | undefined;
  if (!ds) return fields;

  return {
    ...fields,
    Eyebrow: mergeTextField(fields.Eyebrow, ds.Eyebrow),
    Headline: mergeTextField(fields.Headline, ds.Headline),
    Description: mergeRichField(fields.Description, ds.Description) ?? fields.Description,
    Image: mergeImage(fields.Image, ds.Image) ?? fields.Image,
    CalloutItems: mergeCalloutItems(fields.CalloutItems, ds.CalloutItems) ?? fields.CalloutItems,
    Links: mergeLinks(fields.Links, ds.Links) ?? fields.Links,
    ButtonAlignment: fields.ButtonAlignment ?? ds.ButtonAlignment,
    FocalPoint: fields.FocalPoint ?? ds.FocalPoint,
  };
}

function mergeTextField(
  primary: TextField | undefined,
  fallback: TextField | undefined,
): TextField | undefined {
  const p = primary;
  const fb = fallback;
  const pv = p?.value != null ? String(p.value).trim() : '';
  if (pv.length > 0) return p;
  return fb;
}

function mergeRichField(primary: Field<string> | undefined, fallback: Field<string> | undefined) {
  const p = primary?.value?.toString() ?? '';
  if (!isRichTextEffectivelyEmpty(p)) return primary;
  return fallback;
}

function mergeImage(primary: ImageField | undefined, fallback: ImageField | undefined) {
  if (primary?.value?.src && String(primary.value.src).trim()) return primary;
  return fallback;
}

function mergeCalloutItems(
  primary: CalloutItem[] | undefined,
  fallback: CalloutItem[] | undefined,
): CalloutItem[] | undefined {
  if (primary && primary.length > 0) return primary;
  return fallback;
}

function mergeLinks(
  primary: MediaTileLinkItem[] | undefined,
  fallback: MediaTileLinkItem[] | undefined,
): MediaTileLinkItem[] | undefined {
  if (primary && primary.length > 0) return primary;
  return fallback;
}

function hasNonEmptyTextField(f: TextField | undefined): boolean {
  if (f?.value === undefined || f?.value === null) return false;
  return String(f.value).trim().length > 0;
}

function calloutItemHasPreviewContent(item: CalloutItem | undefined, isEditing: boolean): boolean {
  if (!item?.fields) return false;
  const { PrependValue, Value, AppendValue, Label, Link } = item.fields;
  const hasStat =
      calloutFieldValueIsVisible(PrependValue?.value) ||
      calloutFieldValueIsVisible(Value?.value) ||
      calloutFieldValueIsVisible(AppendValue?.value) ||
      calloutFieldValueIsVisible(Label?.value);
  const hasLink = Boolean(Link?.value?.href?.trim());
  return hasStat || hasLink || isEditing;
}

function linkItemHasPreview(item: MediaTileLinkItem | undefined, isEditing: boolean): boolean {
  const href = item?.fields?.Link?.value?.href;
  return Boolean(href?.trim()) || isEditing;
}

/**
 * True when the component should render outside of XM Pages (visitor preview).
 *
 * @param fields - Resolved datasource fields.
 * @param isEditing - XM Pages editing mode.
 */
export function globalLocationsHasPreviewContent(
  fields: GlobalLocationsFields | undefined,
  isEditing: boolean,
): boolean {
  if (!fields) return false;
  if (isEditing) return true;

  if (hasNonEmptyTextField(fields.Eyebrow)) return true;
  if (hasNonEmptyTextField(fields.Headline)) return true;
  if (!isRichTextEffectivelyEmpty(fields.Description?.value?.toString())) return true;
  if (fields.Image?.value?.src && String(fields.Image.value.src).trim()) return true;
  if (fields.Links?.some((item) => linkItemHasPreview(item, false))) return true;
  if (fields.CalloutItems?.some((item) => calloutItemHasPreviewContent(item, false))) return true;

  return false;
}

/**
 * Builds `aria-label` for the section when no `h2` is rendered.
 *
 * @param fields - Resolved fields.
 * @param componentName - Sitecore rendering component name.
 */
export function resolveGlobalLocationsSectionAriaLabel(
  fields: GlobalLocationsFields | undefined,
  componentName: string | undefined,
): string {
  const fromHeadline = fields?.Headline?.value != null ? String(fields.Headline.value).trim() : '';
  if (fromHeadline) return fromHeadline;
  const fromEyebrow = fields?.Eyebrow?.value != null ? String(fields.Eyebrow.value).trim() : '';
  if (fromEyebrow) return fromEyebrow;
  const fromRendering = componentName?.trim();
  if (fromRendering) return fromRendering;
  return GLOBAL_LOCATIONS_LABELS.sectionAriaFallback;
}
