export const DIVIDER_ARIA_LABEL = 'Section divider';
export const DIVIDER_EMPTY_HINT = 'Divider';
export const DIVIDER_EMPTY_HINT_HIDDEN = 'Divider (hidden — enable checkbox to show)';

function primitiveToFieldString(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' && !Number.isNaN(v)) return String(v);
  return '';
}

function readDroplistValueFromItemShape(item: Record<string, unknown> | undefined): string {
  if (!item) return '';
  const fieldsObj =
    (item.fields as Record<string, unknown> | undefined) ??
    (item.Fields as Record<string, unknown> | undefined);
  const valueNode = fieldsObj?.Value as Record<string, unknown> | undefined;
  return primitiveToFieldString(valueNode?.value);
}

/**
 * @param value - Field data in any supported Sitecore shape.
 * @returns Normalized string or empty string.
 */
export function getFieldStringValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && !Number.isNaN(value)) return String(value);
  const o = value as Record<string, unknown>;
  const jsonValue = o.jsonValue as Record<string, unknown> | undefined;

  const topPrimitive = primitiveToFieldString(o.value) || primitiveToFieldString(jsonValue?.value);
  if (topPrimitive !== '') return topPrimitive;

  let fromDropdown = readDroplistValueFromItemShape(o);
  if (fromDropdown !== '') return fromDropdown;

  fromDropdown = readDroplistValueFromItemShape(jsonValue);
  if (fromDropdown !== '') return fromDropdown;

  if (typeof o.name === 'string') return o.name;
  return '';
}

const CHECKBOX_FALSE_VALUES = new Set(['0', 'false', 'no', '']);

/**
 * Resolves a Sitecore checkbox / boolean field to a plain boolean.
 * Null/undefined defaults to `true` (show by default when field is absent).
 *
 * @param value - Raw checkbox field value (boolean, string token, or `{ value }` wrapper)
 * @returns `true` when the checkbox is checked, `false` otherwise
 */
export function getCheckboxValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return !CHECKBOX_FALSE_VALUES.has(value.toLowerCase());
  const o = value as Record<string, unknown>;
  const v = o?.value;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return !CHECKBOX_FALSE_VALUES.has(v.toLowerCase());
  return true;
}

/**
 * Resolves Sitecore Width droplist: numeric `10`–`90` (percent of the content strip), or Full / `100` for full width.
 *
 * @param raw - Raw width string from {@link getFieldStringValue} (may include a `%` suffix)
 * @returns Integer 10–90 for a partial-width rule, or `null` for full width (100%)
 */
export function resolveDividerWidthPercent(raw: string): number | null {
  let s = raw.trim().toLowerCase();
  if (s.endsWith('%')) {
    s = s.slice(0, -1).trim();
  }
  if (s === '' || s === 'full' || s === '100') {
    return null;
  }
  const n = parseInt(s, 10);
  if (Number.isNaN(n) || n < 10 || n > 90) {
    return null;
  }
  return n;
}