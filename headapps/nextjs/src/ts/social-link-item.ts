import { LinkField } from '@sitecore-content-sdk/nextjs';
import { IconItem } from 'ts/custom-link';

export type SocialLinkItem = {
  id: string;
  url: string;
  name: string;
  displayName: string;
  fields: {
    socialIcon: IconItem;
    socialLink: {
      value: LinkField;
    };
  };
};
