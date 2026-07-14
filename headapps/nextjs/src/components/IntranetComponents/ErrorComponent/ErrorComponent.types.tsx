import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type ErrorComponentFields = {
  eyebrow: Field<string>;
  componentHeadline: Field<string>;
  subtext: Field<string>;
  searchBarPlaceholderText: Field<string>;
  dividerText: Field<string>;
  buttonLink: LinkField;
  requestAccessButton?: LinkField;
};

export type ErrorComponentProps = ComponentProps & {
  fields: ErrorComponentFields;
};

export const ErrorComponentStatics = {
  defaultDividerText: '— or —',
};
