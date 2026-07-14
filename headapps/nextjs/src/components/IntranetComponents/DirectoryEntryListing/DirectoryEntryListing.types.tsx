import { ComponentProps } from 'lib/component-props';

import { Field } from '@sitecore-content-sdk/nextjs';

// Directory Entry item type matching Sitecore Search indexed attributes
export type DirectoryEntryItem = {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  url?: string;
  path?: string;
  source_id?: string;
  icon?: string;
  tags?: string[];
  organized_category_group_tags?: string[];
  result_type?: string; // e.g. "Directory Entry"
  ancestors?: string[]; // TODO: Will be added by backend - array of all parent folder paths
  // Additional fields that may be indexed
  job_title?: string;
  department?: string;
  site_area?: string;
  location?: string;
  hire_date?: string;
  phone?: string;
  email?: string;
};

// Directory folder reference type
type DirectoryReference = {
  id: string;
  url: string;
  name: string;
  displayName: string;
  fields: Record<string, unknown>;
};

export type ListTypeField = {
  targetItems?: {
    path?: string;
    id?: string;
    name?: string;
  }[];
};

type DirectoryEntryListingFields = {
  searchPlaceholderText?: Field<string>;
  listingTitle?: Field<string>;
  // Directory folder reference
  directory?: DirectoryReference;
  // Datasource context (available when component has a datasource)
  data?: {
    datasource?: {
      listingTitle?: { value?: string };
      autoFilterEnabled?: { value?: string };
      searchPlaceholderText?: { value?: string };
      directoryEntries?: ListTypeField;
      topicTags?: ListTypeField;
      manualDirectoryEntries?: ListTypeField;
    };
    page?: {
      areaTags?: ListTypeField;
    };
  };
};

// Rendering params for conditional features
export type DirectoryEntryListingParams = {
  abilitytoSearch?: string;
  abilitytoFavorite?: string;
  abilitytoFilter?: string;
  GridParameters?: string;
  FieldNames?: string;
  DynamicPlaceholderId?: string;
};

export type DirectoryEntryListingProps = ComponentProps & {
  fields: DirectoryEntryListingFields;
  params?: DirectoryEntryListingParams;
};

export const DirectoryEntryListingStatics = {
  searchPlaceholderText: 'Search directory entries...',
  listingTitle: 'Directory',
  filtersLabel: 'Filters',
  resultsLabel: 'results',
  loadingText: 'Loading...',
  noMatchesTitle: 'No matches found',
  noMatchesDescription: 'Try different search terms or adjust your filters.',
  addedToFavorites: 'Added to Favorites',
  directoryEntryListAriaLabel: 'Directory entry list',
};
