import { LinkField, Field } from '@sitecore-content-sdk/nextjs';
import { DirectoryEntryItem } from './directory-entry';
import { ControlSettingItem, ControlSettingItemFields } from './control-setting';

export type IconItem = ControlSettingItem & {
  fields: IconItemFields;
};

export type IconItemFields = ControlSettingItemFields & {
  customSvg?: Field<string>;
};

export type CustomLinkItem = {
  fields: CustomLinkFields;
};

export type CustomLinkFields = {
  generalLink: LinkField;
  directoryEntry: DirectoryEntryItem[];
  linkIcon: IconItem;
  description?: Field<string>;
};
