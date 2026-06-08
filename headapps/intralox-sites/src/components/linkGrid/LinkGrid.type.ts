import { Field } from "@sitecore-content-sdk/nextjs";

export interface ILinkGridFields {
  Headline: Field<string>;
  Description: Field<string>;
  Eyebrow: Field<string>;
  ContentItems: { value: IServiceListingsFields[] };
  ItemCount: { Value: string };
  Type?: Field<string>;
}

export interface IServiceListingsFields {
  Title: string;
  LinkURL: string;
  Image: string;
  Description: string;
  SubIndustries: ISubIndustryFields[];
}
export interface ISubIndustryFields {
  Title: string;
  Url: string;
}
