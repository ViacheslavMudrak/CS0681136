import { ComponentProps } from 'lib/component-props';
import { CustomLinkItem } from 'ts/custom-link';

import { Field } from '@sitecore-content-sdk/nextjs';

export type SubItemLink = {
  name: string;
  title: {
    value: string;
  };
  navigationTitle: {
    value: string;
  };
  url: {
    path: string;
  };
};

export type Response_GQL = {
  subItemLinks: {
    pageInfo: {
      endCursor: string;
      hasNext: boolean;
    };
    total: number;
    results: SubItemLink[];
  };
};

export type SubItemLinkS = {
  subItemLinks: SubItemLink[];
};

export type DynamicNavigationListFields = {
  sectionTitle: Field<string>;
  pageLevel: Field<string>;
  extraLinks: CustomLinkItem[];
};

export type DynamicNavigationListProps = ComponentProps &
  SubItemLinkS & {
    fields: DynamicNavigationListFields;
  };

export const DynamicNavigationListStatics = {
  noSearchResultsMessage: 'No results found for $searchKey.',
  searchBoxPlaceholderText: 'Search',
  showAllLabel: 'Showing all',
  clearLink: 'Clear',
};
