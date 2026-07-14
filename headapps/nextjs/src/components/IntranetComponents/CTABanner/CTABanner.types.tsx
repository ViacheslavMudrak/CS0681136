import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { ImageReferenceItem } from 'ts/image-reference';

type CTABannerFields = {
  eyebrow: Field<string>;
  headline: Field<string>;
  subtext: Field<string>;
  buttonLink: LinkField;
  backgroundImage: ImageReferenceItem;
};

export type CTABannerProps = ComponentProps & {
  fields: CTABannerFields;
};

export type CTABannerVariant = 'pencil' | 'detailed';
