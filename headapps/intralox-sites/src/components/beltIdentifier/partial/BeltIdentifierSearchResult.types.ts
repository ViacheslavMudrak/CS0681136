import type { Field, ImageField } from "@sitecore-content-sdk/nextjs";

export interface IFacetValue {
  id: string;
  text: string;
  count?: number;
}

export interface IFacet {
  name: string;
  label?: string;
  value: IFacetValue[];
}

export interface IRouteCardFields {
  Title?: Field<string>;
  Description?: Field<string>;
  Image?: ImageField;
}

export interface IRouteCardItem {
  fields?: IRouteCardFields;
}

export interface IRenderableCard extends IRouteCardFields {
  id: string;
  valueId: string;
}

export type BeltPitchUnit = "us" | "metric";
