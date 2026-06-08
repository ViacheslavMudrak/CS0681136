import type { Field, LinkField } from "@sitecore-content-sdk/nextjs";

export interface IAuthFields {
  AuthenticationType: Field<string>;
  AuthenticationHeader: Field<string>;
  BottomInfo: Field<string>;
  WebsiteURL: LinkField;
  CopyRightText: Field<string>;
  ContactSupportLink: LinkField;
}
