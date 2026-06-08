import type { Page } from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from 'lib/component-props';
import type { MediaFields } from 'components/media/mediaUtils';
import type { SitecoreValueItem } from 'components/media-tile/MediaTile.type';
import type { TestimonialFields } from 'components/testimonial/Testimonial.type';

export interface CarouselMediaItem {
  id: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: MediaFields;
}

export interface CarouselTestimonialItem {
  id: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: TestimonialFields;
}

export interface CarouselFieldsDatasource {
  mediaItems?: { results?: CarouselMediaItem[] | null } | CarouselMediaItem[] | null;
  MediaItems?: { results?: CarouselMediaItem[] | null } | CarouselMediaItem[] | null;
  testimonialItems?: { results?: CarouselTestimonialItem[] | null } | CarouselTestimonialItem[] | null;
  TestimonialItems?: { results?: CarouselTestimonialItem[] | null } | CarouselTestimonialItem[] | null;
  showControls?: { jsonValue?: unknown };
  ShowControls?: { jsonValue?: unknown };
  contentType?: { jsonValue?: SitecoreValueItem };
  ContentType?: { jsonValue?: SitecoreValueItem };
  backgroundColor?: { jsonValue?: SitecoreValueItem };
  BackgroundColor?: { jsonValue?: SitecoreValueItem };
  autoplay?: { jsonValue?: unknown };
  Autoplay?: { jsonValue?: unknown };
}

export interface CarouselFields {
  MediaItems?: CarouselMediaItem[] | null;
  TestimonialItems?: CarouselTestimonialItem[] | null;
  ShowControls?: unknown;
  ContentType?: SitecoreValueItem;
  BackgroundColor?: SitecoreValueItem;
  Autoplay?: unknown;
  data?: {
    datasource?: CarouselFieldsDatasource;
  };
}

export type CarouselProps = ComponentProps & {
  fields?: CarouselFields;
};

export type CarouselClientInput = {
  isEditing: boolean;
  renderingDisplayName?: string;
  contentKind: 'media' | 'testimonial';
  backgroundClass: string;
  showControls: boolean;
  autoplay: boolean;
  mediaItems: CarouselMediaItem[];
  testimonialItems: CarouselTestimonialItem[];
  page: Page;
};
