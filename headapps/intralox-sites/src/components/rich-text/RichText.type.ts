import type { Field } from "@sitecore-content-sdk/nextjs";
import type { ComponentProps } from "lib/component-props";

export interface RichTextFieldsGraphQL {
  data?: {
    datasource?: {
      Text?: {
        jsonValue?: Field<string>;
      };
      text?: {
        jsonValue?: Field<string>;
      };
    };
  };
}

export interface RichTextFieldsFlat {
  Text?: Field<string>;
  text?: Field<string>;
}

export type RichTextFields = RichTextFieldsFlat & RichTextFieldsGraphQL;

export type RichTextTheme = "base" | "article" | "compact" | "landingPage";

export type RichTextProps = ComponentProps & {
  fields?: RichTextFields;
  theme?: RichTextTheme;
};
