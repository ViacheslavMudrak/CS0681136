import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { CustomLinkItem } from 'ts/custom-link';
import { NavItem } from 'ts/nav-item';
import { SocialLinkItem } from 'ts/social-link-item';

export interface GlobalFooterColumn {
  footerColumnHeader: {
    jsonValue: Field<string>;
  };
  children: {
    results: NavItem[];
  };
}

export type GlobalFooterDatasource = {
  footerImage: {
    jsonValue: ImageField;
  };
  footerImageLink: {
    jsonValue: LinkField;
  };
  footerMissionTagLine: {
    jsonValue: Field<string>;
  };
  socialIconLinks: {
    jsonValue: SocialLinkItem[];
  };
  copyrightText: {
    jsonValue: Field<string>;
  };
  legalLinks: {
    jsonValue: CustomLinkItem[];
  };
  children: {
    results: GlobalFooterColumn[];
  };
};

export type GlobalFooterGraphQLResponse = {
  datasource: GlobalFooterDatasource;
};

type GlobalFooterFields = {
  data?: {
    datasource?: GlobalFooterDatasource;
  };
};

export type GlobalFooterProps = ComponentProps & {
  fields: GlobalFooterFields;
  datasource?: GlobalFooterDatasource;
};

export const GlobalFooterStatics = {
  BackToTopText: 'Back to Top',
};
