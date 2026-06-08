import type { JSX } from "react";
import { IParams } from "src/utils/interface";
import { ISolutionsGroupFields } from "./SolutionsGroup.type";
import { SolutionsGroupClient } from "./partial/SolutionsGroupClient";

interface ISolutionsGroupProps extends IParams {
  fields: ISolutionsGroupFields;
}

const DefaultBase = ({ fields, params }: ISolutionsGroupProps): JSX.Element => {
  return <SolutionsGroupClient fields={fields} params={params} />;
};

export const Default = DefaultBase;
