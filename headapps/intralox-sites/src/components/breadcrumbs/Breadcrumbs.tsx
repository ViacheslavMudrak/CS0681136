import { JSX } from "react";
import { Page } from "@sitecore-content-sdk/nextjs";
import { IBreadcrumbsFields } from "./Breadcrumbs.type";
import { IParams } from "src/utils/interface";

import { BreadcrumbsClient } from "./partial/BreadcrumbsClient";
export interface IBreadcrumbsProps extends IParams {
  fields: IBreadcrumbsFields;
  page: Page;
}
const DefaultBase = ({ fields, params, page }: IBreadcrumbsProps): JSX.Element => {
  return <BreadcrumbsClient fields={fields} params={params} page={page} />;
};

export const Default = DefaultBase;
