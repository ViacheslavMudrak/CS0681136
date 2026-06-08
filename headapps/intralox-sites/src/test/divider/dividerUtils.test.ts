import { describe, expect, it } from 'vitest';

import {
  getCheckboxValue,
  getFieldStringValue,
  resolveDividerWidthPercent,
} from 'components/divider/dividerUtils';

describe('getFieldStringValue', () => {
  it('returns empty string for null/undefined', () => {
    expect(getFieldStringValue(null)).toBe('');
    expect(getFieldStringValue(undefined)).toBe('');
  });

  it('returns raw string as-is', () => {
    expect(getFieldStringValue('line')).toBe('line');
  });

  it('reads Field.value wrapper', () => {
    expect(getFieldStringValue({ value: 'large' })).toBe('large');
  });

  it('reads jsonValue.value (GraphQL shape)', () => {
    expect(getFieldStringValue({ jsonValue: { value: 'none' } })).toBe('none');
  });

  it('reads droplist item fields.Value.value', () => {
    expect(
      getFieldStringValue({
        fields: { Value: { value: 'center' } },
      }),
    ).toBe('center');
  });

  it('reads droplist item Fields.Value.value (PascalCase)', () => {
    expect(
      getFieldStringValue({
        Fields: { Value: { value: '30' } },
      }),
    ).toBe('30');
  });

  it('coerces numeric field and droplist values to string', () => {
    expect(getFieldStringValue({ value: 30 })).toBe('30');
    expect(
      getFieldStringValue({
        fields: { Value: { value: 45 } },
      }),
    ).toBe('45');
  });

  it('reads droplist nested only under jsonValue (GraphQL reference shape)', () => {
    expect(
      getFieldStringValue({
        jsonValue: {
          fields: { Value: { value: '60' } },
        },
      }),
    ).toBe('60');
  });

  it('falls back to name', () => {
    expect(getFieldStringValue({ name: 'line' })).toBe('line');
  });
});

describe('resolveDividerWidthPercent', () => {
  it('returns null for full width (empty, full, 100)', () => {
    expect(resolveDividerWidthPercent('')).toBeNull();
    expect(resolveDividerWidthPercent('   ')).toBeNull();
    expect(resolveDividerWidthPercent('Full')).toBeNull();
    expect(resolveDividerWidthPercent('full')).toBeNull();
    expect(resolveDividerWidthPercent('100')).toBeNull();
  });

  it('returns null for values outside 10–90', () => {
    expect(resolveDividerWidthPercent('5')).toBeNull();
    expect(resolveDividerWidthPercent('95')).toBeNull();
    expect(resolveDividerWidthPercent('not-a-number')).toBeNull();
  });

  it('parses 10–90 inclusive', () => {
    expect(resolveDividerWidthPercent('10')).toBe(10);
    expect(resolveDividerWidthPercent('30')).toBe(30);
    expect(resolveDividerWidthPercent('90')).toBe(90);
  });

  it('strips a trailing percent sign', () => {
    expect(resolveDividerWidthPercent('30%')).toBe(30);
  });
});

describe('getCheckboxValue', () => {
  it('defaults to true when value is null/undefined', () => {
    expect(getCheckboxValue(null)).toBe(true);
    expect(getCheckboxValue(undefined)).toBe(true);
  });

  it('returns boolean as-is', () => {
    expect(getCheckboxValue(true)).toBe(true);
    expect(getCheckboxValue(false)).toBe(false);
  });

  it('treats falsey string tokens as off', () => {
    expect(getCheckboxValue('0')).toBe(false);
    expect(getCheckboxValue('false')).toBe(false);
    expect(getCheckboxValue('no')).toBe(false);
    expect(getCheckboxValue('')).toBe(false);
  });

  it('treats other strings as on', () => {
    expect(getCheckboxValue('1')).toBe(true);
    expect(getCheckboxValue('yes')).toBe(true);
  });

  it('unwraps Field.value object', () => {
    expect(getCheckboxValue({ value: false })).toBe(false);
    expect(getCheckboxValue({ value: '0' })).toBe(false);
  });
});
