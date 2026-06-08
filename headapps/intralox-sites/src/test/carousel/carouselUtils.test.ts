import { describe, expect, it } from 'vitest';
import type { ComponentRendering } from '@sitecore-content-sdk/nextjs';

import {
  buildMediaPeekBookendSlides,
  formatCarouselLiveRegionMessage,
  getCarouselRenderingDisplayName,
  isMediaPeekNeighborSlide,
  mediaPeekBookendSwiperIndexForReal,
  readCarouselCheckbox,
  resolveCarouselContentKind,
  resolveCarouselFields,
  carouselMediaItemIsActive,
  carouselTestimonialItemIsActive,
  CAROUSEL_PREV_LABEL,
  CAROUSEL_NEXT_LABEL,
  CAROUSEL_DOT_LABEL,
  CAROUSEL_ARIA_REGION_FALLBACK,
} from 'components/carousel/carouselUtils';
import type { CarouselFields } from 'components/carousel/Carousel.type';
import type { CarouselMediaItem, CarouselTestimonialItem } from 'components/carousel/Carousel.type';
import type { SitecoreValueItem } from 'components/media-tile/MediaTile.type';

describe('formatCarouselLiveRegionMessage', () => {
  it('returns empty string when total is 0', () => {
    expect(formatCarouselLiveRegionMessage(1, 0)).toBe('');
  });

  it('returns empty string when total is negative', () => {
    expect(formatCarouselLiveRegionMessage(1, -1)).toBe('');
  });

  it('returns "Slide 1 of 3" for first slide of 3', () => {
    expect(formatCarouselLiveRegionMessage(1, 3)).toBe('Slide 1 of 3');
  });

  it('returns "Slide 3 of 3" for last slide', () => {
    expect(formatCarouselLiveRegionMessage(3, 3)).toBe('Slide 3 of 3');
  });

  it('returns "Slide 2 of 5" for second slide of 5', () => {
    expect(formatCarouselLiveRegionMessage(2, 5)).toBe('Slide 2 of 5');
  });
});

describe('getCarouselRenderingDisplayName', () => {
  it('returns undefined when displayName is absent', () => {
    const rendering = {} as ComponentRendering;
    expect(getCarouselRenderingDisplayName(rendering)).toBeUndefined();
  });

  it('returns undefined when displayName is a non-string value', () => {
    const rendering = { displayName: 42 } as unknown as ComponentRendering;
    expect(getCarouselRenderingDisplayName(rendering)).toBeUndefined();
  });

  it('returns undefined when displayName is an empty string', () => {
    const rendering = { displayName: '' } as unknown as ComponentRendering;
    expect(getCarouselRenderingDisplayName(rendering)).toBeUndefined();
  });

  it('returns undefined when displayName is whitespace only', () => {
    const rendering = { displayName: '   ' } as unknown as ComponentRendering;
    expect(getCarouselRenderingDisplayName(rendering)).toBeUndefined();
  });

  it('returns the trimmed displayName when valid', () => {
    const rendering = { displayName: ' Carousel ' } as unknown as ComponentRendering;
    expect(getCarouselRenderingDisplayName(rendering)).toBe('Carousel');
  });
});

