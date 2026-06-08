import type { Field, ImageField, LinkField } from "@sitecore-content-sdk/nextjs";

export interface IFeaturedContentCardFields {
  Title: Field<string>;
  Description: Field<string>;
  Icon: ImageField;
  Link: LinkField;
}

export interface IFeaturedContentCard {
  id: string;
  url: string;
  name: string;
  displayName: string;
  fields: IFeaturedContentCardFields;
}

export interface IFeaturedContentFields {
  PrimaryTitle: Field<string>;
  SecondaryTitle: Field<string>;
  Description: Field<string>;
  ContentCards: Array<IFeaturedContentCard>;
  Logo: ImageField;
  BackgroundImage: ImageField;
  Content: Field<string>;
}

export interface IFeaturedContentLobbyExperienceFields {
  PrimaryTitle: Field<string>;
  Description: Field<string>;
  ContentCards: Array<IFeaturedContentCard>;
  Content: Field<string>;
  WebsiteURL: LinkField;
  CopyRightText: Field<string>;
}
