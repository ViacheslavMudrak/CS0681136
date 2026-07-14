import { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export type MessageWithImageFields = {
  optionalEyebrow: Field<string>;
  headline: Field<string>;
  backgroundImage: ImageField;
  enableAscensionGraphic: Field<boolean>;
};

export type MessageWithImageProps = ComponentProps;
