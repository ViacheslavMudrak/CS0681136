import { describe, expect, it } from 'vitest';

import {
  deriveApplicationFilters,
  filterModals,
  getApplicationSlug,
  getItemSlugFromUrl,
  getModalSlug,
  getProductModalVideoId,
  getSegmentSlug,
  productModalLinkIsVisible,
  productModalShouldRenderVideo,
  resolveProductModalCalloutConfig,
  resolveProductModalLinkField,
  resolveProductSegmentState,
} from 'components/product-segment/productSegmentUtils';
import type {
  ProductModalItem,
  ProductSegmentItem,
  ProductSegmentTaxonomyItem,
} from 'components/product-segment/ProductSegment.type';

function app(id: string, url: string, label: string): ProductSegmentTaxonomyItem {
  return {
    id,
    url,
    displayName: label,
    fields: { Value: { value: label } },
  };
}

function modal(
  id: string,
  url: string,
  applications: ProductSegmentTaxonomyItem[] = [],
): ProductModalItem {
  return {
    id,
    url,
    fields: {
      Title: { value: 'Modal' },
      Application: applications,
    },
  };
}

function segment(
  id: string,
  url: string,
  modals: ProductModalItem[],
): ProductSegmentItem {
  return {
    id,
    url,
    fields: {
      Heading: { value: 'Segment' },
      ProductModal: modals,
    },
  };
}

describe('getItemSlugFromUrl', () => {
  it('returns lowercased last path segment', () => {
    expect(getItemSlugFromUrl('/data/product-model/90-degree-sorter')).toBe(
      '90-degree-sorter',
    );
  });
});

describe('deriveApplicationFilters', () => {
  it('returns unique applications in first-seen order', () => {
    const sorting = app('1', '/application-filters/sorting', 'Sorting');
    const merging = app('2', '/application-filters/merging', 'Merging');
    const modals = [
      modal('a', '/data/product-model/a', [sorting]),
      modal('b', '/data/product-model/b', [sorting, merging]),
    ];
    const filters = deriveApplicationFilters(modals);
    expect(filters.map((f) => f.slug)).toEqual(['sorting', 'merging']);
  });
});

describe('filterModals', () => {
  const sorting = app('1', '/application-filters/sorting', 'Sorting');
  const noAppModal = modal('x', '/data/product-model/no-app', []);
  const sortingModal = modal('a', '/data/product-model/sorter', [sorting]);

  it('returns all modals when application is null (All)', () => {
    expect(filterModals([noAppModal, sortingModal], null)).toHaveLength(2);
  });

  it('excludes modals without Application for specific filter', () => {
    expect(
      filterModals([noAppModal, sortingModal], getApplicationSlug(sorting)),
    ).toEqual([sortingModal]);
  });
});

describe('resolveProductSegmentState', () => {
  const sorting = app('1', '/application-filters/sorting', 'Sorting');
  const segA = segment('s1', '/product-segment/e-commerce', [
    modal('m1', '/data/product-model/merge', [sorting]),
  ]);
  const segB = segment('s2', '/product-segment/postal-parcel-including', [
    modal('m2', '/data/product-model/90-degree-sorter', [sorting]),
  ]);

  const segments = [segA, segB];

  it('returns no selection when segment param is absent', () => {
    const state = resolveProductSegmentState(segments, {
      get: () => null,
    });
    expect(state.segmentIndex).toBe(-1);
    expect(state.segmentSlug).toBe('');
    expect(state.hasSegmentSelected).toBe(false);
    expect(state.applicationSlug).toBeNull();
    expect(state.openModal).toBe(false);
  });

  it('restores valid deep link state', () => {
    const params = new URLSearchParams(
      'segment=postal-parcel-including&application=sorting&item=90-degree-sorter',
    );
    const state = resolveProductSegmentState(segments, params);
    expect(state.segmentIndex).toBe(1);
    expect(state.applicationSlug).toBe('sorting');
    expect(state.itemSlug).toBe('90-degree-sorter');
    expect(state.openModal).toBe(true);
  });

  it('returns no selection when segment param is invalid', () => {
    const params = new URLSearchParams('segment=unknown');
    const state = resolveProductSegmentState(segments, params);
    expect(state.segmentIndex).toBe(-1);
    expect(state.segmentSlug).toBe('');
    expect(state.hasSegmentSelected).toBe(false);
  });

  it('falls back application when invalid', () => {
    const params = new URLSearchParams(
      'segment=postal-parcel-including&application=unknown',
    );
    const state = resolveProductSegmentState(segments, params);
    expect(state.applicationSlug).toBeNull();
  });

  it('does not open modal when item is invalid for filtered set', () => {
    const params = new URLSearchParams(
      'segment=e-commerce&item=90-degree-sorter',
    );
    const state = resolveProductSegmentState(segments, params);
    expect(state.openModal).toBe(false);
    expect(state.itemSlug).toBeNull();
  });
});

