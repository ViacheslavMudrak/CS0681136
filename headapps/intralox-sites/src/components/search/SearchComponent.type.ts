import {
  ComponentRendering,
  Field,
  ImageField,
  Page,
} from "@sitecore-content-sdk/nextjs";
import type { SearchResultsStoreState } from "@sitecore-search/react";
import { IParams } from "src/utils/interface";

export interface ISearchComponentProps extends IParams {
  fields: ISearchComponentFields;
  page: Page;
  rendering: ComponentRendering;
}

export interface ISearchComponentFields {
  DefaultImage?: ImageField;
  EnableFacets?: Field<boolean>;
  EnablePagination?: Field<boolean>;
  EnableSortingOptions?: Field<boolean>;
  NoResultFoundDescription?: Field<string>;
  NoResultFoundImage?: ImageField;
  NoResultFoundTitle?: Field<string>;
  PlaceholderText?: Field<string>;
  PreviewWidgetId?: Field<string>;
  SearchWidgetId?: Field<string>;
  SortingOptions?: Field<boolean>;
  MaxItemsDisplayed?: Field<number>;
}

export interface ISearchPageFields {
  Title?: Field<string>;
  Description?: Field<string>;
  Technologies?: ISearchFacetInfoItem[];
  Styles?: ISearchFacetInfoItem[];
  Types?: ISearchFacetInfoItem[];
}

export interface ISearchFacetInfoItem {
  displayName?: string;
  fields?: {
    Name?: Field<string>;
    Title?: Field<string>;
    Description?: Field<string>;
    Synonyms?: Field<string>;
    BeltTypeHelpText?: Field<string>;
    BeltStyleHelpText?: Field<string>;
    Image?: ImageField;
    ThermoDriveSurfaceImage?: ImageField;
    ModularPlasticBeltingSurfaceImage?: ImageField;
  };
}

export interface ISearchResultProps {
  rfkId: string;
  title?: string;
  defaultPage: SearchResultsStoreState["page"];
  defaultItemsPerPage: SearchResultsStoreState["itemsPerPage"];
  defaultKeyphrase: SearchResultsStoreState["keyphrase"];
  localeContext?: {
    language: string;
    country: string;
  };
  pageFields?: ISearchPageFields;
  defaultFacets?: Array<{ facetId: string; facetValueId: string }>;
  fields?: ISearchComponentFields;
  cardType?: string;
  isScollPagination?: boolean;
  isDropdownFacets?: boolean;
  contentType?: string;
  isGlobalSearchContent?: boolean;
  entityType?: string;
  gridType?: string;
}

export interface ISearchResultArticle {
  brightcove_id: string;
  company: string;
  cover_image: string;
  headline: string;
  image_url: string;
  is_featured: boolean;
  summary: string;
  url: string;
  id?: string;
  name?: string;
  article_type?: string;
  post_date?: string;
  series?: string;
  sub_headline?: string;
  description?: string;
  type?: string;
  product_url?: string;
  belt_series?: string[];
}

export interface ICheckedFacets {
  facetId: string;
  facetLabel: string;
  facetValueId: string;
  type: string;
  valueLabel: string;
}
