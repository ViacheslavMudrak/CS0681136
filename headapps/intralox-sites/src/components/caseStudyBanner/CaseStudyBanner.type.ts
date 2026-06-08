import {
  ComponentRendering,
  Field,
  ImageField,
  LinkField,
  Page,
} from "@sitecore-content-sdk/nextjs";
import { IFields, IVideoFields } from "src/utils/interface";

export interface ICaseStudyPageFields {
  page: Page;
  rendering: ComponentRendering;
}

export interface ICaseStudyBannerFields {
  ContainerWidth: IFields;
  Callouts: ICalloutsFields;
  Content: Field<string>;
  Headline: Field<string>;
  Image: ImageField;
  Video: IVideoFields;
  Industries: IIndustriesFields[];
  Products: IIndustriesFields[];
  Solutions: IIndustriesFields[];
  Company: ICompanyFields;
  AdditionalMedia: ImageField;
}
export interface ICompanyFields {
  fields: {
    Name: Field<string>;
    Logo: ImageField;
    Link: LinkField;
  };
}

export interface ICalloutsFields {
  fields: { Callouts: ICalloutsItemFields[] };
}

export interface ICalloutsItemFields {
  fields: {
    Colorscheme: IFields;
    Label: Field<string>;
    Link: LinkField;
    PrependValue: Field<string>;
    Value: Field<string>;
    AppendValue: Field<string>;
  };
}

export interface IIndustriesFields {
  fields: {
    Title: Field<string>;
  };
}
