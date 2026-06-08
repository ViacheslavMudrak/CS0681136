import { ComponentRendering, Field, ImageField, Page } from "@sitecore-content-sdk/nextjs";
import { IFields, IVideoFields } from "src/utils/interface";

export interface IArticlePageFields {
  page: Page;
  rendering: ComponentRendering;
}
export interface IArticleBannerFields {
  ArticleType: IFields;
  Author: IAuthorFields;
  ContainerWidth: IFields;
  Content: Field<string>;
  Video: IVideoFields;
  PostDate: Field<string>;
  Title: Field<string>;
  Image: ImageField;
  SubHeadline: Field<string>;
  HideDate: Field<boolean>
}

export interface IAuthorFields {
  fields: {
    Bio: Field<string>;
    Image: ImageField;
    Name: Field<string>;
  };
}
