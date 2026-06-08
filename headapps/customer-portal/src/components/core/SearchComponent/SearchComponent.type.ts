import type { Field, ImageField, LinkField, RichTextField, TextField } from "@sitecore-content-sdk/nextjs";

import type { ComponentProps } from "@/lib/component-props";

/** CMS fields for the dashboard Latest News & Insights widget (Sitecore Search-backed). */
export interface ISearchComponentFields {
  SearchWidgetId?: TextField;
  PreviewWidgetId?: TextField;
  DefaultImage?: ImageField;
  PlaceholderText?: TextField;
  SectionTitle?: TextField;
  ViewAllLabel?: TextField;
  ViewAllURL?: LinkField;
  MaxItemsDisplayed?: Field<number>;
  NoResultFoundTitle?: TextField;
  NoResultFoundDescription?: RichTextField;
  NoResultFoundImage?: ImageField;
  EnableSortingOptions?: Field<boolean>;
  EnablePagination?: Field<boolean>;
  ShowSearchBox?: Field<boolean>;
  EnableFacets?: Field<boolean>;
}

export type SearchComponentProps = ComponentProps & {
  fields?: ISearchComponentFields | null;
};

/** Normalized article row for the dashboard list UI. */
export interface NewsInsightArticle {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  postDate: string;
  entityType?: string;
}
