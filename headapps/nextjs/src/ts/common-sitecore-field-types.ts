import { Field, ImageField, Item } from '@sitecore-content-sdk/nextjs';

export type Icon = Item & {
  fields: {
    value: Field<string>;
  };
};

export type NewsDetailPage = Item & {
  fields: {
    title: Field<string>;
    excerpt: Field<string>;
    publishDate: Field<string>;
    thumbnail: ImageField;
    isFeatured?: Field<boolean>;
  };
};

export type ListTypeField = {
  targetItems?: {
    path?: string;
    id?: string;
    name?: string;
  }[];
};

export type TagItem = {
  id: string;
  name: string;
  displayName?: string;
  fields: {
    title: Field<string>;
    facetCategory: Field<string>;
  };
};
