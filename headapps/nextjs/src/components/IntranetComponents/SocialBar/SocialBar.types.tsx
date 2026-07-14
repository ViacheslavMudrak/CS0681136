import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { IconItem } from 'ts/custom-link';
import { SocialLinkItem } from 'ts/social-link-item';

type SocialBarFields = {
  socialBarIcon: IconItem;
  headlineText: Field<string>;
  ctaTextLink: LinkField;
  socialIconLinks: SocialLinkItem[];
};

export type SocialBarProps = ComponentProps & {
  fields: SocialBarFields;
};
