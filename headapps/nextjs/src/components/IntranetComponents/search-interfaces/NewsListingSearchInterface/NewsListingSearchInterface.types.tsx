import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
// import { ResponsiveImageFields } from 'models/responsive-image';

type NewsListingSearchInterfaceFields = {
  newsListingTitle: Field<string>;
  searchPlaceholderText: Field<string>;
};

export type NewsListingSearchInterfaceProps = ComponentProps & {
  fields: NewsListingSearchInterfaceFields;
};
