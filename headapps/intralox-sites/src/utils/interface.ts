import { Field, ImageField, LinkField } from "@sitecore-content-sdk/nextjs";

export interface IParams {
  /** Sitecore rendering params — dynamic keys; components narrow where needed. */
  params: { [key: string]: any };
}
export interface ILinkFields {
  fields: {
    Colorscheme: { fields: { Value: Field<string> } };
    Icon: { fields: { Value: Field<string> } };
    IconPosition: { fields: { Value: Field<string> } };
    Link: LinkField;
    Style: { fields: { Value: Field<string> } };
  };
}
export interface IVideoFields {
  fields: {
    Autoplay: Field<boolean>;
    BrightcoveId: Field<string>;
    Caption: Field<string>;
    CoverImage: ImageField;
    Loop: Field<boolean>;
    Title: Field<string>;
    /** Intrinsic width in pixels when stored on the video item (e.g. Brightcove / CMS metadata). */
    Width?: Field<number | string>;
    Height?: Field<number | string>;
  };
}

export interface IFields {
  fields: {
    Value: Field<string>;
  };
}
