import { describe, it, expect } from 'vitest';
import { I18N, isValidI18N } from 'src/lib/dictionary-keys';

describe('dictionary-keys', () => {
  it('isValidI18N returns true for enum values', () => {
    expect(isValidI18N(I18N.READMORE)).toBe(true);
    expect(isValidI18N(I18N.CASESTUDY)).toBe(true);
  });

  it('isValidI18N returns false for unknown keys', () => {
    expect(isValidI18N('UNKNOWN')).toBe(false);
  });
});
