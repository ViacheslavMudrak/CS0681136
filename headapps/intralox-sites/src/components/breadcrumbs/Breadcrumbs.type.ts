import { Field } from "@sitecore-content-sdk/core/types/layout";

export interface IBreadcrumbsFields {
  data: IBreadcrumbCurrentPageFields;
}

export interface IBreadcrumbCurrentPageFields {
  currentPage: IBreadcrumbItemFields;
}

export interface IBreadcrumbItemFields {
  Title: { data: Field<string> };
  BreadcrumbData: IBreadcrumbItemsFields[];
}

export interface IBreadcrumbItemsFields {
  Title: { data: Field<string> };
  Link: { url: string };
  IsPageSearchable: Field<boolean>;
}
