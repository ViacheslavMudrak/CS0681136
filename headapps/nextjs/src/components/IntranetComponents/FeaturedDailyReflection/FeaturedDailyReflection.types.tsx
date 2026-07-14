import { Field } from '@sitecore-content-sdk/nextjs';
import type { GatedListingItem } from 'lib/auth/visibility-filter';
import { ComponentProps } from 'lib/component-props';

export type ReflectionItem = {
  url: {
    path: string;
  };
  title: {
    jsonValue: {
      value: string;
    };
  } | null;
  body: {
    jsonValue: {
      value: string;
    };
  } | null;
  author: {
    jsonValue: {
      value: string;
    };
  } | null;
  publishDate: {
    jsonValue: {
      value: string;
    };
  } | null;
} & GatedListingItem;

export type QueryData = {
  reflections: {
    total: number;
    results: ReflectionItem[];
  };
};

type FeaturedDailyReflectionFields = {
  headline: Field<string>;
  subheadline: Field<string>;
};

export type FeaturedDailyReflectionProps = ComponentProps & {
  fields: FeaturedDailyReflectionFields;
};

export const FeaturedReflectionsDictionary = {
  ReadFullArticle: 'Read full reflection',
};
