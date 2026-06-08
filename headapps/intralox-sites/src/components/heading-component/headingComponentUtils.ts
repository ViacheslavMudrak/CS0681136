/** Empty-state hint when the datasource is missing (XM Pages / disconnected hints). */
export const HEADING_COMPONENT_EMPTY_HINT = 'Heading Component';

export type HeadingComponentSemanticTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type HeadingComponentColorKey = 'black' | 'white' | 'gray' | 'cyan' | 'orange';

export function trimHeadingNonEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  return String(value).trim().length > 0;
}

export function resolveHeadingTextAlignKey(textAlignRaw: string | undefined): 'left' | 'center' | 'right' {
  if (textAlignRaw == null || String(textAlignRaw).trim() === '') {
    return 'left';
  }
  const k = String(textAlignRaw).trim().toLowerCase();
  if (k === 'center' || k === 'centre') return 'center';
  if (k === 'right') return 'right';
  return 'left';
}

export function resolveHeadingColorKey(colorRaw: string | undefined): HeadingComponentColorKey {
  const colorNorm = (colorRaw ?? 'black').trim().toLowerCase();
  if (colorNorm === 'white') return 'white';
  if (colorNorm === 'gray' || colorNorm === 'grey') return 'gray';
  if (colorNorm === 'cyan') return 'cyan';
  if (colorNorm === 'orange') return 'orange';
  return 'black';
}

export function resolveHeadingSemanticTag(
  headingLevelRaw: string | null | undefined,
): HeadingComponentSemanticTag {
  if (headingLevelRaw == null || typeof headingLevelRaw !== 'string') {
    return 'h2';
  }
  const normalized = headingLevelRaw.trim().toLowerCase();
  const tag =
    normalized.length === 2 && normalized.startsWith('h') ?
      normalized
    : `h${normalized.replace(/^h/i, '')}`;
  return (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).includes(
    tag as HeadingComponentSemanticTag,
  ) ?
      (tag as HeadingComponentSemanticTag)
    : 'h2';
}

/** Maps Sitecore heading tag to react-aria / design-system `level` (1–6). */
export function resolveHeadingLevelNumber(tag: HeadingComponentSemanticTag): number {
  return Number(tag.replace(/^h/i, '')) || 2;
}

interface ParamValue {
  Value?: {
    value?: string | number | boolean;
  };
  value?: string | number | boolean;
  fields?: {
    Value?: ParamValue | string | { value?: unknown };
  };
}

/**
 * Reads a Sitecore rendering param (droplist, checkbox, or primitive) as a trimmed string.
 *
 * @param params - Component rendering params
 * @param key - Param name (e.g. `Color`, `Width`)
 */
export function readHeadingComponentParamString(
  params: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  if (!params) return undefined;
  const raw = params[key];
  return getParamValue(raw as ParamValue | string | undefined);
}

function getParamValue(param: ParamValue | string | undefined | null): string | undefined {
  if (param == null) return undefined;
  if (typeof param === 'string') {
    const t = param.trim();
    return t.length > 0 ? t : undefined;
  }
  if (typeof param !== 'object') return undefined;
  const o = param as Record<string, unknown>;
  if (typeof o.value === 'string' || typeof o.value === 'number') {
    const s = String(o.value).trim();
    return s.length > 0 ? s : undefined;
  }
  const nested = o.Value as { value?: unknown } | undefined;
  if (nested != null && typeof nested === 'object' && nested.value != null) {
    const nv = nested.value;
    if (typeof nv === 'string' || typeof nv === 'number') {
      const s = String(nv).trim();
      return s.length > 0 ? s : undefined;
    }
  }
  const fieldsObj = o.fields as Record<string, unknown> | undefined;
  if (fieldsObj != null && typeof fieldsObj === 'object') {
    const fieldValueNode = fieldsObj.Value;
    if (fieldValueNode != null) {
      const fromFields = getParamValue(fieldValueNode as ParamValue | string);
      if (fromFields != null && fromFields.trim() !== '') {
        return fromFields;
      }
    }
  }
  return undefined;
}

/**
 * Reads optional text-alignment from rendering params (first match wins).
 *
 * @param params - Raw component params
 */
export function readHeadingTextAlignParam(
  params: Record<string, unknown> | undefined,
): string | undefined {
  if (!params) return undefined;
  return (
    readHeadingComponentParamString(params, 'TextAlign') ??
    readHeadingComponentParamString(params, 'Alignment') ??
    readHeadingComponentParamString(params, 'TextAlignment')
  );
}

