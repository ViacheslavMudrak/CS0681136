import type { Field, LinkField, TextField } from "@sitecore-content-sdk/nextjs";
import type { ComponentProps } from "lib/component-props";

export interface FooterSubLinkItem {
  id: string;
  displayName?: string;
  fields?: {
    Link?: LinkField;
    Title?: TextField;
  };
}

export interface FooterMainLinkItem {
  id: string;
  displayName?: string;
  fields?: {
    Title?: TextField;
    /** Optional column landing URL; when set, the column heading is rendered as a link with the same hover treatment as other footer nav links. */
    Link?: LinkField;
    ChildLinks?: FooterSubLinkItem[];
  };
}

export interface FooterSecondaryLinkItem {
  id: string;
  displayName?: string;
  fields?: {
    Link?: LinkField;
  };
}

export interface FooterSocialLinkItem {
  id: string;
  displayName?: string;
  fields?: {
    Link?: LinkField;
    IconCssClass?: TextField;
  };
}

export interface FooterFields {
  MainLinks?: FooterMainLinkItem[];
  CopyrightText?: Field<string>;
  SecondaryLinks?: FooterSecondaryLinkItem[];
  SocialLinks?: FooterSocialLinkItem[];
}

export type FooterProps = ComponentProps & {
  fields: FooterFields;
};
