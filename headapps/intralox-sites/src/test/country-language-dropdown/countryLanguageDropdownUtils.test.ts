import { describe, it, expect } from 'vitest';
import {
  normalizeCountries,
  normalizeRouteDocuments,
  resolveInitialCountryCode,
  resolvePreferredLanguageIndex,
  resolveLanguageDocIndexFromPathname,
  resolveLanguageDocIndexFromSessionNav,
  resolveCountryCodeFromRouteSync,
  persistLastPdfOrExternalLanguageNav,
  clearLastPdfOrExternalLanguageNav,
  POLICY_STATEMENTS_LAST_LANGUAGE_NAV_STORAGE_KEY,
  normalizePathForCompare,
  isPdfLink,
  isExternalLink,
  type RawPolicyStatementsData,
  type RawRouteDocument,
} from 'components/country-language-dropdown/countryLanguageDropdownUtils';

// Actual data shape from Sitecore layout service.
const rawData: RawPolicyStatementsData = {
  CountryLabel: { value: 'Select your country or region:' },
  LanguageLabel: { value: 'Choose your language:' },
  Countries: {
    data: [
      {
        Country: { data: { Name: 'India', Code: { value: 'IN' } } },
        CountryLink: { path: '/support/policy-statements/india' },
      },
      {
        Country: { data: { Name: 'United States', Code: { value: 'US' } } },
        CountryLink: { path: '/support/policy-statements/united-states' },
      },
    ],
  },
};

// Data with multiple language variants per country.
const multiLanguageData: RawPolicyStatementsData = {
  CountryLabel: { value: 'Select your country or region:' },
  LanguageLabel: { value: 'Choose your language:' },
  Countries: {
    data: [
      {
        Country: { data: { Name: 'India', Code: { value: 'IN' } } },
        Language: { value: 'English' },
        CountryLink: { path: '/support/policy-statements/india/english' },
      },
      {
        Country: { data: { Name: 'India', Code: { value: 'IN' } } },
        Language: { value: 'Hindi' },
        CountryLink: { path: '/support/policy-statements/india/hindi' },
      },
      {
        Country: { data: { Name: 'United States', Code: { value: 'US' } } },
        CountryLink: { path: '/support/policy-statements/united-states' },
      },
    ],
  },
};

describe('normalizeCountries — single entry per country', () => {
  it('maps raw entries into normalized CountryItem[]', () => {
    const countries = normalizeCountries(rawData);
    expect(countries).toHaveLength(2);
    expect(countries[0]).toMatchObject({ name: 'India', code: 'IN' });
    expect(countries[1]).toMatchObject({ name: 'United States', code: 'US' });
  });

  it('maps CountryLink.path to document href', () => {
    const countries = normalizeCountries(rawData);
    expect(countries[0].documents[0].href).toBe('/support/policy-statements/india');
    expect(countries[1].documents[0].href).toBe('/support/policy-statements/united-states');
  });

  it('produces a single document per country with no language label', () => {
    const countries = normalizeCountries(rawData);
    expect(countries[0].documents).toHaveLength(1);
    expect(countries[0].documents[0].language).toBe('');
  });

  it('normalizes country codes to uppercase', () => {
    const countries = normalizeCountries({
      Countries: {
        data: [{ Country: { data: { Name: 'Test', Code: { value: 'de' } } }, CountryLink: { path: '/de' } }],
      },
    });
    expect(countries[0].code).toBe('DE');
  });

  it('filters out entries with no name', () => {
    const countries = normalizeCountries({
      Countries: {
        data: [{ Country: { data: { Name: '', Code: { value: 'US' } } }, CountryLink: { path: '/us' } }],
      },
    });
    expect(countries).toHaveLength(0);
  });

  it('filters out entries with no href', () => {
    const countries = normalizeCountries({
      Countries: {
        data: [{ Country: { data: { Name: 'France', Code: { value: 'FR' } } }, CountryLink: { path: '' } }],
      },
    });
    expect(countries).toHaveLength(0);
  });

  it('returns empty array when Countries data is missing', () => {
    expect(normalizeCountries(null)).toEqual([]);
    expect(normalizeCountries(undefined)).toEqual([]);
    expect(normalizeCountries({ Countries: null })).toEqual([]);
    expect(normalizeCountries({ Countries: { data: null } })).toEqual([]);
    expect(normalizeCountries({ Countries: { data: [] } })).toEqual([]);
  });
});

describe('normalizeCountries — multiple language entries per country', () => {
  it('groups multiple entries with same country code into one CountryItem', () => {
    const countries = normalizeCountries(multiLanguageData);
    expect(countries).toHaveLength(2);
    const india = countries.find((c) => c.code === 'IN');
    expect(india?.documents).toHaveLength(2);
  });

  it('preserves language labels on each document', () => {
    const countries = normalizeCountries(multiLanguageData);
    const india = countries.find((c) => c.code === 'IN')!;
    expect(india.documents[0]).toMatchObject({ language: 'English', href: '/support/policy-statements/india/english' });
    expect(india.documents[1]).toMatchObject({ language: 'Hindi', href: '/support/policy-statements/india/hindi' });
  });
});

