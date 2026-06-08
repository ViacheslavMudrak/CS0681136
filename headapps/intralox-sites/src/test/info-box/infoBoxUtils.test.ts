import { describe, expect, it } from 'vitest';

import {
  resolveInfoBoxContext,
  isHideIconChecked,
  shouldShowInfoBoxIcon,
  INFOBOX_REGION_ARIA,
} from 'components/info-box/infoBoxUtils';

describe('resolveInfoBoxContext', () => {
  it('returns "info" for the string "info"', () => {
    expect(resolveInfoBoxContext({ value: 'info' })).toBe('info');
  });

  it('returns "info" for uppercase "INFO"', () => {
    expect(resolveInfoBoxContext({ value: 'INFO' })).toBe('info');
  });

  it('returns "success" for the string "success"', () => {
    expect(resolveInfoBoxContext({ value: 'success' })).toBe('success');
  });

  it('returns "success" for mixed-case "Success"', () => {
    expect(resolveInfoBoxContext({ value: 'Success' })).toBe('success');
  });

  it('returns "none" for an unrecognised string', () => {
    expect(resolveInfoBoxContext({ value: 'warning' })).toBe('none');
  });

  it('returns "none" for null input', () => {
    expect(resolveInfoBoxContext(null)).toBe('none');
  });

  it('returns "none" for undefined input', () => {
    expect(resolveInfoBoxContext(undefined)).toBe('none');
  });

  it('returns "none" for empty string', () => {
    expect(resolveInfoBoxContext({ value: '' })).toBe('none');
  });
});

describe('isHideIconChecked', () => {
  it('returns false for null', () => {
    expect(isHideIconChecked(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isHideIconChecked(undefined)).toBe(false);
  });

  it('returns true for boolean true', () => {
    expect(isHideIconChecked(true)).toBe(true);
  });

  it('returns false for boolean false', () => {
    expect(isHideIconChecked(false)).toBe(false);
  });

  it('returns true for string "1"', () => {
    expect(isHideIconChecked('1')).toBe(true);
  });

  it('returns true for string "true"', () => {
    expect(isHideIconChecked('true')).toBe(true);
  });

  it('returns true for string "yes"', () => {
    expect(isHideIconChecked('yes')).toBe(true);
  });

  it('returns false for string "false"', () => {
    expect(isHideIconChecked('false')).toBe(false);
  });

  it('returns false for string "0"', () => {
    expect(isHideIconChecked('0')).toBe(false);
  });

  it('returns true for object with value: true', () => {
    expect(isHideIconChecked({ value: true })).toBe(true);
  });

  it('returns false for object with value: false', () => {
    expect(isHideIconChecked({ value: false })).toBe(false);
  });

  it('returns true for object with value: "1"', () => {
    expect(isHideIconChecked({ value: '1' })).toBe(true);
  });

  it('returns true for object with value: "true"', () => {
    expect(isHideIconChecked({ value: 'true' })).toBe(true);
  });

  it('returns true for object with value: "yes"', () => {
    expect(isHideIconChecked({ value: 'yes' })).toBe(true);
  });

  it('returns false for object with value: "no"', () => {
    expect(isHideIconChecked({ value: 'no' })).toBe(false);
  });

  it('returns false for object with null value', () => {
    expect(isHideIconChecked({ value: null })).toBe(false);
  });
});

describe('shouldShowInfoBoxIcon', () => {
  it('returns false when context is "none"', () => {
    expect(shouldShowInfoBoxIcon('none', false)).toBe(false);
  });

  it('returns false when hideIcon is true for "info" context', () => {
    expect(shouldShowInfoBoxIcon('info', true)).toBe(false);
  });

  it('returns false when hideIcon is true for "success" context', () => {
    expect(shouldShowInfoBoxIcon('success', true)).toBe(false);
  });

  it('returns true for "info" context when hideIcon is false', () => {
    expect(shouldShowInfoBoxIcon('info', false)).toBe(true);
  });

  it('returns true for "success" context when hideIcon is false', () => {
    expect(shouldShowInfoBoxIcon('success', false)).toBe(true);
  });
});

describe('INFOBOX_REGION_ARIA', () => {
  it('provides aria labels for each context key', () => {
    expect(typeof INFOBOX_REGION_ARIA.info).toBe('string');
    expect(typeof INFOBOX_REGION_ARIA.success).toBe('string');
    expect(typeof INFOBOX_REGION_ARIA.none).toBe('string');
  });
});
