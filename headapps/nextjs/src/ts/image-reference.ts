import { ImageField } from '@sitecore-content-sdk/nextjs';

export type ImageReferenceItem = {
  name: string;
  fields: ImageReferenceFields;
};

export type ImageReferenceFields = {
  image: ImageField;
};
