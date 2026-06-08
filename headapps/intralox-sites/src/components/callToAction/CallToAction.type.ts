import { Field, LinkField, ImageField } from "@sitecore-content-sdk/nextjs";

export interface ICallToActionFields {
  Heading: Field<string>;
  Text: Field<string>;
  Link: LinkField;
  Image: ImageField;
  BackgroundImage: ImageField;
}
