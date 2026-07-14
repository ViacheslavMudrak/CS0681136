import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type ExternalLinkBannerFields = {
  optionalEyebrow: Field<string>;
  mainText: Field<string>;
  icon1Image: ImageField;
  icon1Description: Field<string>;
  icon1Button: LinkField;
  icon2Image: ImageField;
  icon2Description: Field<string>;
  icon2Button: LinkField;
};

type ExternalLinkBannerParams = {
  showIcons?: string;
};

export type ExternalLinkBannerProps = ComponentProps & {
  fields: ExternalLinkBannerFields;
  params?: ExternalLinkBannerParams;
};
