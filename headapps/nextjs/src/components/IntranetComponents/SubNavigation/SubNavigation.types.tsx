import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { NavItem } from 'ts/nav-item';

type SubNavItemConfigurationNode = {
  subNavigation: null | {
    targetItem: SubNavDatasource;
  };
};

export type SubNavDatasource = {
  sectionNameLink: {
    jsonValue: LinkField;
  };
  children: {
    results: SubNavItem[];
  };
};

export type SubNavigationGraphQLResponse = {
  current: SubNavItemConfigurationNode;
  matches: {
    ancestors: SubNavItemConfigurationNode[];
  };
};

type SubNavigationFields = {
  data: {
    current: SubNavItemConfigurationNode;
    matches: {
      ancestors: SubNavItemConfigurationNode[];
    };
  };
};

export type SubNavigationProps = ComponentProps & {
  fields: SubNavigationFields;
  subNavigationData?: SubNavigationGraphQLResponse;
};

export type VisibleByEmail = null | {
  email: Field<string>;
};

export type SubNavItem = {
  menuItem: {
    jsonValue: LinkField;
  };
  dropdownLabel: {
    jsonValue: Field<string>;
  };
  children: {
    results: NavItem[];
  };
  visibleBy: {
    targetItems: VisibleByEmail[];
  };
};