describe('getSegmentSlug and getModalSlug', () => {
  it('uses url segment with id fallback', () => {
    expect(getSegmentSlug({ id: 'abc', url: '/seg/foo-bar' })).toBe('foo-bar');
    expect(getModalSlug({ id: 'abc' })).toBe('modal-abc');
  });
});

describe('productModalShouldRenderVideo', () => {
  it('returns true when Video has a Brightcove id regardless of MediaType', () => {
    expect(
      productModalShouldRenderVideo(
        {
          MediaType: { fields: { Value: { value: 'Image' } } },
          Video: {
            fields: { BrightcoveId: { value: '1234567890' } },
          },
        },
        false,
      ),
    ).toBe(true);
    expect(getProductModalVideoId({ fields: { BrightcoveId: { value: '1234567890' } } })).toBe(
      '1234567890',
    );
  });

  it('returns false in preview when Video is missing or has no Brightcove id', () => {
    expect(
      productModalShouldRenderVideo(
        {
          MediaType: { fields: { Value: { value: 'Video' } } },
          Image: { value: { src: '/image.jpg' } },
        },
        false,
      ),
    ).toBe(false);
  });

  it('returns true in editing when Video is linked or MediaType is video', () => {
    expect(
      productModalShouldRenderVideo(
        {
          MediaType: { fields: { Value: { value: 'Video' } } },
        },
        true,
      ),
    ).toBe(true);
    expect(
      productModalShouldRenderVideo(
        {
          Video: { fields: { BrightcoveId: { value: '' } } },
        },
        true,
      ),
    ).toBe(true);
  });
});

describe('resolveProductModalCalloutConfig', () => {
  it('always forces card style, column direction, and sm text size', () => {
    expect(
      resolveProductModalCalloutConfig({
        Style: { fields: { Value: { value: 'text' } } },
      }),
    ).toEqual(
      expect.objectContaining({
        style: 'card',
        direction: 'column',
        titleSize: 'sm',
      }),
    );
  });

  it('preserves colorscheme from CMS callout fields', () => {
    expect(
      resolveProductModalCalloutConfig({
        Colorscheme: { fields: { Value: { value: 'dark' } } },
      }).colorScheme,
    ).toBe('dark');
  });
});

describe('product modal download link helpers', () => {
  it('coalesces jsonValue link shapes for the Content SDK Link field', () => {
    const resolved = resolveProductModalLinkField({
      jsonValue: {
        value: {
          href: '/media/pdf',
          text: 'Download PDF',
        },
      },
    } as never);

    expect(resolved?.value?.href).toBe('/media/pdf');
    expect(resolved?.value?.text).toBe('Download PDF');
  });

  it('shows the link when href or text is present, or while editing', () => {
    expect(
      productModalLinkIsVisible(
        { value: { href: '/media/pdf', text: 'Download PDF' } },
        false,
      ),
    ).toBe(true);
    expect(
      productModalLinkIsVisible({ value: { href: '', text: 'Download PDF' } }, false),
    ).toBe(true);
    expect(productModalLinkIsVisible(undefined, true)).toBe(true);
    expect(productModalLinkIsVisible(undefined, false)).toBe(false);
  });
});
