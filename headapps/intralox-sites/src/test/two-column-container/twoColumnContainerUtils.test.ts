import { describe, expect, it } from 'vitest';

import {
  normalizeTwoColumnSizeToken,
  readTwoColumnSizeParam,
  resolveTwoColumnLayoutKey,
} from 'components/two-column-container/twoColumnContainerUtils';

describe('twoColumnContainerUtils', () => {
  it('normalizes casing and spacing for Size token', () => {
    expect(normalizeTwoColumnSizeToken('70x30')).toBe('70X30');
    expect(normalizeTwoColumnSizeToken(' 50 X 50 ')).toBe('50X50');
  });

  it('falls back to 50X50 for invalid Size', () => {
    expect(normalizeTwoColumnSizeToken('abc')).toBe('50X50');
  });

  it('reads Size from nested Sitecore param shape', () => {
    const params = {
      Size: { Value: { value: '30X70' } },
    };
    expect(readTwoColumnSizeParam(params)).toBe('30X70');
  });

  it('resolveTwoColumnLayoutKey maps known ratios only', () => {
    expect(resolveTwoColumnLayoutKey('70X30')).toBe('70X30');
    expect(resolveTwoColumnLayoutKey('99X1')).toBe('50X50');
  });
});
