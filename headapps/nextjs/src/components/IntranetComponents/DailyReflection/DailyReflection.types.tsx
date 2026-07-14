import type { GatedListingItem } from 'lib/auth/visibility-filter';
import { ComponentProps } from 'lib/component-props';

import { Field } from '@sitecore-content-sdk/nextjs';

export type ReflectionItem = {
  url: { path: string };
  title: Field<string>;
  description: Field<string>;
  quote: Field<string>;
  author: Field<string>;
  publishDate: Field<string>;
} & GatedListingItem;

export type QueryData = {
  reflections: {
    results: ReflectionItem[];
  };
};

type DailyReflectionFields = {
  headline: Field<string>;
};

export type DailyReflectionProps = ComponentProps & {
  fields: DailyReflectionFields;
};

export const DailyReflectionStatics = {
  ViewAllLinklabel: 'View All',
};
