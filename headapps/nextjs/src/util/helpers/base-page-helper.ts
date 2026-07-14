import type { Field, Page } from '@sitecore-content-sdk/nextjs';

export type BasePage = {
  // Content Fields
  title?: Field<string>;
  pageIntroduction?: Field<string>;
  content?: Field<string>;

  // Search Fields
  excerpt?: Field<string>;
  thumbnail?: Field<string>;
  optionalEyebrow?: Field<string>;

  //_Navigable
  NavigationTitle?: Field<string>;
};

export function getBasePageFields(page: Page) {
  return page.layout.sitecore.route?.fields as BasePage;
}
