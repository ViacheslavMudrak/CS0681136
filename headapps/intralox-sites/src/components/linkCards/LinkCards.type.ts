import { Field, ImageField, LinkField } from "@sitecore-content-sdk/nextjs";

export interface ILinkCardsFields {
  Cards: ICardsFields[];
  TileCount: IFields;
  Headline: Field<string>;
  Description: Field<string>;
}

export interface ICardsFields {
  fields: {
    ColorScheme: IFields;
    Heading: Field<string>;
    Description: Field<string>;
    FocalPoint: IFields;
    Image: ImageField;
    Link: LinkField;
  };
}

export interface IFields {
  fields: {
    Value: Field<string>;
  };
}