describe('resolveInitialCountryCode', () => {
  const countries = normalizeCountries(rawData);

  it('returns server country code when it matches a country in the list', () => {
    expect(resolveInitialCountryCode(countries, 'US')).toBe('US');
  });

  it('is case-insensitive', () => {
    expect(resolveInitialCountryCode(countries, 'in')).toBe('IN');
  });

  it('falls back to CMS default when server code does not match', () => {
    expect(resolveInitialCountryCode(countries, 'DE', 'IN')).toBe('IN');
  });

  it('returns empty string when neither matches', () => {
    expect(resolveInitialCountryCode(countries, 'DE', 'FR')).toBe('');
  });

  it('returns empty string with empty list', () => {
    expect(resolveInitialCountryCode([], 'US')).toBe('');
  });
});

describe('resolvePreferredLanguageIndex', () => {
  const docs = [
    { id: 'd1', language: 'English', href: '/en' },
    { id: 'd2', language: 'Hindi', href: '/hi' },
  ];

  it('returns 0 for single document', () => {
    expect(resolvePreferredLanguageIndex([docs[0]], ['hi'])).toBe(0);
  });

  it('matches language subtag against document language', () => {
    expect(resolvePreferredLanguageIndex(docs, ['hi-IN'])).toBe(1);
  });

  it('returns 0 when no match found', () => {
    expect(resolvePreferredLanguageIndex(docs, ['fr-FR'])).toBe(0);
  });
});

describe('isPdfLink', () => {
  it('returns true for .pdf hrefs', () => {
    expect(isPdfLink('/docs/policy.pdf')).toBe(true);
    expect(isPdfLink('/docs/policy.PDF')).toBe(true);
  });

  it('returns false for page paths and empty strings', () => {
    expect(isPdfLink('/support/policy-statements/india')).toBe(false);
    expect(isPdfLink('')).toBe(false);
  });
});

describe('isExternalLink', () => {
  it('returns true for absolute http/https URLs', () => {
    expect(isExternalLink('https://example.com/policy.pdf')).toBe(true);
    expect(isExternalLink('http://example.com/page')).toBe(true);
  });

  it('returns false for internal Sitecore paths', () => {
    expect(isExternalLink('/support/policy-statements/india')).toBe(false);
    expect(isExternalLink('')).toBe(false);
  });
});

describe('normalizePathForCompare', () => {
  it('trims and strips trailing slashes except root', () => {
    expect(normalizePathForCompare('/foo/bar/')).toBe('/foo/bar');
    expect(normalizePathForCompare('  /x  ')).toBe('/x');
    expect(normalizePathForCompare('/')).toBe('/');
  });
});

describe('resolveLanguageDocIndexFromPathname', () => {
  const internalDocs = [
    { id: 'a', language: 'English', href: '/support/policy-statements/india/english' },
    { id: 'b', language: 'Hindi', href: '/support/policy-statements/india/hindi' },
  ] as const;

  it('matches when pathname and href differ only by a trailing slash', () => {
    const docs = [
      { id: 'a', language: 'English', href: '/support/policy-statements/india/english/' },
      { id: 'b', language: 'Hindi', href: '/support/policy-statements/india/hindi' },
    ];
    expect(resolveLanguageDocIndexFromPathname('/support/policy-statements/india/english', docs)).toBe(0);
    expect(resolveLanguageDocIndexFromPathname('/support/policy-statements/india/hindi/', docs)).toBe(1);
  });

  it('returns -1 for empty pathname or documents', () => {
    expect(resolveLanguageDocIndexFromPathname('', [...internalDocs])).toBe(-1);
    expect(resolveLanguageDocIndexFromPathname('/x', [])).toBe(-1);
  });

  it('returns the index on exact pathname match', () => {
    expect(
      resolveLanguageDocIndexFromPathname('/support/policy-statements/india/hindi', [...internalDocs]),
    ).toBe(1);
  });

  it('prefers the longest internal prefix when pathname is nested', () => {
    const nested = [
      { id: '1', language: 'Root', href: '/support/policy-statements/india' },
      { id: '2', language: 'English', href: '/support/policy-statements/india/english' },
    ];
    expect(
      resolveLanguageDocIndexFromPathname('/support/policy-statements/india/english/extra', nested),
    ).toBe(1);
  });

  it('does not treat a path as a prefix when the next character is not a slash', () => {
    expect(resolveLanguageDocIndexFromPathname('/support/policy-statements/indiana', [...internalDocs])).toBe(-1);
  });

  it('skips PDF and external hrefs', () => {
    const mixed = [
      { id: 'p', language: 'PDF', href: 'https://cdn.example.com/x.pdf' },
      { id: 'i', language: 'English', href: '/support/policy-statements/india/english' },
    ];
    expect(
      resolveLanguageDocIndexFromPathname('/support/policy-statements/india/english', mixed),
    ).toBe(1);
  });
});

