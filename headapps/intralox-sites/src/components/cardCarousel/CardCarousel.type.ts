import { Field, ImageField, LinkField } from "@sitecore-content-sdk/nextjs";

export interface ICardCarouselFields {
  Cards: ICardFields[];
  Headline: Field<string>;
  Description: Field<string>;
}

export interface ICardFields {
  id: string;
  fields: {
    Heading: Field<string>;
    Description: Field<string>;
    Image: ImageField;
    Link: LinkField;
    ImageOnTop: Field<boolean>;
  };
}
