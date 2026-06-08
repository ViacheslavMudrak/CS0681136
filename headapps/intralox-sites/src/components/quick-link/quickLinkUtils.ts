import { cmsIconToFontAwesome } from 'src/lib/cms-icon-to-fontawesome';

import type { QuickLinkCardType, QuickLinkFields, QuickLinkIconPosition } from './QuickLink.type';

/** Stable hook for tests and QA. */
export const QUICK_LINK_ROOT_TEST_ID = 'quick-link';

/** Mobile base single-row block height from live comp. */
export const QUICK_LINK_BASE_MOBILE_BLOCK_HEIGHT_PX = 68;

/** Stable hook for grouped Quick Link tiles (QuickLinkGroup list items). */
export const QUICK_LINK_TILE_TEST_ID = 'quick-link-tile';

/** `data-testid` for the standalone outer band wrapper (page `section` only). */
export const QUICK_LINK_STANDALONE_OUTER_TEST_ID = 'quick-link-standalone-outer';

/**
 * Accessible name for a single Quick Link: prefer title, then link text, then fallback.
 *
 * @param titleValue - `Title` field string value.
 * @param linkText - `Link` field display text.
 * @param emptyHintLabel - Localized fallback when both are empty.
 * @returns Trimmed string for `aria-label`.
 */
export function quickLinkSectionAriaLabel(
  titleValue: unknown,
  linkText: unknown,
  emptyHintLabel: string,
): string {
  if (typeof titleValue === 'string' && titleValue.trim()) return titleValue.trim();
  if (typeof linkText === 'string' && linkText.trim()) return linkText.trim();
  return emptyHintLabel;
}

/**
 * Reads a Sitecore rendering param shaped as `{ Value: { value: string } }`.
 *
 * @param params - Raw Sitecore component params.
 * @param key - Param name (e.g. `CardType`, `Icon`).
 * @returns Trimmed string value, or `undefined` when missing or blank.
 */
export function readNestedParamValue(
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
 * Raw value for a layout param: droplist `{ Value: { value } }`, checkbox `{ value }`, or a primitive.
 * Used for checkboxes and for merging `rendering.params` where shapes differ from {@link readNestedParamValue}.
 */
export function readRenderingParamRaw(
  params: Record<string, unknown> | undefined,
  key: string,
): unknown {
  if (!params) return undefined;
  const block = params[key];
  if (block === undefined || block === null) return undefined;
  if (typeof block === 'string' || typeof block === 'number' || typeof block === 'boolean') {
    return block;
  }
  if (typeof block !== 'object' || Array.isArray(block)) return undefined;
  const o = block as Record<string, unknown>;
  const nestedValue = o.Value as { value?: unknown } | undefined;
  if (nestedValue != null && typeof nestedValue === 'object' && 'value' in nestedValue) {
    const vv = nestedValue.value;
    if (vv !== undefined && vv !== null) return vv;
  }
  if ('value' in o && o.value !== undefined && o.value !== null) {
    return o.value;
  }
  return undefined;
}

function assignDefinedQuickLinkParams(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const [k, v] of Object.entries(source)) {
    if (v !== undefined) {
      target[k] = v;
    }
  }
}

function sitecoreRenderingParamRecordForQuickLink(rendering: unknown): Record<string, unknown> {
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

/** Merges layout `rendering.params` with props `params` (props win; droplists often live on `rendering` only). */
export function mergeQuickLinkRenderingParams(
  rendering: unknown,
  params: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...sitecoreRenderingParamRecordForQuickLink(rendering) };
  assignDefinedQuickLinkParams(out, params);
  return out;
}

function isSitecoreCheckboxTruthy(raw: unknown): boolean {
  if (raw == null) return false;
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'number') return raw !== 0;
  const s = String(raw).trim().toLowerCase();
  if (s === '' || s === '0' || s === 'false' || s === 'no' || s === 'off') return false;
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

/**
 * @param params - Sitecore params.
 * @param key - Param name (e.g. `CardType`).
 * @returns Trimmed value or undefined.
 */
export function resolveQuickLinkCardType(
  params: Record<string, unknown> | undefined,
): QuickLinkCardType {
  const v = readNestedParamValue(params, 'CardType')?.toLowerCase();
  if (v === 'card') return 'card';
  return 'base';
}

