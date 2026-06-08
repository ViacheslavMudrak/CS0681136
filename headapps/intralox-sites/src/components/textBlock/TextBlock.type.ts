import { Field, LinkField } from "@sitecore-content-sdk/nextjs";

export interface ITextBlockFields {
  Description: Field<string>;
  Title: Field<string>;
  Eyebrow: Field<string>;
  Link: LinkField;
}
