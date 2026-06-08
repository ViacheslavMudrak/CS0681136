import { Field, ImageField } from "@sitecore-content-sdk/nextjs";
import { ILinkFields, IVideoFields } from "src/utils/interface";

export interface BillboardFields {
  BackgroundImage: ImageField;
  ButtonAlignment: IField;
  Description: Field<string>;
  Eyebrow: Field<string>;
  Headline: Field<string>;
  Links: ILinkFields[];
  Subheading: Field<string>;
  MediaType: IField;
  Video: IVideoFields;
  FocalPoint:IField;
}

export interface IField {
  fields: {
    Value: Field<string>;
  };
}
