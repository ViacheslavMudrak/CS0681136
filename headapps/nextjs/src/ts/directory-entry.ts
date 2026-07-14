import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { IconItem } from './custom-link';

export type DirectoryEntryItem = {
  fields: DirectoryEntryFields;
};

export type DirectoryEntryFields = {
  entryLink: LinkField;
  entryIcon: IconItem;
  entryTags: Field<string>;
};