/**
 * @param params - Merged Sitecore params.
 * @returns True when Standalone checkbox is checked (card strip layout).
 */
export function resolveQuickLinkStandalone(params: Record<string, unknown> | undefined): boolean {
  const raw =
    readRenderingParamRaw(params, 'Standalone') ?? readRenderingParamRaw(params, 'standalone');
  return isSitecoreCheckboxTruthy(raw);
}

/**
 * @param cardType - `base` or `card` (controls fallback when param is missing).
 * @param params - Sitecore component params.
 * @returns Normalized icon position.
 */
export function resolveQuickLinkIconPosition(
  cardType: QuickLinkCardType,
  params: Record<string, unknown> | undefined,
): QuickLinkIconPosition {
  const raw = readNestedParamValue(params, 'IconPosition')?.toLowerCase().replace(/\s+/g, '');
  if (raw === 'left' || raw === 'top' || raw === 'center') {
    return raw;
  }
  return cardType === 'card' ? 'center' : 'top';
}

/**
 * Sitecore quick-link icon folder items whose display name does not match the FA glyph on live.
 * Example: guarantee tile uses the ribbon/award glyph while the CMS item is named `Image`.
 */
const QUICK_LINK_ICON_CMS_KEY_ALIASES: Record<string, string> = {
  Image: 'award',
  image: 'award',
};

function normalizeQuickLinkIconCmsKey(raw: string): string {
  const trimmed = raw.trim();
  return QUICK_LINK_ICON_CMS_KEY_ALIASES[trimmed] ?? trimmed;
}

/**
 * Icon CMS key: prefer datasource `Icon` item, then rendering param `Icon`.
 *
 * @param fields - Quick Link datasource fields.
 * @param params - Rendering parameters.
 * @returns Trimmed icon key for Font Awesome resolution, or `undefined`.
 */
export function resolveQuickLinkIconKey(
  fields: QuickLinkFields | undefined,
  params: Record<string, unknown> | undefined,
): string | undefined {
  const fromValue = fields?.Icon?.fields?.Value?.value;
  if (typeof fromValue === 'string' && fromValue.trim()) {
    return normalizeQuickLinkIconCmsKey(fromValue);
  }
  const fromDisplay = fields?.Icon?.displayName ?? fields?.Icon?.name;
  if (typeof fromDisplay === 'string' && fromDisplay.trim()) {
    return normalizeQuickLinkIconCmsKey(fromDisplay);
  }
  const fromParams = readNestedParamValue(params, 'Icon');
  return fromParams ? normalizeQuickLinkIconCmsKey(fromParams) : undefined;
}

