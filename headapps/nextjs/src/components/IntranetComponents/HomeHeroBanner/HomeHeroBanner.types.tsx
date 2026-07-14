import { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { CustomLinkItem } from 'ts/custom-link';
import { ImageReferenceItem } from 'ts/image-reference';

type HomeHeroBannerFields = {
  optionalEyebrow: Field<string>;
  bannerHeadlineText: Field<string>;
  bannerSubtext: Field<string>;
  desktopBannerImage: ImageField;
  mobileBannerImage: ImageField;
  additionalLinksSectionHeader: Field<string>;
  backgroundImage: ImageReferenceItem;
  quickLinks: CustomLinkItem[];
};

export type HomeHeroBannerProps = ComponentProps & {
  fields: HomeHeroBannerFields;
};

export type HomeHeroBannerVariant = 'FunctionHomeHero' | 'ResourceHomeHero';
