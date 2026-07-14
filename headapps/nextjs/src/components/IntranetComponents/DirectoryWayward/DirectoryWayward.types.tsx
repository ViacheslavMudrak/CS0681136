import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

// Droplink reference type
type DroplinkReference = {
  id: string;
  url: string;
  name: string;
  displayName: string;
  fields: Record<string, unknown>;
};

export type DirectoryWaywardProps = ComponentProps & {
  fields: {
    headline: Field<string>;
    searchBarPlaceholder?: Field<string>;
    viewAllLinkText: Field<string>;
    directorySearchPage?: DroplinkReference;
  };
};

export const DirectoryWaywardStatics = {
  defaultSearchPlaceholder: 'Search all documents in this category...',
  defaultComponentTitle: 'Document Directory',
  defaultViewAllText: 'VIEW ALL DOCUMENTS',
};
