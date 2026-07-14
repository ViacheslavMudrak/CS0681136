import React from 'react';
import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

// Fields for TabContainer datasource
export type TabContainerFields = {
  containerTitle?: Field<string>;
};

// Props for TabContainer component
export type TabContainerProps = ComponentProps & {
  fields: TabContainerFields;
  placeholders: Record<string, React.ReactNode>;
};

// Fields for TabItem datasource
export type TabItemFields = {
  tabTitle: Field<string>;
};

// Props for TabItem component
export type TabItemProps = ComponentProps & {
  fields: TabItemFields;
  params: ComponentProps['params'] & {
    DynamicPlaceholderId?: string;
  };
};
