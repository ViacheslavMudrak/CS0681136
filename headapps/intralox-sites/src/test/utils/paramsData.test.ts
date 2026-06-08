import { describe, it, expect } from 'vitest';

import {
  getDividerParams,
  getHeadingParams,
  getPositionParams,
  getRatioParams,
  getTextParams,
  parseAspectRatioToDecimal,
} from 'src/utils/paramsData';

describe('parseAspectRatioToDecimal', () => {
  it('returns undefined for undefined input', () => {
    expect(parseAspectRatioToDecimal(undefined)).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(parseAspectRatioToDecimal('')).toBeUndefined();
  });

  it('returns undefined when parts count is not 2 (line 77 branch)', () => {
    expect(parseAspectRatioToDecimal('16')).toBeUndefined();
    expect(parseAspectRatioToDecimal('16:9:4')).toBeUndefined();
  });

  it('returns undefined when width is non-finite (line 79)', () => {
    expect(parseAspectRatioToDecimal('abc:9')).toBeUndefined();
  });

  it('returns undefined when height is non-finite (line 79)', () => {
    expect(parseAspectRatioToDecimal('16:xyz')).toBeUndefined();
  });

  it('returns undefined when width is zero or negative (line 79)', () => {
    expect(parseAspectRatioToDecimal('0:9')).toBeUndefined();
    expect(parseAspectRatioToDecimal('-16:9')).toBeUndefined();
  });

  it('returns correct decimal ratio for valid aspect ratio', () => {
    expect(parseAspectRatioToDecimal('16:9')).toBeCloseTo(9 / 16);
    expect(parseAspectRatioToDecimal('4:3')).toBeCloseTo(3 / 4);
    expect(parseAspectRatioToDecimal('1:1')).toBe(1);
  });
});

describe('getRatioParams', () => {
  it('returns undefined when params is undefined', () => {
    expect(getRatioParams(undefined)).toBeUndefined();
  });

  it('reads PreferredRatio when set (line 109 first branch)', () => {
    const result = getRatioParams({
      PreferredRatio: { Value: { value: '16:9' } },
    });
    expect(result?.ratio).toBeCloseTo(9 / 16);
  });

  it('falls back to MediaRatio when PreferredRatio is absent (line 109 second branch)', () => {
    const result = getRatioParams({
      MediaRatio: { Value: { value: '4:3' } },
    });
    expect(result?.ratio).toBeCloseTo(3 / 4);
  });

  it('returns ratio undefined when neither param is set', () => {
    const result = getRatioParams({});
    expect(result?.ratio).toBeUndefined();
  });
});

describe('getHeadingParams', () => {
  it('returns undefined when params is undefined', () => {
    expect(getHeadingParams(undefined)).toBeUndefined();
  });

  it('returns heading size/width/tag when set', () => {
    const result = getHeadingParams({
      HeadlineSize: { Value: { value: 'Large' } },
      HeadlineWidth: { Value: { value: 'Full' } },
      HeadlineLevel: { Value: { value: 'H2' } },
    });
    expect(result?.size).toBe('large');
    expect(result?.width).toBe('full');
    expect(result?.tag).toBe('h2');
  });
});

describe('getTextParams', () => {
  it('returns undefined when params is undefined', () => {
    expect(getTextParams(undefined)).toBeUndefined();
  });

  it('returns text alignment and position fields', () => {
    const result = getTextParams({
      TextAlignment: { Value: { value: 'Center' } },
      TextPosition: { Value: { value: 'Left' } },
      VerticalPosition: { Value: { value: 'Top' } },
      TextWidth: { Value: { value: 'Wide' } },
      TextSize: { Value: { value: 'Large' } },
    });
    expect(result?.textAlignment).toBe('center');
    expect(result?.textPosition).toBe('left');
    expect(result?.textVerticalPosition).toBe('top');
    expect(result?.width).toBe('wide');
    expect(result?.size).toBe('large');
  });
});

describe('getPositionParams', () => {
  it('returns undefined when params is undefined', () => {
    expect(getPositionParams(undefined)).toBeUndefined();
  });

  it('returns vertical position', () => {
    const result = getPositionParams({
      VerticalPosition: { Value: { value: 'Bottom' } },
    });
    expect(result?.vertical).toBe('bottom');
  });
});

describe('getDividerParams', () => {
  it('returns undefined when params is undefined', () => {
    expect(getDividerParams(undefined)).toBeUndefined();
  });

  it('returns divider type', () => {
    const result = getDividerParams({
      Divider: { Value: { value: 'fade' } },
    });
    expect(result?.divider).toBe('fade');
  });
});
