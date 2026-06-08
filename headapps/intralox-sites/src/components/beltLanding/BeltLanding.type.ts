import { Field } from "@sitecore-content-sdk/nextjs";
import { IFields } from "src/utils/interface";

export interface IBeltLandingFields {
  AccessoriesPageLink: Field<string>;
  SeriesPageLink: Field<string>;
  SprocketsPageLink: Field<string>;
  ToolsPageLink: Field<string>;
}

export interface IBeltLandingPageFields {
  Title: Field<string>;
  ContainerWidth: IFields;
}
