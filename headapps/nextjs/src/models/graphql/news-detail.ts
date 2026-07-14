import { ImageField } from '@sitecore-content-sdk/nextjs';
import type { GatedListingItem } from 'lib/auth/visibility-filter';

export type NewsDetailPage_GraphQL = {
  id: string;
  url: {
    path: string;
  };
  title: { value: string };
  excerpt: { value: string };
  publishDate: { value: string };
  thumbnail: { jsonValue: ImageField };
  isFeatured?: { value: boolean };
} & GatedListingItem;
