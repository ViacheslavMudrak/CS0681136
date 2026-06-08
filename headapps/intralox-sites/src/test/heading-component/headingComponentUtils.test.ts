import { describe, it, expect } from 'vitest';

import {
  resolveHeadingColorKey,
  resolveHeadingLevelNumber,
  resolveHeadingSemanticTag,
  resolveHeadingTextAlignKey,
} from 'components/heading-component/headingComponentUtils';

describe('headingComponentUtils', () => {
  it('resolveHeadingSemanticTag defaults to h2', () => {
    expect(resolveHeadingSemanticTag(undefined)).toBe('h2');
    expect(resolveHeadingSemanticTag('')).toBe('h2');
    expect(resolveHeadingSemanticTag('invalid')).toBe('h2');
  });

  it('resolveHeadingSemanticTag normalizes H3 and numeric levels', () => {
    expect(resolveHeadingSemanticTag('H3')).toBe('h3');
    expect(resolveHeadingSemanticTag('3')).toBe('h3');
  });

  it('resolveHeadingLevelNumber maps h6 to 6', () => {
    expect(resolveHeadingLevelNumber('h6')).toBe(6);
  });

  it('resolveHeadingColorKey maps grey and cyan', () => {
    expect(resolveHeadingColorKey('Grey')).toBe('gray');
    expect(resolveHeadingColorKey('Cyan')).toBe('cyan');
  });

  it('resolveHeadingTextAlignKey handles centre spelling', () => {
    expect(resolveHeadingTextAlignKey('Centre')).toBe('center');
  });
});
