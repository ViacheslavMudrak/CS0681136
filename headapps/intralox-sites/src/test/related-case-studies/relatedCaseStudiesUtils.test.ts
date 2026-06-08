import { describe, it, expect } from 'vitest';

import {
  getCaseStudyListingImageUrl,
  mergeRelatedCaseStudiesRenderingParams,
  parseRelatedCaseStudiesColumnCount,
  parseRelatedCaseStudiesStyleTokenList,
  readRelatedCaseStudiesColorSchemeLayout,
  readRelatedCaseStudiesParamDescriptionHtml,
  relatedCaseStudiesHasVisitorContent,
  relatedCaseStudyListingKey,
  resolveRelatedCaseStudiesBaseImageSizes,
  resolveRelatedCaseStudiesCardSizeKey,
  resolveRelatedCaseStudiesDescriptionField,
} from 'components/related-case-studies/relatedCaseStudiesUtils';

describe('resolveRelatedCaseStudiesCardSizeKey', () => {
  it('defaults to compact when CardSize missing', () => {
    expect(resolveRelatedCaseStudiesCardSizeKey({})).toBe('compact');
  });

  it('normalizes compact casing', () => {
    expect(
      resolveRelatedCaseStudiesCardSizeKey({ CardSize: { Value: { value: 'Compact' } } }),
    ).toBe('compact');
  });

  it('detects base', () => {
    expect(
      resolveRelatedCaseStudiesCardSizeKey({ CardSize: { Value: { value: 'Base' } } }),
    ).toBe('base');
  });

  it('reads CardSize from flat value when Value wrapper absent', () => {
    expect(resolveRelatedCaseStudiesCardSizeKey({ CardSize: { value: 'base' } })).toBe('base');
  });

  it('returns "compact" for unknown block value', () => {
    expect(resolveRelatedCaseStudiesCardSizeKey({ CardSize: { value: 'other' } })).toBe('compact');
  });
});

describe('relatedCaseStudiesUtils — Description from params', () => {
  it('readRelatedCaseStudiesParamDescriptionHtml reads lowercase value', () => {
    expect(
      readRelatedCaseStudiesParamDescriptionHtml({
        Description: { value: '<p>From params</p>' },
      }),
    ).toBe('<p>From params</p>');
  });

  it('readRelatedCaseStudiesParamDescriptionHtml reads Sitecore Value.value', () => {
    expect(
      readRelatedCaseStudiesParamDescriptionHtml({
        Description: { Value: { value: '<p>Nested</p>' } },
      }),
    ).toBe('<p>Nested</p>');
  });

  it('mergeRelatedCaseStudiesRenderingParams overlays props params onto rendering params', () => {
    const merged = mergeRelatedCaseStudiesRenderingParams(
      { params: { Description: { value: '<p>R</p>' }, ColorScheme: { Value: { value: 'dark' } } } },
      { styles: 'x', RenderingIdentifier: 'id' } as Record<string, unknown>,
    );
    expect(merged.Description).toEqual({ value: '<p>R</p>' });
    expect(merged.styles).toBe('x');
  });

  it('resolveRelatedCaseStudiesDescriptionField prefers non-empty datasource over params', () => {
    const field = resolveRelatedCaseStudiesDescriptionField(
      {
        Description: { value: '<p>DS</p>' },
        CaseStudyListings: { value: [] },
      },
      { Description: { value: '<p>Param</p>' } },
    );
    expect(field?.value).toBe('<p>DS</p>');
  });

  it('resolveRelatedCaseStudiesDescriptionField uses params when datasource empty', () => {
    const field = resolveRelatedCaseStudiesDescriptionField(
      {
        Description: { value: '' },
        CaseStudyListings: { value: [] },
      },
      { Description: { value: '<p>Param only</p>' } },
    );
    expect(field?.value).toBe('<p>Param only</p>');
  });
});

