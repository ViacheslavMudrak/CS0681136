import { describe, expect, it } from 'vitest';

import {
  stripFeaturedNewsSummaryHtml,
  resolveArticleThumbnailUrl,
  extractArticleListings,
  getArticleListingUrl,
  featuredNewsListingKey,
  featuredNewsHasVisitorContent,
} from 'components/featured-news/featuredNewsUtils';
import type { FeaturedNewsArticleRow } from 'components/featured-news/FeaturedNews.type';

describe('stripFeaturedNewsSummaryHtml', () => {
  it('returns empty string for null', () => {
    expect(stripFeaturedNewsSummaryHtml(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(stripFeaturedNewsSummaryHtml(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(stripFeaturedNewsSummaryHtml('')).toBe('');
  });

  it('strips HTML tags and normalizes whitespace', () => {
    expect(stripFeaturedNewsSummaryHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
  });

  it('returns plain text unchanged', () => {
    expect(stripFeaturedNewsSummaryHtml('Plain text')).toBe('Plain text');
  });
});

describe('resolveArticleThumbnailUrl', () => {
  it('returns undefined when no image or video cover', () => {
    expect(resolveArticleThumbnailUrl({} as FeaturedNewsArticleRow)).toBeUndefined();
  });

  it('returns the hero Image URL when present', () => {
    const row = { Image: '/images/hero.jpg' } as FeaturedNewsArticleRow;
    expect(resolveArticleThumbnailUrl(row)).toBe('/images/hero.jpg');
  });

  it('falls back to video CoverImage when Image is absent', () => {
    const row = {
      Video: { CoverImage: '/images/cover.jpg' },
    } as FeaturedNewsArticleRow;
    expect(resolveArticleThumbnailUrl(row)).toBe('/images/cover.jpg');
  });

  it('returns undefined when Image is empty string and no video cover', () => {
    const row = { Image: '' } as FeaturedNewsArticleRow;
    expect(resolveArticleThumbnailUrl(row)).toBeUndefined();
  });
});

describe('extractArticleListings', () => {
  it('returns empty array for null', () => {
    expect(extractArticleListings(null as never)).toEqual([]);
  });

  it('returns empty array for undefined', () => {
    expect(extractArticleListings(undefined as never)).toEqual([]);
  });

  it('accepts a bare array of rows', () => {
    const rows = [{ Title: 'Article 1' }] as FeaturedNewsArticleRow[];
    expect(extractArticleListings(rows as never)).toHaveLength(1);
  });

  it('filters out null entries from bare array', () => {
    const rows = [null, { Title: 'A' }, null] as unknown as FeaturedNewsArticleRow[];
    expect(extractArticleListings(rows as never)).toHaveLength(1);
  });

  it('unwraps { value: [...] } shape from Edge', () => {
    const node = { value: [{ Title: 'Edge Article' }] };
    expect(extractArticleListings(node as never)).toHaveLength(1);
  });

  it('returns empty array when value is not an array', () => {
    expect(extractArticleListings({ value: null } as never)).toEqual([]);
  });

  it('filters out null entries from value array', () => {
    const node = { value: [null, { Title: 'A' }] };
    expect(extractArticleListings(node as never)).toHaveLength(1);
  });
});

describe('getArticleListingUrl', () => {
  it('returns PascalCase Url field when present', () => {
    const row = { Url: '/news/article-1' } as FeaturedNewsArticleRow;
    expect(getArticleListingUrl(row)).toBe('/news/article-1');
  });

  it('falls back to camelCase url when Url is absent', () => {
    const row = { url: '/news/article-2' } as FeaturedNewsArticleRow;
    expect(getArticleListingUrl(row)).toBe('/news/article-2');
  });

  it('returns empty string when both are absent', () => {
    expect(getArticleListingUrl({} as FeaturedNewsArticleRow)).toBe('');
  });

  it('returns empty string when both Url and url are empty', () => {
    const row = { Url: '', url: '' } as FeaturedNewsArticleRow;
    expect(getArticleListingUrl(row)).toBe('');
  });
});

describe('featuredNewsListingKey', () => {
  it('builds a key from PostDate and Title', () => {
    const row = { Title: 'Summit', PostDate: '2026-04-27' } as FeaturedNewsArticleRow;
    expect(featuredNewsListingKey(row, 0)).toBe('2026-04-27::Summit');
  });

  it('returns the "::" base when both title and postDate are absent (colons only)', () => {
    const result = featuredNewsListingKey({} as FeaturedNewsArticleRow, 5);
    expect(result).toBe('::');
  });
});

describe('featuredNewsHasVisitorContent', () => {
  it('returns false for empty listings array', () => {
    expect(featuredNewsHasVisitorContent([])).toBe(false);
  });

  it('returns true when a listing has a non-empty title', () => {
    const listings = [{ Title: 'News Article' }] as FeaturedNewsArticleRow[];
    expect(featuredNewsHasVisitorContent(listings)).toBe(true);
  });
});
