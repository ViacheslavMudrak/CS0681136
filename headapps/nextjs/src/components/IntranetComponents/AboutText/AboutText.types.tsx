import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
// import { ResponsiveImageFields } from 'models/responsive-image';

type AboutTextFields = {
  headline: Field<string>;
  subHeadline: Field<string>;
  body: Field<string>;
};

export type AboutTextProps = ComponentProps & {
  fields: AboutTextFields;
};
