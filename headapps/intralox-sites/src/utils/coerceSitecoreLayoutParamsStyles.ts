import type { LayoutServiceData } from '@sitecore-content-sdk/nextjs';

/**
 * Normalizes Sitecore `Styles` / `CSSStyles` params to strings so SDK head-link code can call `.match()`.
 */

const PARAM_STYLES_KEYS = ['Styles', 'CSSStyles'] as const;

/** Param droplist: `{ Value: { value } }`. Datasource / field blob: `{ fields: { Value: { value } } }`. */
function stringFromSitecoreStylesBlob(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (!v || typeof v !== 'object' || Array.isArray(v)) return '';
  const o = v as Record<string, unknown>;
  const paramBlock = o.Value as { value?: unknown } | undefined;
  const fromParam = paramBlock?.value;
  if (typeof fromParam === 'string') return fromParam;
  if (typeof fromParam === 'number' || typeof fromParam === 'boolean') return String(fromParam);
  const fields = o.fields as Record<string, { value?: unknown }> | undefined;
  const fromFields = fields?.Value?.value;
  if (typeof fromFields === 'string') return fromFields;
  if (typeof fromFields === 'number' || typeof fromFields === 'boolean') return String(fromFields);
  return '';
}

function coerceRenderingParams(p: Record<string, unknown>): void {
  if ('styles' in p && p.styles != null && typeof p.styles !== 'string') {
    p.styles =
      typeof p.styles === 'number' || typeof p.styles === 'boolean' ? String(p.styles) : '';
  }
  for (const key of PARAM_STYLES_KEYS) {
    if (!(key in p)) continue;
    const v = p[key];
    if (v == null) continue;
    if (typeof v === 'string') continue;
    p[key] = stringFromSitecoreStylesBlob(v);
  }
}

function coerceRenderingFields(fields: Record<string, unknown>): void {
  for (const key of PARAM_STYLES_KEYS) {
    const f = fields[key] as { value?: unknown } | undefined;
    if (!f || typeof f !== 'object' || f.value == null) continue;
    if (typeof f.value === 'string' || typeof f.value === 'number' || typeof f.value === 'boolean') {
      continue;
    }
    f.value = stringFromSitecoreStylesBlob(f.value);
  }
}

function walkRenderingList(items: unknown): void {
  if (!Array.isArray(items)) return;
  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const rendering = item as Record<string, unknown>;
    const params = rendering.params;
    if (params && typeof params === 'object' && !Array.isArray(params)) {
      coerceRenderingParams(params as Record<string, unknown>);
    }
    const fields = rendering.fields;
    if (fields && typeof fields === 'object' && !Array.isArray(fields)) {
      coerceRenderingFields(fields as Record<string, unknown>);
    }
    const ph = rendering.placeholders;
    if (ph && typeof ph === 'object') {
      for (const child of Object.values(ph)) {
        walkRenderingList(child);
      }
    }
  }
}

export function coerceSitecoreLayoutParamsStylesForHeadLinks(layoutData: LayoutServiceData): void {
  const placeholders = layoutData.sitecore.route?.placeholders;
  if (!placeholders || typeof placeholders !== 'object') return;
  for (const list of Object.values(placeholders)) {
    walkRenderingList(list);
  }
}
