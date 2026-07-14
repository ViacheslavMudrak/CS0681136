import { ComponentProps } from 'lib/component-props';

import { Field, Item } from '@sitecore-content-sdk/nextjs';

type ReflectionTopics = Item & {
  fields: {
    title: Field<string>;
  };
};

type Icon = Item & {
  fields: {
    value: Field<string>;
  };
};

type BrowseReflectionTopicsFields = {
  label: Field<string>;
  icon: Icon;
  reflectionTopics: ReflectionTopics[];
};

export type BrowseReflectionTopicsProps = ComponentProps & {
  fields: BrowseReflectionTopicsFields;
};