describe('readCarouselCheckbox', () => {
  it('returns false for null', () => {
    expect(readCarouselCheckbox(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(readCarouselCheckbox(undefined)).toBe(false);
  });

  it('returns true for boolean true', () => {
    expect(readCarouselCheckbox(true)).toBe(true);
  });

  it('returns false for boolean false', () => {
    expect(readCarouselCheckbox(false)).toBe(false);
  });

  it('returns true for object with value: true', () => {
    expect(readCarouselCheckbox({ value: true })).toBe(true);
  });

  it('returns false for object with value: false', () => {
    expect(readCarouselCheckbox({ value: false })).toBe(false);
  });

  it('returns true for object with value: "1"', () => {
    expect(readCarouselCheckbox({ value: '1' })).toBe(true);
  });

  it('returns true for object with value: "true"', () => {
    expect(readCarouselCheckbox({ value: 'true' })).toBe(true);
  });

  it('returns true for object with value: "yes"', () => {
    expect(readCarouselCheckbox({ value: 'yes' })).toBe(true);
  });

  it('returns false for object with value: "false"', () => {
    expect(readCarouselCheckbox({ value: 'false' })).toBe(false);
  });

  it('returns false for object with value: "0"', () => {
    expect(readCarouselCheckbox({ value: '0' })).toBe(false);
  });

  it('returns false for a plain string value', () => {
    expect(readCarouselCheckbox('random')).toBe(false);
  });
});

describe('resolveCarouselContentKind', () => {
  it('returns "media" when item is undefined', () => {
    expect(resolveCarouselContentKind(undefined)).toBe('media');
  });

  it('returns "testimonial" when Value field contains "testimonial"', () => {
    const item = { fields: { Value: { value: 'testimonial' } } } as SitecoreValueItem;
    expect(resolveCarouselContentKind(item)).toBe('testimonial');
  });

  it('returns "testimonial" when item name contains "testimonial"', () => {
    const item = { name: 'Testimonial Slide', fields: {} } as SitecoreValueItem;
    expect(resolveCarouselContentKind(item)).toBe('testimonial');
  });

  it('returns "testimonial" when displayName contains "testimonial"', () => {
    const item = { displayName: 'Testimonial Block', fields: {} } as SitecoreValueItem;
    expect(resolveCarouselContentKind(item)).toBe('testimonial');
  });

  it('returns "media" when item contains "media"', () => {
    const item = { fields: { Value: { value: 'media' } } } as SitecoreValueItem;
    expect(resolveCarouselContentKind(item)).toBe('media');
  });

  it('returns "media" for an empty item', () => {
    const item = { fields: {} } as SitecoreValueItem;
    expect(resolveCarouselContentKind(item)).toBe('media');
  });

  it('is case-insensitive for "Testimonial"', () => {
    const item = { fields: { Value: { value: 'Testimonial' } } } as SitecoreValueItem;
    expect(resolveCarouselContentKind(item)).toBe('testimonial');
  });
});

describe('carouselMediaItemIsActive', () => {
  it('returns isEditing value when item is undefined', () => {
    expect(carouselMediaItemIsActive(undefined, false)).toBe(false);
    expect(carouselMediaItemIsActive(undefined, true)).toBe(true);
  });

  it('returns isEditing value when item has no fields', () => {
    const item = { id: 'm1' } as unknown as CarouselMediaItem;
    expect(carouselMediaItemIsActive(item, false)).toBe(false);
    expect(carouselMediaItemIsActive(item, true)).toBe(true);
  });

  it('returns false for visitor mode when item fields have no media content', () => {
    const item = {
      id: 'm1',
      fields: {},
    } as unknown as CarouselMediaItem;
    expect(carouselMediaItemIsActive(item, false)).toBe(false);
  });

  it('returns true in editing mode when item fields are present but empty', () => {
    const item = {
      id: 'm1',
      fields: {},
    } as unknown as CarouselMediaItem;
    expect(carouselMediaItemIsActive(item, true)).toBe(true);
  });
});

describe('carouselTestimonialItemIsActive', () => {
  it('returns isEditing value when item is undefined', () => {
    expect(carouselTestimonialItemIsActive(undefined, false)).toBe(false);
    expect(carouselTestimonialItemIsActive(undefined, true)).toBe(true);
  });

  it('returns isEditing value when item has no fields', () => {
    const item = { id: 't1' } as unknown as CarouselTestimonialItem;
    expect(carouselTestimonialItemIsActive(item, false)).toBe(false);
    expect(carouselTestimonialItemIsActive(item, true)).toBe(true);
  });

  it('returns false for visitor mode when testimonial fields are empty', () => {
    const item = {
      id: 't1',
      fields: {},
    } as unknown as CarouselTestimonialItem;
    expect(carouselTestimonialItemIsActive(item, false)).toBe(false);
  });

  it('returns true in editing mode when testimonial has a quote value', () => {
    const item = {
      id: 't1',
      fields: {
        Quote: { value: 'Great product!' },
      },
    } as unknown as CarouselTestimonialItem;
    expect(carouselTestimonialItemIsActive(item, true)).toBe(true);
  });
});

describe('Carousel label constants', () => {
  it('CAROUSEL_PREV_LABEL is a non-empty string', () => {
    expect(typeof CAROUSEL_PREV_LABEL).toBe('string');
    expect(CAROUSEL_PREV_LABEL.length).toBeGreaterThan(0);
  });

  it('CAROUSEL_NEXT_LABEL is a non-empty string', () => {
    expect(typeof CAROUSEL_NEXT_LABEL).toBe('string');
    expect(CAROUSEL_NEXT_LABEL.length).toBeGreaterThan(0);
  });

  it('CAROUSEL_DOT_LABEL is a non-empty string', () => {
    expect(typeof CAROUSEL_DOT_LABEL).toBe('string');
    expect(CAROUSEL_DOT_LABEL.length).toBeGreaterThan(0);
  });

  it('CAROUSEL_ARIA_REGION_FALLBACK is a non-empty string', () => {
    expect(typeof CAROUSEL_ARIA_REGION_FALLBACK).toBe('string');
    expect(CAROUSEL_ARIA_REGION_FALLBACK.length).toBeGreaterThan(0);
  });
});

describe('resolveCarouselFields - datasource shapes', () => {
  it('reads mediaItems from datasource.mediaItems when flat fields are empty', () => {
    const fields = {
      data: {
        datasource: {
          mediaItems: { results: [{ id: 'm1' }, { id: 'm2' }] },
        },
      },
    } as unknown as CarouselFields;
    const result = resolveCarouselFields(fields);
    expect(result.mediaItems).toHaveLength(2);
  });

  it('reads testimonialItems from datasource when flat fields are empty', () => {
    const fields = {
      data: {
        datasource: {
          testimonialItems: { results: [{ id: 't1' }] },
        },
      },
    } as unknown as CarouselFields;
    const result = resolveCarouselFields(fields);
    expect(result.testimonialItems).toHaveLength(1);
  });

  it('reads contentType from datasource jsonValue when flat field is absent', () => {
    const contentTypeMock = { fields: { Value: { value: 'Testimonial' } } };
    const fields = {
      data: {
        datasource: {
          contentType: { jsonValue: contentTypeMock },
        },
      },
    } as unknown as CarouselFields;
    const result = resolveCarouselFields(fields);
    expect(result.contentType).toBe(contentTypeMock);
  });

  it('reads backgroundColor from datasource jsonValue when flat field is absent', () => {
    const bgMock = { fields: { Value: { value: 'Gray' } } };
    const fields = {
      data: {
        datasource: {
          backgroundColor: { jsonValue: bgMock },
        },
      },
    } as unknown as CarouselFields;
    const result = resolveCarouselFields(fields);
    expect(result.backgroundColor).toBe(bgMock);
  });

  it('filters out items without an id', () => {
    const fields = {
      MediaItems: [{ id: 'm1' }, { id: undefined }, null],
    } as unknown as CarouselFields;
    const result = resolveCarouselFields(fields);
    expect(result.mediaItems).toHaveLength(1);
    expect(result.mediaItems[0]?.id).toBe('m1');
  });
});

describe('media peek bookends', () => {
  const entries = [
    { kind: 'media' as const, item: { id: 'a' } },
    { kind: 'media' as const, item: { id: 'b' } },
    { kind: 'media' as const, item: { id: 'c' } },
  ];

  it('buildMediaPeekBookendSlides wraps first and last for swiper', () => {
    const nodes = buildMediaPeekBookendSlides(entries);
    expect(nodes).toHaveLength(5);
    expect(nodes?.[0]?.realIndex).toBe(2);
    expect(nodes?.[0]?.entry.item.id).toBe('c');
    expect(nodes?.[4]?.realIndex).toBe(0);
    expect(nodes?.[4]?.entry.item.id).toBe('a');
    expect(nodes?.[2]?.realIndex).toBe(1);
    expect(nodes?.[2]?.swiperKey).toBe('b');
  });

  it('maps real index to swiper index with one leading bookend', () => {
    expect(mediaPeekBookendSwiperIndexForReal(0)).toBe(1);
    expect(mediaPeekBookendSwiperIndexForReal(2)).toBe(3);
  });

  it('treats first slide as next neighbor when active is last', () => {
    expect(isMediaPeekNeighborSlide(0, 2, 3)).toBe(true);
    expect(isMediaPeekNeighborSlide(1, 2, 3)).toBe(true);
    expect(isMediaPeekNeighborSlide(2, 2, 3)).toBe(false);
  });
});
