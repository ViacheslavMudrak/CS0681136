import { Field } from "@sitecore-content-sdk/nextjs";

export interface IScriptContentFields {
  fields: {
    TagId: Field<string>;
    Script: Field<string>;
    IsNoScript: Field<boolean>;
  };
}
