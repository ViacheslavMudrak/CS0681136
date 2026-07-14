export type SearchResultItem = {
  id: string;
  name: string;
  path: string;
  lastUpdated: {
    value: string;
  };
  template: {
    id: string;
    name: string;
  };
  url: {
    path: string;
  };
};

export type SearchResponse = {
  search: {
    total: number;
    pageInfo: {
      endCursor: string;
      hasNext: boolean;
    };
    results: SearchResultItem[];
  };
};

export type GetPagesByLastUpdatedParams = {
  startDate: string;
  endDate?: string;
  edgeContextId?: string;
  templateFiltersInclude?: string[];
  templateFiltersExclude?: string[];
};

export type PublishedPageResult = {
  Name: string;
  'Page Path': string;
  'Last Updated': string;
  ID: string;
  'Template ID': string;
  'Template Name': string;
};
