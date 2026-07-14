import { Field } from '@sitecore-content-sdk/nextjs';

export type ControlSettingItem = {
  fields: ControlSettingItemFields;
};

export type ControlSettingItemFields = {
  value: Field<string>;
};