function stripHtmlToText(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function textFieldMeaningful(field: { value?: unknown } | undefined): boolean {
  const v = field?.value;
  if (v === undefined || v === null) return false;
  const s = typeof v === 'string' ? stripHtmlToText(v) : stripHtmlToText(String(v));
  return s.length > 0;
}

function imageFieldMeaningful(
  image: QuickLinkFields['Image'],
  isEditing: boolean,
): boolean {
  if (!image) return false;
  const src = image.value?.src;
  if (typeof src === 'string' && src.trim()) return true;
  return Boolean(isEditing);
}

function linkHasHref(link: QuickLinkFields['Link']): boolean {
  const href = link?.value?.href;
  return typeof href === 'string' && href.trim().length > 0;
}

type JsonValueWrapper<T> = { jsonValue?: T };

function pickFromDatasourceOnly<T>(
  datasource: Record<string, unknown>,
  camelKey: string,
  pascalKey: string,
): T | undefined {
  const fromCamel = datasource[camelKey] as JsonValueWrapper<T> | undefined;
  if (fromCamel?.jsonValue !== undefined && fromCamel?.jsonValue !== null) {
    return fromCamel.jsonValue;
  }
  const fromPascal = datasource[pascalKey] as JsonValueWrapper<T> | undefined;
  if (fromPascal?.jsonValue !== undefined && fromPascal?.jsonValue !== null) {
    return fromPascal.jsonValue;
  }
  return undefined;
}

function quickLinkIconFromDatasource(
  datasource: Record<string, unknown> | undefined,
): QuickLinkFields['Icon'] | undefined {
  if (!datasource) return undefined;
  for (const key of ['icon', 'Icon']) {
    const raw = datasource[key];
    if (!raw || typeof raw !== 'object') continue;
    const asJv = raw as JsonValueWrapper<QuickLinkFields['Icon']>;
    if (asJv.jsonValue !== undefined && asJv.jsonValue !== null) {
      return asJv.jsonValue;
    }
    if ('fields' in raw || 'displayName' in raw || 'name' in raw) {
      return raw as QuickLinkFields['Icon'];
    }
  }
  return undefined;
}

function quickLinkIconMeaningful(icon: QuickLinkFields['Icon'] | undefined): boolean {
  const v = icon?.fields?.Value?.value;
  if (typeof v === 'string' && v.trim()) return true;
  const n = icon?.displayName ?? icon?.name;
  return typeof n === 'string' && n.trim().length > 0;
}

/**
 * Merges flat layout fields with integrated GraphQL `data.datasource.*.jsonValue` when flat fields are empty.
 *
 * @param fields - Raw rendering fields from layout or Edge (flat or integrated query shape).
 * @returns Fields safe to pass to icon/title/description helpers.
 */
export function resolveQuickLinkFields(fields: QuickLinkFields): QuickLinkFields {
  const extended = fields as QuickLinkFields & {
    data?: { datasource?: Record<string, unknown> };
  };
  const ds = extended.data?.datasource;
  if (!ds) return fields;

  const Title =
    textFieldMeaningful(fields.Title) ? fields.Title : (
      pickFromDatasourceOnly<QuickLinkFields['Title']>(ds, 'title', 'Title') ?? fields.Title
    );

  const Description =
    textFieldMeaningful(fields.Description) ? fields.Description : (
      pickFromDatasourceOnly<QuickLinkFields['Description']>(
        ds,
        'description',
        'Description',
      ) ?? fields.Description
    );

  const Link =
    linkHasHref(fields.Link) ? fields.Link : (
      pickFromDatasourceOnly<QuickLinkFields['Link']>(ds, 'link', 'Link') ?? fields.Link
    );

  const Image =
    imageFieldMeaningful(fields.Image, false) ? fields.Image : (
      pickFromDatasourceOnly<QuickLinkFields['Image']>(ds, 'image', 'Image') ?? fields.Image
    );

  const Icon =
    quickLinkIconMeaningful(fields.Icon) ? fields.Icon : (
      quickLinkIconFromDatasource(ds) ?? fields.Icon
    );

  return { ...fields, Title, Description, Link, Image, Icon };
}

/**
 * Whether the Font Awesome or image icon should be considered present for layout spacing.
 *
 * @param fields - Quick Link datasource fields.
 * @param params - Rendering parameters (fallback icon key).
 * @param isEditing - When true, empty image field still counts as a slot.
 * @returns `true` if an image or resolvable FA icon is shown.
 */
export function quickLinkHasIconVisual(
  fields: QuickLinkFields | undefined,
  params: Record<string, unknown> | undefined,
  isEditing: boolean,
): boolean {
  if (!fields) return false;
  if (imageFieldMeaningful(fields.Image, isEditing)) return true;
  const key = resolveQuickLinkIconKey(fields, params);
  if (!key) return false;
  return Boolean(cmsIconToFontAwesome(key));
}

/**
 * True when there is something to show to visitors, or always true in editing mode (datasource exists).
 *
 * @param fields - Resolved Quick Link fields.
 * @param params - Rendering parameters.
 * @param isEditing - Experience Editor / Pages mode.
 * @returns Whether the component should render for the current mode.
 */
export function hasQuickLinkVisitorContent(
  fields: QuickLinkFields,
  params: Record<string, unknown> | undefined,
  isEditing: boolean,
): boolean {
  if (isEditing) return true;
  if (textFieldMeaningful(fields.Title)) return true;
  if (textFieldMeaningful(fields.Description)) return true;
  if (imageFieldMeaningful(fields.Image, false)) return true;
  if (quickLinkHasIconVisual(fields, params, false)) return true;
  if (linkHasHref(fields.Link)) return true;
  return false;
}