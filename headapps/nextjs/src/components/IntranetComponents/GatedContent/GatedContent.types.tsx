import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
// import { ResponsiveImageFields } from 'models/responsive-image';

type GatedContentFields = {
  eyebrow: Field<string>;
  componentHeadline: Field<string>;
  subtext: Field<string>;
  dividerText: Field<string>;
  requestLink: LinkField;
  ctaLink: LinkField;
};

export type GatedContentProps = ComponentProps & {
  fields: GatedContentFields;
};
