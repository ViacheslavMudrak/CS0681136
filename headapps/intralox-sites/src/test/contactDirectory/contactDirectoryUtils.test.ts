import { describe, expect, it } from 'vitest';

import {
  toKebabPathSegment,
  getPathSlugForCountry,
  countryMatchesPathSlug,
  buildCountryCodeToPathSlugMap,
  hrefForCountryName,
  formatCountryLabelForDisplay,
  stripWhiteSpace,
} from 'components/contactDirectory/ContactDirectory.utils';
import type { IContactDirectoryCountryFields } from 'components/contactDirectory/ContactDirectory.type';

function makeCountry(
  code: string,
  name: string,
  path?: string,
): IContactDirectoryCountryFields {
  return {
    Country: {
      data: {
        Code: { value: code },
        Name: name,
      },
    },
    CountryLink: path ? { path } : undefined,
  } as unknown as IContactDirectoryCountryFields;
}

describe('toKebabPathSegment', () => {
  it('lowercases and hyphenates a normal name', () => {
    expect(toKebabPathSegment('United States')).toBe('united-states');
  });

  it('trims leading/trailing whitespace', () => {
    expect(toKebabPathSegment('  Germany  ')).toBe('germany');
  });

  it('collapses multiple non-alphanumeric characters into a single hyphen', () => {
    expect(toKebabPathSegment('São Paulo!')).toBe('s-o-paulo');
  });

  it('strips leading and trailing hyphens', () => {
    expect(toKebabPathSegment('---test---')).toBe('test');
  });

  it('returns an empty string for a string with only special characters', () => {
    expect(toKebabPathSegment('!!!')).toBe('');
  });
});

describe('getPathSlugForCountry', () => {
  it('uses the last path segment of CountryLink.path when present', () => {
    const country = makeCountry('US', 'United States', '/support/phone-numbers/united-states');
    expect(getPathSlugForCountry(country)).toBe('united-states');
  });

  it('falls back to kebab-cased country name when CountryLink has no path', () => {
    const country = makeCountry('DE', 'Germany');
    expect(getPathSlugForCountry(country)).toBe('germany');
  });

  it('falls back to kebab country name when CountryLink path is empty string', () => {
    const country = makeCountry('FR', 'France', '');
    expect(getPathSlugForCountry(country)).toBe('france');
  });

  it('lowercases the path segment', () => {
    const country = makeCountry('BR', 'Brazil', '/support/phone-numbers/BRAZIL');
    expect(getPathSlugForCountry(country)).toBe('brazil');
  });
});

describe('countryMatchesPathSlug', () => {
  it('returns false when slug is undefined', () => {
    const country = makeCountry('US', 'United States', '/support/phone-numbers/united-states');
    expect(countryMatchesPathSlug(country, undefined)).toBe(false);
  });

  it('returns false when slug is empty string', () => {
    const country = makeCountry('US', 'United States', '/support/phone-numbers/united-states');
    expect(countryMatchesPathSlug(country, '')).toBe(false);
  });

  it('returns true when slug matches the path slug', () => {
    const country = makeCountry('US', 'United States', '/support/phone-numbers/united-states');
    expect(countryMatchesPathSlug(country, 'united-states')).toBe(true);
  });

  it('is case-insensitive for slug comparison', () => {
    const country = makeCountry('US', 'United States', '/support/phone-numbers/united-states');
    expect(countryMatchesPathSlug(country, 'United-States')).toBe(true);
  });

  it('returns true when slug matches the 2-letter country code', () => {
    const country = makeCountry('de', 'Germany');
    expect(countryMatchesPathSlug(country, 'de')).toBe(true);
  });

  it('returns false when slug is a 3-letter code (not 2-letter match)', () => {
    const country = makeCountry('DEU', 'Germany');
    expect(countryMatchesPathSlug(country, 'DEU')).toBe(false);
  });

  it('returns false when slug does not match path or code', () => {
    const country = makeCountry('US', 'United States', '/support/phone-numbers/united-states');
    expect(countryMatchesPathSlug(country, 'canada')).toBe(false);
  });
});

describe('buildCountryCodeToPathSlugMap', () => {
  it('builds a map from country code to path slug', () => {
    const countries = [
      makeCountry('US', 'United States', '/support/phone-numbers/united-states'),
      makeCountry('DE', 'Germany'),
    ];
    const map = buildCountryCodeToPathSlugMap(countries);
    expect(map['US']).toBe('united-states');
    expect(map['DE']).toBe('germany');
  });

  it('skips entries with no country code', () => {
    const countries = [makeCountry('', 'No Code Country')];
    const map = buildCountryCodeToPathSlugMap(countries);
    expect(Object.keys(map)).toHaveLength(0);
  });

  it('returns empty map for empty array', () => {
    expect(buildCountryCodeToPathSlugMap([])).toEqual({});
  });
});

describe('hrefForCountryName', () => {
  it('builds a support URL path for the given country segment', () => {
    expect(hrefForCountryName('united-states')).toBe('/support/phone-numbers/united-states');
  });

  it('handles segments without hyphens', () => {
    expect(hrefForCountryName('germany')).toBe('/support/phone-numbers/germany');
  });
});

describe('formatCountryLabelForDisplay', () => {
  it('replaces hyphens with spaces', () => {
    expect(formatCountryLabelForDisplay('united-states')).toBe('united states');
  });

  it('leaves names without hyphens unchanged', () => {
    expect(formatCountryLabelForDisplay('Germany')).toBe('Germany');
  });

  it('trims leading/trailing whitespace', () => {
    expect(formatCountryLabelForDisplay('  France  ')).toBe('France');
  });
});

describe('stripWhiteSpace', () => {
  it('replaces spaces with hyphens in phone numbers', () => {
    expect(stripWhiteSpace('+1 800 555 1234')).toBe('+1-800-555-1234');
  });

  it('handles strings with no whitespace', () => {
    expect(stripWhiteSpace('+18005551234')).toBe('+18005551234');
  });

  it('handles multiple consecutive spaces', () => {
    expect(stripWhiteSpace('1   2')).toBe('1-2');
  });
});
