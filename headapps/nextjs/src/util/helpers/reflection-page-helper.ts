import type { Field, Item, Page } from '@sitecore-content-sdk/nextjs';

import type { BasePage } from './base-page-helper';

export type ReflectionPageFields = BasePage & {
  quote: Field<string>;
  author: Field<string>;
  description: Field<string>;
  publishDate: Field<string>;
  reflectionsTags: Item[];
};

export function getReflectionPageFields(page: Page) {
  return page.layout.sitecore.route?.fields as ReflectionPageFields;
}
