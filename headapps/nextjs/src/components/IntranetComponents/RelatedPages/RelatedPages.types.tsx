import { Field, Item } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export type RelatedPageItem = Item & {
  fields: {
    eyebrow?: Field<string>; // Optional field - add to page template in Sitecore
    title: Field<string>;
    pageIntroduction?: Field<string>; // Optional description field
  };
};

export type SearchResultPageItem = {
  id: string;
  name: string;
  url: { path: string };
  eyebrow?: Field<string>;
  title?: Field<string>;
  pageIntroduction?: Field<string>;
  topicTags?: {
    targetItems: Array<{
      id: string;
      name: string;
      title: Field<string>;
    }>;
  };
  areaTags?: {
    targetItems: Array<{
      id: string;
      name: string;
      title: Field<string>;
    }>;
  };
};

export type DisplayPageItem = {
  id: string;
  url: string;
  eyebrow?: Field<string>;
  title: Field<string>;
  pageIntroduction?: Field<string>;
};

export type QueryData = {
  search: {
    total: number;
    results: SearchResultPageItem[];
  };
};

export type RelatedPagesProps = ComponentProps & {
  fields: {
    headLine?: Field<string>;
    relatedPages?: RelatedPageItem[]; // Manually selected pages
    pageTags?: Item[]; // Tags to search for related pages
  };
  search?: {
    results: SearchResultPageItem[];
  };
};

export const RelatedPagesStatics = {
  editingEmptyNote:
    'Authoring note: No related pages to display. Either manually select pages in "Related Pages" field or add tags to "Page Tags" field to show tag-based results. This component will be hidden on the live site when empty.',
  learnMoreText: 'Learn More',
};
