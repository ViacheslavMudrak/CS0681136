import type { Field, ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';

import {
  isFontAwesomeClassString,
  normalizeFontAwesomeClassList,
} from 'lib/chrome-icons';
import { cmsIconToFontAwesome } from 'src/lib/cms-icon-to-fontawesome';

import type { LinkGroupIconField, LinkGroupIconRef, LinkGroupItem, LinkGroupItemFields } from './LinkGroup.type';

/** Reject class strings that could break out of `class` (parity with {@link FaIconFromCms}). */
const UNSAFE_ICON_CLASS_ATTR = /[<>"']|\bstyle\s*=/i;

export const LINK_GROUP_LABELS = {
  emptyDatasource: 'Link Group',
  emptyList: 'No link items configured',
  sectionAria: 'Link group',
  tileAriaFallback: 'Link item',
} as const;

export const LINK_GROUP_ROOT_TEST_ID = 'link-group';

export type LinkGroupColorSchemeKey = 'default' | 'light' | 'dark' | 'gray';

/**
 * Reads a Sitecore rendering param shaped as `{ Value: { value: string } }`.
 *
 * @param params - Raw Sitecore component params.
 * @param key - Param name (e.g. `ColorScheme`).
 * @returns Trimmed string value, or `undefined` when missing or blank.
 */
export function readLinkGroupParamValue(
  params: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const block = params?.[key] as { Value?: { value?: unknown } } | undefined;
  const raw = block?.Value?.value;
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim();
  return s.length > 0 ? s : undefined;
}

/**
 * Normalizes rendering param `ColorScheme` (light | dark | gray | grey) for tiles and parent header copy.
 * Unknown values fall back to `default` (same surface tokens as `light`).
 *
 * @param raw - Param value (any casing).
 */
export function normalizeLinkGroupColorScheme(raw: string | undefined): LinkGroupColorSchemeKey {
  const v = raw?.toLowerCase().trim();
  if (v === 'light') return 'light';
  if (v === 'dark') return 'dark';
  // Sitecore often sends "Grey" (UK spelling); internal key is `gray`.
  if (v === 'gray' || v === 'grey') return 'gray';
  return 'default';
}

function readIconStringFromRecord(obj: unknown, keys: readonly string[]): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const rec = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = rec[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

/**
 * Raw icon string from Sitecore: `fields.Value.value`, string `value`, object `Class` / `cssClass`, or item name.
 *
 * @param iconField - Icon field from layout JSON / Edge.
 */
export function resolveLinkGroupIconKey(iconField: LinkGroupIconField | undefined): string | undefined {
  if (!iconField) return undefined;
  const nested = !isLinkGroupRasterIconField(iconField) ? iconField.fields?.Value?.value : undefined;
  if (typeof nested === 'string' && nested.trim()) return nested.trim();
  if (nested != null && typeof nested === 'object') {
    const fromNested = readIconStringFromRecord(nested, [
      'Class',
      'class',
      'cssClass',
      'CssClass',
      'IconClass',
      'Value',
      'value',
    ]);
    if (fromNested) return fromNested;
  }
  const loose = iconField.value;
  if (typeof loose === 'string' && loose.trim()) return loose.trim();
  if (loose != null && typeof loose === 'object') {
    const fromLoose = readIconStringFromRecord(loose, [
      'Class',
      'class',
      'cssClass',
      'CssClass',
      'IconClass',
      'Value',
      'value',
    ]);
    if (fromLoose) return fromLoose;
  }
  const fromName = !isLinkGroupRasterIconField(iconField)
    ? (iconField.displayName ?? iconField.name)
    : undefined;
  if (typeof fromName === 'string' && fromName.trim()) return fromName.trim();
  return undefined;
}

/**
 * True when the CMS `Icon` field is a media `Image` (`value` object includes `src`), as in Layout / Edge JSON.
 *
 * @param iconField - Raw `fields.Icon` value.
 */
export function isLinkGroupRasterIconField(iconField: unknown): iconField is ImageField {
  if (!iconField || typeof iconField !== 'object') return false;
  const value = (iconField as ImageField).value;
  if (value == null || typeof value !== 'object') return false;
  return 'src' in value;
}

function rasterIconSrcTrimmed(iconField: ImageField): string | undefined {
  const src = iconField.value?.src;
  if (typeof src !== 'string') return undefined;
  const t = src.trim();
  return t.length > 0 ? t : undefined;
}

/**
 * Non-empty image `src` for a raster `Icon`, or `undefined` for droplinks / empty images.
 *
 * @param iconField - Child item `Icon` field.
 */
export function linkGroupRasterIconSrc(iconField: LinkGroupIconField | undefined): string | undefined {
  if (!isLinkGroupRasterIconField(iconField)) return undefined;
  return rasterIconSrcTrimmed(iconField);
}

/**
 * Parses Sitecore `width` / `height` (often strings in JSON) for {@link NextImage}.
 *
 * @param field - Image field on the icon.
 */
export function linkGroupIconImageDimensions(field: ImageField): { width: number; height: number } {
  const w = field.value?.width;
  const h = field.value?.height;
  const nw = typeof w === 'number' ? w : Number.parseInt(String(w ?? ''), 10);
  const nh = typeof h === 'number' ? h : Number.parseInt(String(h ?? ''), 10);
  const width = Number.isFinite(nw) && nw > 0 ? nw : 64;
  const height = Number.isFinite(nh) && nh > 0 ? nh : 64;
  return { width, height };
}

function looksLikeFontAwesomeClassList(raw: string): boolean {
  const t = raw.trim();
  return (
    isFontAwesomeClassString(t) ||
    /\b(fas|far|fab|fal|fad|fa-solid|fa-regular|fa-brands)\b/i.test(t) ||
    /^fa\s/i.test(t)
  );
}

/**
 * Builds the `class` string for the tile `<i>`: full FA lists from CMS are normalized (FA5 → FA6);
 * bare names (e.g. `stethoscope`) go through {@link cmsIconToFontAwesome}.
 *
 * @param iconField - Child item `Icon` field.
 * @returns Non-empty FA classes, or empty string when unset or unsafe.
 */
export function resolveLinkGroupIconFa(iconField: LinkGroupIconField | undefined): string {
  const raw = resolveLinkGroupIconKey(iconField);
  if (!raw || UNSAFE_ICON_CLASS_ATTR.test(raw)) return '';
  const normalized = normalizeFontAwesomeClassList(raw.trim());
  if (!normalized || UNSAFE_ICON_CLASS_ATTR.test(normalized)) return '';
  if (looksLikeFontAwesomeClassList(normalized)) {
    return normalized;
  }
  const slug = cmsIconToFontAwesome(normalized);
  return slug && !UNSAFE_ICON_CLASS_ATTR.test(slug) ? slug : '';
}

function descriptionMeaningful(field: Field<string> | undefined): boolean {
  const v = field?.value;
  if (v === undefined || v === null) return false;
  const s = String(v).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return s.length > 0;
}

function linkHasHref(link: LinkField | undefined): boolean {
  const href = link?.value?.href;
  return typeof href === 'string' && href.trim().length > 0;
}

function titleMeaningful(title: TextField | undefined): boolean {
  const v = title?.value;
  if (v === undefined || v === null) return false;
  return String(v).trim().length > 0;
}

/**
 * True when a visitor should see this tile (any non-empty content), or always true in editing when fields exist.
 *
 * @param fields - Child item fields.
 * @param isEditing - XM Cloud Pages editing mode.
 */
export function linkGroupItemHasVisitorContent(
  fields: LinkGroupItemFields | undefined,
  isEditing: boolean,
): boolean {
  if (!fields) return isEditing;
  if (isEditing) return true;
  return (
    titleMeaningful(fields.Title) ||
    descriptionMeaningful(fields.Description) ||
    Boolean(resolveLinkGroupIconKey(fields.Icon)) ||
    Boolean(linkGroupRasterIconSrc(fields.Icon)) ||
    linkHasHref(fields.Link)
  );
}

/**
 * Accessible name for a tile: title, then link text, then Sitecore display name, then fallback constant.
 */
export function linkGroupTileAriaLabel(
  fields: LinkGroupItemFields | undefined,
  item: LinkGroupItem,
): string {
  const t = fields?.Title?.value;
  if (typeof t === 'string' && t.trim()) return t.trim();
  const lt = fields?.Link?.value?.text;
  if (typeof lt === 'string' && lt.trim()) return lt.trim();
  const dn = item.displayName ?? item.name;
  if (typeof dn === 'string' && dn.trim()) return dn.trim();
  return LINK_GROUP_LABELS.tileAriaFallback;
}

/**
 * Plain text exists for title, link display text, or RTE description — enough for the tile `<a>` name from subtree (WCAG 2.5.3).
 */
export function linkGroupTileSubtreeProvidesLinkName(
  fields: LinkGroupItemFields | undefined,
): boolean {
  if (titleMeaningful(fields?.Title)) return true;
  const linkText = fields?.Link?.value?.text;
  if (typeof linkText === 'string' && linkText.trim().length > 0) return true;
  return descriptionMeaningful(fields?.Description);
}

/**
 * Resolves column count from rendering params (defaults to 1).
 *
 * @param params - Sitecore params record.
 */
export function resolveLinkGroupColumns(params: Record<string, unknown> | undefined): 1 | 2 {
  const raw = readLinkGroupParamValue(params, 'Columns')?.toLowerCase();
  return raw === '2' ? 2 : 1;
}

export { descriptionMeaningful as linkGroupDescriptionMeaningful };
