import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type ContentTitleFields = {
  eyebrow: Field<string>;
  headline: Field<string>;
  subtext: Field<string>;
  buttonLink: LinkField;
};

export type ContentTitleProps = ComponentProps & {
  fields: ContentTitleFields;
};
