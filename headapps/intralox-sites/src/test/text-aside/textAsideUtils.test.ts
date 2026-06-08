import { describe, expect, it } from 'vitest';

import {
  getTextAsideGridTemplateColumns,
  hasVisibleVideoReference,
  isTextAsideDividerEnabled,
  isTextAsidePlaceholderEnabled,
  isTextAsidePreferLeft,
  normalizeAsideWidthLabel,
  shouldRenderTextAsideAsideContent,
  shouldTextAsidePreferAsidePlaceholderOverFields,
  shouldTextAsidePreferTextPlaceholderOverFields,
  normalizeTextAsideVideoField,
  resolveTextAsideDividerParam,
  resolveTextAsideMediaTypeLabel,
  resolveTextAndAsideLayoutFields,
} from 'components/text-aside/textAsideUtils';

describe('normalizeAsideWidthLabel', () => {
  it('maps CMS variants to 40% or 50%', () => {
    expect(normalizeAsideWidthLabel('40%')).toBe('40%');
    expect(normalizeAsideWidthLabel('40')).toBe('40%');
    expect(normalizeAsideWidthLabel(' 40 ')).toBe('40%');
    expect(normalizeAsideWidthLabel('50%')).toBe('50%');
    expect(normalizeAsideWidthLabel('50')).toBe('50%');
    expect(normalizeAsideWidthLabel(undefined)).toBe('50%');
    expect(normalizeAsideWidthLabel('')).toBe('50%');
  });
});

describe('resolveTextAndAsideLayoutFields', () => {
  it('returns null when GraphQL envelope has no datasource', () => {
    expect(resolveTextAndAsideLayoutFields({ data: {} })).toBeNull();
    expect(resolveTextAndAsideLayoutFields({ data: { datasource: undefined } })).toBeNull();
    expect(resolveTextAndAsideLayoutFields({ data: { datasource: null as never } })).toBeNull();
  });

  it('merges jsonValue fields from data.datasource', () => {
    const merged = resolveTextAndAsideLayoutFields({
      data: {
        datasource: {
          title: { jsonValue: { value: 'From GraphQL' } },
          description: { jsonValue: { value: '<p>Body</p>' } },
          hasTextContentPlaceholder: { jsonValue: { value: false } },
          hasAsideContentPlaceholder: { jsonValue: { value: false } },
        },
      },
    });
    expect(merged?.Title?.value).toBe('From GraphQL');
    expect(merged?.Description?.value).toBe('<p>Body</p>');
    expect(merged).not.toHaveProperty('data');
  });

  it('prefers datasource jsonValue over root when both exist', () => {
    const merged = resolveTextAndAsideLayoutFields({
      Title: { value: 'Root' },
      data: {
        datasource: {
          title: { jsonValue: { value: 'DS wins' } },
        },
      },
    });
    expect(merged?.Title?.value).toBe('DS wins');
  });
});

describe('isTextAsidePreferLeft', () => {
  it('maps AsidePosition: default/Prefer Left = image column first; Prefer Right = copy first', () => {
    expect(isTextAsidePreferLeft('Prefer Left')).toBe(true);
    expect(isTextAsidePreferLeft('Left')).toBe(true);
    expect(isTextAsidePreferLeft('Prefer Right')).toBe(false);
    expect(isTextAsidePreferLeft('Right')).toBe(false);
    expect(isTextAsidePreferLeft('Default')).toBe(true);
    expect(isTextAsidePreferLeft(undefined)).toBe(true);
    expect(isTextAsidePreferLeft('')).toBe(true);
  });
});

describe('shouldTextAsidePrefer*PlaceholderOverFields', () => {
  it('is true in preview when placeholder flag is on', () => {
    expect(shouldTextAsidePreferTextPlaceholderOverFields(true, false)).toBe(true);
    expect(shouldTextAsidePreferAsidePlaceholderOverFields(true, false)).toBe(true);
  });

  it('is false in editing mode so datasource fields remain editable', () => {
    expect(shouldTextAsidePreferTextPlaceholderOverFields(true, true)).toBe(false);
    expect(shouldTextAsidePreferAsidePlaceholderOverFields(true, true)).toBe(false);
  });
});

describe('shouldRenderTextAsideAsideContent', () => {
  it('is false when no media, placeholder, or editing', () => {
    expect(
      shouldRenderTextAsideAsideContent(
        { Image: { value: {} }, Video: undefined } as never,
        { showImage: false, showVideo: false },
        false,
        false
      )
    ).toBe(false);
  });

  it('is true when aside placeholder is enabled', () => {
    expect(
      shouldRenderTextAsideAsideContent({} as never, { showImage: false, showVideo: false }, true, false)
    ).toBe(true);
  });

  it('is true when aside placeholder is on in preview even if image would otherwise drive the column', () => {
    expect(
      shouldRenderTextAsideAsideContent(
        { Image: { value: { src: '/x.jpg' } } } as never,
        { showImage: true, showVideo: false },
        true,
        false
      )
    ).toBe(true);
  });
});

describe('resolveTextAsideDividerParam and isTextAsideDividerEnabled', () => {
  it('resolves HasDivider string "1" and enables divider', () => {
    expect(resolveTextAsideDividerParam({ HasDivider: '1' })).toBe('1');
    expect(isTextAsideDividerEnabled('1')).toBe(true);
  });

  it('prefers Divider over HasDivider when both present', () => {
    expect(
      resolveTextAsideDividerParam({
        Divider: { Value: { value: 'None' } },
        HasDivider: '1',
      })
    ).toBe('None');
  });
});

describe('normalizeTextAsideVideoField and hasVisibleVideoReference', () => {
  it('unwraps jsonValue and detects Brightcove id', () => {
    const wrapped = {
      jsonValue: {
        id: 'x',
        fields: { BrightcoveId: { value: '6120425530001' } },
      },
    };
    expect(normalizeTextAsideVideoField(wrapped)).toEqual(wrapped.jsonValue);
    expect(hasVisibleVideoReference(wrapped)).toBe(true);
  });

  it('reads nested MediaType label like Media Tile droplink', () => {
    expect(
      resolveTextAsideMediaTypeLabel({
        fields: { Value: { value: 'Video' } },
      } as never)
    ).toBe('video');
    expect(resolveTextAsideMediaTypeLabel({ value: 'Image' } as never)).toBe('image');
  });
});

describe('isTextAsidePlaceholderEnabled', () => {
  it('treats string and numeric truthy values as enabled', () => {
    expect(isTextAsidePlaceholderEnabled({ value: true })).toBe(true);
    expect(isTextAsidePlaceholderEnabled({ value: '1' } as never)).toBe(true);
    expect(isTextAsidePlaceholderEnabled({ value: 'true' } as never)).toBe(true);
    expect(isTextAsidePlaceholderEnabled({ value: false })).toBe(false);
  });
});

describe('getTextAsideGridTemplateColumns', () => {
  it('uses 60/40 fr split for 40% aside width', () => {
    const { mainFr, asideFr } = getTextAsideGridTemplateColumns('40');
    expect(mainFr).toBe('3fr');
    expect(asideFr).toBe('2fr');
  });

  it('uses 50/50 fr split for 50% aside width', () => {
    const { mainFr, asideFr } = getTextAsideGridTemplateColumns('50%');
    expect(mainFr).toBe('1fr');
    expect(asideFr).toBe('1fr');
  });
});
