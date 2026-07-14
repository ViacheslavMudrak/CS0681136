import { ImageField } from '@sitecore-content-sdk/nextjs';
import type { GatedListingItem } from 'lib/auth/visibility-filter';

export type UserNewsFeed_GraphQL = {
  id: string;
  url: {
    path: string;
  };
  title: { value: string };
  publishDate: { value: string };
  thumbnail: { jsonValue: ImageField };
} & GatedListingItem;
