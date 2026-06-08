import type { ComponentRendering } from '@sitecore-content-sdk/nextjs';
import { getFieldStringValue } from 'components/divider/dividerUtils';
import {
  mediaHasVisitorContent,
  resolveMediaLayoutFields,
  type MediaFields,
} from 'components/media/mediaUtils';
import type { SitecoreValueItem } from 'components/media-tile/MediaTile.type';
import {
  getNormalizedTestimonialFields,
  hasVisibleTestimonialContent,
} from 'components/testimonial/testimonialUtils';

import type {
  CarouselFields,
  CarouselMediaItem,
  CarouselTestimonialItem,
} from './Carousel.type';

export const CAROUSEL_EMPTY_HINT = 'Carousel';

export const CAROUSEL_ARIA_REGION_FALLBACK = 'Carousel';

export const CAROUSEL_PREV_LABEL = 'Previous slide';

export const CAROUSEL_NEXT_LABEL = 'Next slide';

export const CAROUSEL_DOT_LABEL = 'Go to slide';

/**
 * @param slideIndexOneBased - 1-based index of the active slide
 * @param total - Total slide count
 * @returns Empty string when `total` is 0; otherwise "Slide n of m"
 */
export function formatCarouselLiveRegionMessage(
  slideIndexOneBased: number,
  total: number,
): string {
  if (total <= 0) return '';
  return `Slide ${slideIndexOneBased} of ${total}`;
}

export function getCarouselRenderingDisplayName(
  rendering: ComponentRendering,
): string | undefined {
  const raw = (rendering as ComponentRendering & { displayName?: unknown }).displayName;
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  return trimmed === '' ? undefined : trimmed;
}

export function readCarouselCheckbox(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'object' && value !== null && 'value' in value) {
    const v = (value as { value?: unknown }).value;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      return s === '1' || s === 'true' || s === 'yes';
    }
  }
  return false;
}

export function resolveCarouselContentKind(
  item: SitecoreValueItem | undefined,
): 'media' | 'testimonial' {
  const fromValue = getFieldStringValue(item?.fields?.Value).toLowerCase();
  const fromName = (item?.name ?? item?.displayName ?? '').toLowerCase();
  const v = fromValue || fromName;
  if (v.includes('testimonial')) return 'testimonial';
  return 'media';
}

function unwrapMultilistResults<T>(
  raw: { results?: T[] | null } | T[] | null | undefined,
): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const r = raw.results;
  return Array.isArray(r) ? r : [];
}

export function resolveCarouselFields(fields: CarouselFields): {
  mediaItems: CarouselMediaItem[];
  testimonialItems: CarouselTestimonialItem[];
  showControls: unknown;
  contentType: SitecoreValueItem | undefined;
  backgroundColor: SitecoreValueItem | undefined;
  autoplay: unknown;
} {
  const ds = fields.data?.datasource;

  let mediaItems: CarouselMediaItem[] = fields.MediaItems ?? [];
  if (!mediaItems.length && ds) {
    const raw = ds.mediaItems ?? ds.MediaItems;
    if (raw != null) {
      mediaItems = unwrapMultilistResults(
        raw as { results?: CarouselMediaItem[] } | CarouselMediaItem[],
      );
    }
  }

  let testimonialItems: CarouselTestimonialItem[] = fields.TestimonialItems ?? [];
  if (!testimonialItems.length && ds) {
    const raw = ds.testimonialItems ?? ds.TestimonialItems;
    if (raw != null) {
      testimonialItems = unwrapMultilistResults(
        raw as
          | { results?: CarouselTestimonialItem[] }
          | CarouselTestimonialItem[],
      );
    }
  }

  const showControls =
    fields.ShowControls ?? ds?.showControls?.jsonValue ?? ds?.ShowControls?.jsonValue;
  let contentType = fields.ContentType;
  if (!contentType) {
    const wrapped = ds?.contentType?.jsonValue ?? ds?.ContentType?.jsonValue;
    if (wrapped) contentType = wrapped as SitecoreValueItem;
  }

  let backgroundColor = fields.BackgroundColor;
  if (!backgroundColor) {
    const wrapped = ds?.backgroundColor?.jsonValue ?? ds?.BackgroundColor?.jsonValue;
    if (wrapped) backgroundColor = wrapped as SitecoreValueItem;
  }

  const autoplay = fields.Autoplay ?? ds?.autoplay?.jsonValue ?? ds?.Autoplay?.jsonValue;

  return {
    mediaItems: mediaItems.filter((x) => x?.id),
    testimonialItems: testimonialItems.filter((x) => x?.id),
    showControls,
    contentType,
    backgroundColor,
    autoplay,
  };
}

/**
 * @param item - Multilist media item
 * @param isEditing - XM Cloud Pages editing mode
 */
export function carouselMediaItemIsActive(
  item: CarouselMediaItem | undefined,
  isEditing: boolean,
): boolean {
  if (!item?.fields) return isEditing;
  const resolved = resolveMediaLayoutFields(item.fields as MediaFields);
  return mediaHasVisitorContent(resolved, isEditing);
}

/**
 * @param item - Multilist testimonial item
 * @param isEditing - XM Cloud Pages editing mode
 */
export function carouselTestimonialItemIsActive(
  item: CarouselTestimonialItem | undefined,
  isEditing: boolean,
): boolean {
  if (!item?.fields) return isEditing;
  const normalized = getNormalizedTestimonialFields(item.fields);
  return hasVisibleTestimonialContent(normalized, isEditing);
}

export type CarouselBoundSlideEntry = {
  kind: 'media';
  item: CarouselMediaItem;
};

/** Swiper row for media carousel (optional bookend clones for peek wrap). */
export type MediaSwiperSlideNode = {
  entry: CarouselBoundSlideEntry;
  realIndex: number;
  swiperKey: string;
};

/** In peek mode, prev/next neighbors stay visible (incl. wrap: last → first on the right). */
export function isMediaPeekNeighborSlide(
  slideIndex: number,
  activeIndex: number,
  total: number,
): boolean {
  if (total <= 1) return false;
  const prev = (activeIndex - 1 + total) % total;
  const next = (activeIndex + 1) % total;
  return slideIndex === prev || slideIndex === next;
}

function mediaPeekBookendKey(itemId: string, position: 'before' | 'after'): string {
  return `${itemId}__media-peek-${position}`;
}

/**
 * Bookend clones: [clone last, …real slides…, clone first]. Avoids Swiper loop bugs with fractional `slidesPerView`.
 * @returns `null` when fewer than two slides (no wrap needed).
 */
export function buildMediaPeekBookendSlides(
  entries: CarouselBoundSlideEntry[],
): MediaSwiperSlideNode[] | null {
  if (entries.length < 2) return null;
  const last = entries[entries.length - 1];
  const first = entries[0];
  return [
    {
      entry: last,
      realIndex: entries.length - 1,
      swiperKey: mediaPeekBookendKey(last.item.id, 'before'),
    },
    ...entries.map((entry, realIndex) => ({
      entry,
      realIndex,
      swiperKey: entry.item.id,
    })),
    {
      entry: first,
      realIndex: 0,
      swiperKey: mediaPeekBookendKey(first.item.id, 'after'),
    },
  ];
}

/** Maps a 0-based real slide index to the swiper index when bookends are present. */
export function mediaPeekBookendSwiperIndexForReal(realIndex: number): number {
  return realIndex + 1;
}
