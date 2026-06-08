import type { Field, ImageField, LinkField, TextField } from "@sitecore-content-sdk/nextjs";
import type { ComponentProps } from "lib/component-props";

export interface CustomerSupportComponentFields {
  PageIcon?: ImageField;
  Headline?: TextField;
  BodyText?: Field<string>;
  SupportPromptText?: Field<string>;
  SupportLinkLabel?: Field<string>;
  BackSignInButtonLabel?: Field<string>;
  ReturnLinkLabel?: Field<string>;
  ReturnLinkURL?: LinkField;
  CopyRightText: Field<string>;
  WebsiteURL: LinkField;
  SupportLink?: LinkField;
}

export type CustomerSupportComponentProps = ComponentProps & {
  fields?: CustomerSupportComponentFields;
};
