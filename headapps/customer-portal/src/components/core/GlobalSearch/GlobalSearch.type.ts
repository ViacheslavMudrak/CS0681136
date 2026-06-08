import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

export interface IGlobalSearchCategoryFields {
  Title: Field<string>;
  Icon?: ImageField;
  URL: LinkField;
  /** When true, this category is highlighted by default in search suggestions. */
  DefaultSearchType?: Field<boolean>;
}

export interface IGlobalSearchCategory {
  id: string;
  url: string;
  name: string;
  displayName: string;
  fields: IGlobalSearchCategoryFields;
}

export interface IGlobalSearchFields {
  SearchTitle: Field<string>;
  SearchPlaceholder: Field<string>;
  Categories: Array<IGlobalSearchCategory>;
  SearchIcon: ImageField;
}
