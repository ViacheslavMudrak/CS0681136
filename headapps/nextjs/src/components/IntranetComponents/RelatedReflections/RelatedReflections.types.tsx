import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { ReflectionDetailPage_GraphQL } from 'src/models/graphql/reflection-detail';

export type ReflectionsTag = {
  id: string;
  name: string;
};
export type RelatedReflectionsFields = {
  title: Field<string>;
  link: LinkField;

  reflectionsTags: {
    targetItems: ReflectionsTag[];
  };
};

export type QueryData = {
  search: {
    results: ReflectionDetailPage_GraphQL[];
  };
};

export type RelatedReflectionsProps = ComponentProps & {
  fields: RelatedReflectionsFields;
};

export const RelatedReflectionsStatics = {
  editingEmptyNote:
    'Authoring note: No reflections found with matching tags. Add or update tags on this item to show related reflections.',
};
