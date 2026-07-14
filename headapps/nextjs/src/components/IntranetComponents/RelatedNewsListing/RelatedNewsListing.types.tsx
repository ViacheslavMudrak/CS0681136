import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { NewsDetailPage_GraphQL } from 'src/models/graphql/news-detail';

type RelatedNewsListingFields = {
  listingTitle: Field<string>;
  seeAllNewsLink: LinkField;
  tags: Field<string>;
};

export type RelatedNewsListingProps = ComponentProps & {
  fields: RelatedNewsListingFields;
};

export type QueryData = {
  search: {
    results: NewsDetailPage_GraphQL[];
  };
};

export const RelatedNewsListingStatics = {
  editingEmptyNote:
    'Authoring note: No news articles found with matching tags. Add or update tags on this item to show related news. This component will be hidden on the live site with no articles.',
};
