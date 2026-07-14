import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type EmbedCodeBlockFields = {
  optionalEyebrow: Field<string>;
  headlineText: Field<string>;
  subtext: Field<string>;
  buttonLinkOne: LinkField;
  buttonLinkTwo: LinkField;
  code: Field<string>;
};

export type EmbedCodeBlockProps = ComponentProps & {
  fields: EmbedCodeBlockFields;
};

export type EmbedCodeBlockVariant = 'Full' | 'FiftyFifty';
