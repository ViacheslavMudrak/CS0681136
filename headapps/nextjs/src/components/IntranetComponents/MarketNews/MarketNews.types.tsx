import { ComponentProps } from 'lib/component-props';
import { MarketNewsDetailPage_GraphQL } from 'src/models/graphql/market-news-detail';

import { Field, Item } from '@sitecore-content-sdk/nextjs';

export type QueryData = {
  featured: {
    results: MarketNewsDetailPage_GraphQL[];
  };
  nonFeatured: {
    results: MarketNewsDetailPage_GraphQL[];
  };
};

type MarketNewsFields = {
  title: Field<string>;
  seeAllNewsLink: Field<string>;
  featuredNewsTag: Item[];
  nonFeaturedNewsTags: Item[];
  mobileCTA: Field<string>;
};

export type MarketNewsProps = ComponentProps & {
  fields: MarketNewsFields;
};
