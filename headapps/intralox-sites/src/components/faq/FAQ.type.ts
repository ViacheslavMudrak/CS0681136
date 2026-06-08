import { Field, LinkField } from "@sitecore-content-sdk/nextjs";
import { IFields } from "src/utils/interface";

export interface IFAQFields {
  Title: Field<string>;
  Description: Field<string>;
  FaqItems: IFAQItemFields[];
}

export interface IFAQItemFields {
  id?: string;
  fields: {
    Question: Field<string>;
    Answer: Field<string>;
    FaqGroup: IFAQGroupFields[];
  };
}

export interface IFAQGroupFields {
  fields: {
    Value: Field<string>;
  };
}
