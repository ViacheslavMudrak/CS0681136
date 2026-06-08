import { Field, ImageField, LinkField } from "@sitecore-content-sdk/nextjs";
import { IFields, IVideoFields } from "src/utils/interface";

export interface ISolutionsGroupFields {
  Image: ImageField;
  MediaType: IFields;
  Text: Field<string>;
  Video: IVideoFields;
  QuickLinks: IQuickLinksFields[];
}

export interface IQuickLinksFields {
  fields: {
    Link: LinkField;
    Description: Field<string>;
    Image: ImageField;
    Title: Field<string>;
    Icon: IFields;
  };
}
