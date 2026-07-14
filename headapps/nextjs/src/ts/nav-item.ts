import { LinkField } from '@sitecore-content-sdk/nextjs';

export interface NavItem {
  menuItem: {
    jsonValue: LinkField;
  };
}
