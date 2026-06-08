import { describe, it, expect } from 'vitest';
import {
  extractPolicyStatementsData,
  extractRouteData,
  readCountryLabel,
  readLanguageLabel,
  readRouteCountryCode,
  readLayoutRouteCountryCode,
  normalizeLayoutRouteDocuments,
} from 'components/policy-statements/policyStatementsUtils';
import type { PolicyStatementsFields, RouteData } from 'components/policy-statements/PolicyStatements.type';

const sampleFields: PolicyStatementsFields = {
  data: {
    PolicyStatementsData: {
      CountryLabel: { value: 'Select your country or region:' },
      LanguageLabel: { value: 'Choose your language:' },
      Countries: { data: [] },
    },
  },
};

describe('extractPolicyStatementsData', () => {
  it('extracts the data bag from the GraphQL wrapper', () => {
    const data = extractPolicyStatementsData(sampleFields);
    expect(data?.CountryLabel?.value).toBe('Select your country or region:');
  });

  it('returns null when fields is null', () => {
    expect(extractPolicyStatementsData(null)).toBeNull();
    expect(extractPolicyStatementsData(undefined)).toBeNull();
  });

  it('returns null when data is missing', () => {
    expect(extractPolicyStatementsData({})).toBeNull();
  });
});

describe('readCountryLabel', () => {
  it('returns the CountryLabel value', () => {
    const data = extractPolicyStatementsData(sampleFields);
    expect(readCountryLabel(data)).toBe('Select your country or region:');
  });

  it('returns empty string when data is null', () => {
    expect(readCountryLabel(null)).toBe('');
  });
});

describe('readLanguageLabel', () => {
  it('returns the LanguageLabel value', () => {
    const data = extractPolicyStatementsData(sampleFields);
    expect(readLanguageLabel(data)).toBe('Choose your language:');
  });

  it('returns empty string when data is null', () => {
    expect(readLanguageLabel(null)).toBe('');
  });
});

// Route data helpers

const fieldsWithRouteData: PolicyStatementsFields = {
  data: {
    PolicyStatementsData: {
      CountryLabel: { value: 'Select your country or region:' },
      LanguageLabel: { value: 'Choose your language:' },
      Countries: { data: [] },
    },
    RouteData: {
      CurrentCountry: {
        data: { Code: { value: 'IN' } },
      },
      Documents: {
        data: [
          {
            id: 'doc-1',
            Language: { data: { LanguageValue: { value: 'English' } } },
            DocumentLink: { jsonValue: { href: 'https://cdn.example.com/india-en.pdf', target: '_blank' } },
          },
        ],
      },
    },
  },
};

describe('extractRouteData', () => {
  it('extracts the RouteData bag from fields', () => {
    const routeData = extractRouteData(fieldsWithRouteData);
    expect(routeData).not.toBeNull();
    expect(routeData?.CurrentCountry?.data?.Code?.value).toBe('IN');
  });

  it('returns null when RouteData is absent', () => {
    expect(extractRouteData(sampleFields)).toBeNull();
  });

  it('returns null when fields is null or undefined', () => {
    expect(extractRouteData(null)).toBeNull();
    expect(extractRouteData(undefined)).toBeNull();
  });
});

describe('readRouteCountryCode', () => {
  it('returns the ISO country code from route data', () => {
    const routeData = extractRouteData(fieldsWithRouteData) as RouteData;
    expect(readRouteCountryCode(routeData)).toBe('IN');
  });

  it('returns empty string when route data is null', () => {
    expect(readRouteCountryCode(null)).toBe('');
    expect(readRouteCountryCode(undefined)).toBe('');
  });

  it('returns empty string when CurrentCountry is absent', () => {
    const routeData: RouteData = { CurrentCountry: null };
    expect(readRouteCountryCode(routeData)).toBe('');
  });
});

// Layout Service (REST) route field helpers

/** Mirrors the Sitecore Layout Service shape from the dataset provided by the user. */
const layoutRouteFields: Record<string, unknown> = {
  Country: {
    fields: {
      Code: { value: 'IN' },
      Name: { value: 'India' },
    },
  },
  Documents: [
    {
      id: '21f34a1c-ac42-4974-8ada-a9a6538a314b',
      fields: {
        Language: {
          fields: {
            Value: { value: 'English' },
          },
        },
        DocumentLink: {
          value: {
            href: 'https://cdn.example.com/india-en.pdf',
            target: '_blank',
          },
        },
      },
    },
    {
      id: 'bbbbbbbb-0000-0000-0000-000000000000',
      fields: {
        Language: {
          fields: {
            Value: { value: 'Hindi' },
          },
        },
        DocumentLink: {
          value: {
            href: 'https://cdn.example.com/india-hi.pdf',
            target: '_blank',
          },
        },
      },
    },
  ],
};

describe('readLayoutRouteCountryCode', () => {
  it('returns the ISO code from the Layout Service Country field', () => {
    expect(readLayoutRouteCountryCode(layoutRouteFields)).toBe('IN');
  });

  it('returns empty string when Country field is absent', () => {
    expect(readLayoutRouteCountryCode({})).toBe('');
    expect(readLayoutRouteCountryCode(null)).toBe('');
    expect(readLayoutRouteCountryCode(undefined)).toBe('');
  });
});

describe('normalizeLayoutRouteDocuments', () => {
  it('converts Layout Service Documents into LanguageDocumentItem[]', () => {
    const docs = normalizeLayoutRouteDocuments(layoutRouteFields);
    expect(docs).toHaveLength(2);
    expect(docs[0]).toMatchObject({
      id: '21f34a1c-ac42-4974-8ada-a9a6538a314b',
      language: 'English',
      href: 'https://cdn.example.com/india-en.pdf',
      target: '_blank',
    });
    expect(docs[1]).toMatchObject({ language: 'Hindi' });
  });

  it('filters out entries with no DocumentLink href', () => {
    const docs = normalizeLayoutRouteDocuments({
      Documents: [
        { id: 'x', fields: { Language: { fields: { Value: { value: 'French' } } }, DocumentLink: { value: { href: '' } } } },
      ],
    });
    expect(docs).toHaveLength(0);
  });

  it('returns empty array when Documents is absent or empty', () => {
    expect(normalizeLayoutRouteDocuments({})).toEqual([]);
    expect(normalizeLayoutRouteDocuments(null)).toEqual([]);
    expect(normalizeLayoutRouteDocuments(undefined)).toEqual([]);
    expect(normalizeLayoutRouteDocuments({ Documents: [] })).toEqual([]);
  });
});
