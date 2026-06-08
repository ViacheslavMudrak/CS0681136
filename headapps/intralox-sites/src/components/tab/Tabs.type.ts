import { Field } from "@sitecore-content-sdk/nextjs";

export interface ITabFields {
  TabItems: ITabItemFields[];
}

export interface ITabItemFields {
  fields: {
    ComponentId: Field<string>;
    Title: Field<string>;
    Description: Field<string>;
  };
}
