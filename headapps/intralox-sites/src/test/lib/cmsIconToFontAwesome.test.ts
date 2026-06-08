import { describe, it, expect } from 'vitest';

import {
  cmsIconIsOutlineCircleBadge,
  cmsIconToFontAwesome,
  OUTLINE_CIRCLE_CHEVRON_FA_CLASS,
} from 'lib/cms-icon-to-fontawesome';

describe('cmsIconToFontAwesome', () => {
  it('returns empty string for null input', () => {
    expect(cmsIconToFontAwesome(null)).toBe('');
  });

  it('returns empty string for undefined input', () => {
    expect(cmsIconToFontAwesome(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(cmsIconToFontAwesome('')).toBe('');
  });

  it('returns empty string for whitespace-only string', () => {
    expect(cmsIconToFontAwesome('   ')).toBe('');
  });

  it('passes through an already-valid FA class string (line 45)', () => {
    expect(cmsIconToFontAwesome('fa-solid fa-phone')).toBe('fa-solid fa-phone');
    expect(cmsIconToFontAwesome('fa-brands fa-youtube')).toBe('fa-brands fa-youtube');
  });

  it('converts a plain CMS icon name to FA class (lines 39, 47)', () => {
    expect(cmsIconToFontAwesome('phone')).toBe('fa-solid fa-phone');
    expect(cmsIconToFontAwesome('envelope')).toBe('fa-solid fa-envelope');
  });

  it('uses the custom style parameter', () => {
    expect(cmsIconToFontAwesome('globe', 'regular')).toBe('fa-regular fa-globe');
  });

  it('applies CMS_ICON_NAME_ALIASES (message-square stays message-square)', () => {
    expect(cmsIconToFontAwesome('message-square')).toBe('fa-solid fa-message-square');
  });

  it('maps Sitecore Image quick-link icon item to fa-image before Quick Link alias', () => {
    expect(cmsIconToFontAwesome('Image')).toBe('fa-solid fa-image');
  });

  it('applies CMS_ICON_NAME_ALIASES (mail → envelope)', () => {
    expect(cmsIconToFontAwesome('mail')).toBe('fa-solid fa-envelope');
    expect(cmsIconToFontAwesome('icon-call')).toBe('fa-solid fa-phone');
    expect(cmsIconToFontAwesome('icon-message-square')).toBe('fa-solid fa-message-square');
  });

  it('converts mixed case and spaces to kebab-case', () => {
    expect(cmsIconToFontAwesome('Arrow Right')).toBe('fa-solid fa-arrow-right');
  });
});

describe('cmsIconIsOutlineCircleBadge (lines 63-73)', () => {
  it('returns false for null/undefined/empty', () => {
    expect(cmsIconIsOutlineCircleBadge(null)).toBe(false);
    expect(cmsIconIsOutlineCircleBadge(undefined)).toBe(false);
    expect(cmsIconIsOutlineCircleBadge('')).toBe(false);
  });

  it('returns false for whitespace-only string', () => {
    expect(cmsIconIsOutlineCircleBadge('   ')).toBe(false);
  });

  it('detects circle chevron by FA class string (line 69)', () => {
    expect(cmsIconIsOutlineCircleBadge('fa-solid fa-circle-chevron-down')).toBe(true);
    expect(cmsIconIsOutlineCircleBadge('fa-regular fa-chevron-circle-down')).toBe(true);
  });

  it('returns false for non-circle FA class', () => {
    expect(cmsIconIsOutlineCircleBadge('fa-solid fa-phone')).toBe(false);
  });

  it('detects circle chevron by CMS key (line 72)', () => {
    expect(cmsIconIsOutlineCircleBadge('chevron-down-circle')).toBe(true);
    expect(cmsIconIsOutlineCircleBadge('chevron-circle-down')).toBe(true);
  });

  it('returns false for unrelated CMS key', () => {
    expect(cmsIconIsOutlineCircleBadge('phone')).toBe(false);
  });
});

describe('OUTLINE_CIRCLE_CHEVRON_FA_CLASS constant', () => {
  it('is the expected FA class', () => {
    expect(OUTLINE_CIRCLE_CHEVRON_FA_CLASS).toBe('fa-solid fa-chevron-down');
  });
});
