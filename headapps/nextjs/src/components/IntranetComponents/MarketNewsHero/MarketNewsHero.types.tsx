import { ComponentProps } from 'lib/component-props';
import { MarketNewsDetailPage_GraphQL } from 'src/models/graphql/market-news-hero';

import { Field, ImageField, Item } from '@sitecore-content-sdk/nextjs';

export type QueryData = {
  featured: {
    results: MarketNewsDetailPage_GraphQL[];
  };
  nonFeatured: {
    results: MarketNewsDetailPage_GraphQL[];
  };
};

type MarketNewsHeroFields = {
  placeholderImage: ImageField;
  optionalEyebrow: Field<string>;
  featuredLinkText: Field<string>;
  nonFeaturedLinkText: Field<string>;
  nonMarketNewsSiteArea: Item;
};

export type MarketNewsHeroProps = ComponentProps & {
  fields: MarketNewsHeroFields;
};
