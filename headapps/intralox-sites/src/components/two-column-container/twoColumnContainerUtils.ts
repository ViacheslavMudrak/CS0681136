import { readLinkGroupParamValue } from 'components/link-group/linkGroupUtils';

/** CMS `Size` when unset — equal columns. */
export const TWO_COLUMN_DEFAULT_SIZE = '50X50';

/**
 * Normalizes `Size` param (`50X50`, `70x30`, …) to `NNXMM` uppercase.
 *
 * @param raw - Value from `readTwoColumnSizeParam`
 */
export function normalizeTwoColumnSizeToken(raw: string | undefined): string {
  if (raw == null || raw === '') return TWO_COLUMN_DEFAULT_SIZE;
  const trimmed = raw.trim().toUpperCase().replace(/\s+/g, '');
  const match = /^(\d+)\s*X\s*(\d+)$/.exec(trimmed);
  if (!match) return TWO_COLUMN_DEFAULT_SIZE;
  return `${match[1]}X${match[2]}`;
}

/**
 * Reads `Size` rendering param using the nested `{ Value: { value } }` shape.
 *
 * @param params - Sitecore `params` record
 */
export function readTwoColumnSizeParam(
  params: Record<string, unknown> | undefined,
): string | undefined {
  return readLinkGroupParamValue(params, 'Size');
}

export type TwoColumnLayoutKey = '50X50' | '70X30' | '30X70';

/**
 * Maps normalized size token to a supported layout key; unknown ratios fall back to 50/50.
 *
 * @param normalized - Output of {@link normalizeTwoColumnSizeToken}
 */
export function resolveTwoColumnLayoutKey(normalized: string): TwoColumnLayoutKey {
  if (normalized === '70X30' || normalized === '30X70' || normalized === '50X50') {
    return normalized;
  }
  return '50X50';
}
