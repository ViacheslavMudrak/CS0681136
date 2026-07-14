import type { Field, ImageField, Page } from '@sitecore-content-sdk/nextjs';
import type { BasePage } from './base-page-helper';

export type NewsPageFields = Omit<BasePage, 'thumbnail'> & {
  publishDate: Field<string>;
  /** Page-level Thumbnail (Search Content section). Used by search cards, Market News Hero, etc. */
  thumbnail?: ImageField;
};

export function getNewsPageFields(page: Page) {
  return page.layout.sitecore.route?.fields as NewsPageFields;
}
