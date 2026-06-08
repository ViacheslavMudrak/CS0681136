import {
  ComponentRendering,
  Field,
  ImageField,
  Page,
} from "@sitecore-content-sdk/nextjs";
import { IParams } from "src/utils/interface";

export interface IBeltIndentifyProps extends IParams {
  fields: IBeltIdentifyFields;
  page: Page;
  rendering: ComponentRendering;
}
export interface IBeltIdentifyFields {
  ButtonText: Field<string>;
  SearchWidgetId: Field<string>;
  Step1Message: Field<string>;
  Step1Title: Field<string>;
  Step2Message: Field<string>;
  Step2Title: Field<string>;
  Step3Message: Field<string>;
  Step3Title: Field<string>;
  Step4Message: Field<string>;
  Step4Title: Field<string>;
}
export interface IBeltIdentifierPageFields {
  Technologies: ITechnologyFields[];
  Types: ITypeFields[];
}
export interface ITypeFields {
  fields: {
    BeltTypeHelpText: Field<string>;
    Name: Field<string>;
    Image: ImageField;
  };
}
export interface ITechnologyFields {
  fields: {
    Title: Field<string>;
    Description: Field<string>;
    Image: ImageField;
  };
}
export interface IBeltFinderSearchResultProps {
  defaultPage: number;
  defaultKeyphrase: string;
  defaultItemsPerPage: number;
  localeContext: {
    language: string;
    country: string;
  };
  fields: IBeltIdentifyFields;
  cardType: string;
  routeFields?: IBeltIdentifierPageFields;
}
