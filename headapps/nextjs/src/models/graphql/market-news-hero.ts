import { ImageField } from '@sitecore-content-sdk/nextjs';
import type { GatedListingItem } from 'lib/auth/visibility-filter';

export type MarketNewsDetailPage_GraphQL = {
  url: {
    path: string;
  };
  eyebrow: { value: string };
  title: { value: string };
  excerpt: { value: string };
  pageIntroduction: { value: string };
  publishDate: { value: string };
  thumbnail: { jsonValue: ImageField };
} & GatedListingItem;
