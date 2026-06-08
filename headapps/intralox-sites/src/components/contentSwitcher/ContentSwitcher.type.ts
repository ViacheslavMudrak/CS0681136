import { Field, ImageField, LinkField } from "@sitecore-content-sdk/nextjs";
import { IVideoFields } from "src/utils/interface";

export interface IContentSwitcherFields {
  Headline: Field<string>;
  Description: Field<string>;
  TabItems: ITabItemsFields[];
}

export interface ITabItemsFields {
  id: string;
  /** Sitecore content item path; last segment drives `?solution=` (lowercased), e.g. `.../Modular-Plastic-Belting`. */
  url?: string;
  fields: {
    Image: ImageField;
    MediaType: IFieldsProps;
    TabContent: Field<string>;
    TabLabel: Field<string>;
    Video: IVideoFields;
  };
}

export interface IFieldsProps {
  fields: {
    Value: Field<string>;
  };
}