describe('PDF / external return — sessionStorage helpers', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('persistLastPdfOrExternalLanguageNav writes a versioned payload', () => {
    persistLastPdfOrExternalLanguageNav('/support/policy-statements/india', 'https://cdn.example.com/x.pdf');
    const raw = sessionStorage.getItem(POLICY_STATEMENTS_LAST_LANGUAGE_NAV_STORAGE_KEY);
    expect(JSON.parse(raw!)).toEqual({
      v: 1,
      originPath: '/support/policy-statements/india',
      documentHref: 'https://cdn.example.com/x.pdf',
    });
  });

  it('resolveLanguageDocIndexFromSessionNav returns the matching index', () => {
    persistLastPdfOrExternalLanguageNav('/foo', 'https://cdn.example.com/a.pdf');
    const docs = [
      { id: '1', language: 'English', href: 'https://cdn.example.com/a.pdf' },
      { id: '2', language: 'Hindi', href: 'https://cdn.example.com/b.pdf' },
    ];
    expect(resolveLanguageDocIndexFromSessionNav('/foo', docs)).toBe(0);
  });

  it('resolveLanguageDocIndexFromSessionNav returns -1 when originPath differs', () => {
    persistLastPdfOrExternalLanguageNav('/foo', 'https://cdn.example.com/a.pdf');
    const docs = [{ id: '1', language: 'English', href: 'https://cdn.example.com/a.pdf' }];
    expect(resolveLanguageDocIndexFromSessionNav('/bar', docs)).toBe(-1);
  });

  it('resolveLanguageDocIndexFromSessionNav matches when pathname and stored origin differ by trailing slash', () => {
    persistLastPdfOrExternalLanguageNav('/support/policy-statements/india', 'https://cdn.example.com/a.pdf');
    const docs = [{ id: '1', language: 'English', href: 'https://cdn.example.com/a.pdf' }];
    expect(resolveLanguageDocIndexFromSessionNav('/support/policy-statements/india/', docs)).toBe(0);
  });

  it('clearLastPdfOrExternalLanguageNav removes the key', () => {
    persistLastPdfOrExternalLanguageNav('/foo', 'https://x');
    clearLastPdfOrExternalLanguageNav();
    expect(sessionStorage.getItem(POLICY_STATEMENTS_LAST_LANGUAGE_NAV_STORAGE_KEY)).toBeNull();
  });
});

// normalizeRouteDocuments

const sampleRouteDocs: RawRouteDocument[] = [
  {
    id: '21f34a1c-ac42-4974-8ada-a9a6538a314b',
    Language: { data: { LanguageValue: { value: 'English' } } },
    DocumentLink: {
      jsonValue: {
        href: 'https://cdn.example.com/india-english.pdf',
        target: '_blank',
      },
    },
  },
  {
    id: 'a0b1c2d3-0000-0000-0000-000000000000',
    Language: { data: { LanguageValue: { value: 'Hindi' } } },
    DocumentLink: {
      jsonValue: {
        href: 'https://cdn.example.com/india-hindi.pdf',
        target: '_blank',
      },
    },
  },
];

describe('normalizeRouteDocuments', () => {
  it('converts raw route docs into LanguageDocumentItem[]', () => {
    const docs = normalizeRouteDocuments(sampleRouteDocs);
    expect(docs).toHaveLength(2);
    expect(docs[0]).toMatchObject({
      id: '21f34a1c-ac42-4974-8ada-a9a6538a314b',
      language: 'English',
      href: 'https://cdn.example.com/india-english.pdf',
      target: '_blank',
    });
    expect(docs[1]).toMatchObject({ language: 'Hindi' });
  });

  it('filters out entries with no href', () => {
    const docs = normalizeRouteDocuments([
      { id: 'x', Language: { data: { LanguageValue: { value: 'French' } } }, DocumentLink: { jsonValue: { href: '' } } },
    ]);
    expect(docs).toHaveLength(0);
  });

  it('filters out entries with no DocumentLink', () => {
    const docs = normalizeRouteDocuments([
      { id: 'x', Language: { data: { LanguageValue: { value: 'French' } } } },
    ]);
    expect(docs).toHaveLength(0);
  });

  it('returns empty array for null / undefined / empty input', () => {
    expect(normalizeRouteDocuments(null)).toEqual([]);
    expect(normalizeRouteDocuments(undefined)).toEqual([]);
    expect(normalizeRouteDocuments([])).toEqual([]);
  });

  it('generates a fallback id when the entry has no id', () => {
    const docs = normalizeRouteDocuments([
      { DocumentLink: { jsonValue: { href: 'https://cdn.example.com/policy.pdf' } } },
    ]);
    expect(docs[0].id).toBe('route-doc-0');
  });
});

describe('resolveCountryCodeFromRouteSync', () => {
  it('matches the country using any language document path when server code is absent', () => {
    const countries = normalizeCountries(multiLanguageData);
    expect(
      resolveCountryCodeFromRouteSync(countries, '', '/support/policy-statements/india/hindi'),
    ).toBe('IN');
  });

  it('picks the longest matching document path when resolving from URL', () => {
    const countries = normalizeCountries(multiLanguageData);
    expect(
      resolveCountryCodeFromRouteSync(
        countries,
        '',
        '/support/policy-statements/india/english/subpage',
      ),
    ).toBe('IN');
  });
});

