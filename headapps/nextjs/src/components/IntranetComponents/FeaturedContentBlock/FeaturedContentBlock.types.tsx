import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
// import { ResponsiveImageFields } from 'models/responsive-image';

type FeaturedContentBlockFields = {
  optionalTag: Field<string>;
  headlineText: Field<string>;
  blockContent: Field<string>;
  buttonLink: LinkField;
  desktopImage: ImageField;
  mobileImage: ImageField;
  publishedDate: Field<string>;
};

export type FeaturedContentBlockProps = ComponentProps & {
  fields: FeaturedContentBlockFields;
};