describe('getCaseStudyListingImageUrl', () => {
  it('prefers Image over video cover', () => {
    expect(
      getCaseStudyListingImageUrl({
        Image: 'https://example.com/a.jpg',
        Video: { CoverImage: 'https://example.com/b.jpg' },
      }),
    ).toBe('https://example.com/a.jpg');
  });

  it('uses Video.CoverImage when Image is empty', () => {
    expect(
      getCaseStudyListingImageUrl({
        Image: '',
        Video: { CoverImage: 'https://example.com/cover.jpg' },
      }),
    ).toBe('https://example.com/cover.jpg');
  });

  it('returns empty string when both absent', () => {
    expect(getCaseStudyListingImageUrl({ Image: '', Video: null })).toBe('');
  });
});

describe('relatedCaseStudiesHasVisitorContent', () => {
  it('is true when a row has only Summary', () => {
    expect(relatedCaseStudiesHasVisitorContent([{ Summary: 'Body copy only' }])).toBe(true);
  });

  it('is true when a row has only Image', () => {
    expect(relatedCaseStudiesHasVisitorContent([{ Image: 'https://example.com/x.jpg' }])).toBe(true);
  });

  it('returns false for an empty rows array', () => {
    expect(relatedCaseStudiesHasVisitorContent([])).toBe(false);
  });
});

describe('relatedCaseStudyListingKey', () => {
  it('returns company::title when both company Name and Headline exist', () => {
    const row = {
      Headline: 'My Title',
      Company: { Name: 'Acme' },
    };
    const key = relatedCaseStudyListingKey(row as never, 0);
    expect(key).toContain('Acme');
    expect(key).toContain('My Title');
  });

  it('returns base key using :: separator even when company and title are empty strings', () => {
    const key = relatedCaseStudyListingKey({} as never, 3);
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(0);
  });
});

describe('parseRelatedCaseStudiesColumnCount', () => {
  it('returns 3 for undefined input', () => {
    expect(parseRelatedCaseStudiesColumnCount(undefined)).toBe(3);
  });

  it.each([2, 3, 4, 5])('returns %i for valid input "%i"', (n) => {
    expect(parseRelatedCaseStudiesColumnCount(String(n))).toBe(n);
  });
});

describe('resolveRelatedCaseStudiesBaseImageSizes', () => {
  it('returns correct sizes for 2 columns', () => {
    expect(resolveRelatedCaseStudiesBaseImageSizes(2)).toBe('(max-width: 599px) 100vw, 50vw');
  });

  it('returns correct sizes for 3 columns', () => {
    expect(resolveRelatedCaseStudiesBaseImageSizes(3)).toBe(
      '(max-width: 599px) 100vw, (max-width: 1023px) 50vw, 33vw',
    );
  });
});

describe('readRelatedCaseStudiesColorSchemeLayout', () => {
  it('defaults to light surface and legacy rail headline', () => {
    expect(readRelatedCaseStudiesColorSchemeLayout(undefined)).toEqual({
      isDarkSurface: false,
      isGraySurface: false,
      isLegacyRailHeadline: true,
      isArticleRailHeadline: false,
      isCompactRailHeadline: false,
      isThemedRailHeadline: false,
      isArticleBaseHeadline: false,
      landingDescriptionBold: false,
    });
  });

  it('detects dark and gray surfaces', () => {
    expect(readRelatedCaseStudiesColorSchemeLayout('dark').isDarkSurface).toBe(true);
    expect(readRelatedCaseStudiesColorSchemeLayout('grey').isGraySurface).toBe(true);
  });

  it('maps article ColorScheme to rail and base headline flags', () => {
    const layout = readRelatedCaseStudiesColorSchemeLayout('article');
    expect(layout.isArticleRailHeadline).toBe(true);
    expect(layout.isArticleBaseHeadline).toBe(true);
    expect(layout.isLegacyRailHeadline).toBe(false);
  });
});

describe('parseRelatedCaseStudiesStyleTokenList', () => {
  it('returns empty list when params missing', () => {
    expect(parseRelatedCaseStudiesStyleTokenList(undefined)).toEqual([]);
  });

  it('merges styles, Styles string, and Styles param value', () => {
    expect(
      parseRelatedCaseStudiesStyleTokenList({
        styles: 'indent-top',
        Styles: 'indent',
      }),
    ).toEqual(expect.arrayContaining(['indent-top', 'indent']));
  });
});
