import { ComponentProps } from 'lib/component-props';

import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

type ContentCardFields = {
  optionalEyebrow: Field<string>;
  headline: Field<string>;
  cardContent: Field<string>;
  buttonLink: LinkField;
  headlineIcon: Field<string>;
  image: ImageField;
  linkIcon: Field<string>;
};

export type ContentCardProps = ComponentProps & {
  fields: ContentCardFields;
};

export type ContentCardVariant = 'Default' | 'ReflectionResources';
