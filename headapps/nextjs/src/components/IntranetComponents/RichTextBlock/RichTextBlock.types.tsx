import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type RichTextBlockFields = {
  richContent: Field<string>;
};

export type RichTextBlockProps = ComponentProps & {
  fields: RichTextBlockFields;
};

export type RichTextBlockVariant =
  | 'Default'
  | 'IntroductionYellowGradient'
  | 'IntroductionBlueGradient';
