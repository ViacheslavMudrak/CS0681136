import { ComponentProps } from 'lib/component-props';

type BreadcrumbFields = {
  id: string;
  displayName: string;
  title: {
    jsonValue: {
      value: string;
    };
  };
  navTitle: {
    jsonValue: {
      value: string;
    };
  };
  hideInBreadcrumbs: {
    jsonValue: {
      value: string;
    };
  };
  url: { path: string };
};
export type BreadcrumbProps = ComponentProps & {
  fields: {
    data: {
      currentItem: BreadcrumbFields & {
        breadcrumbItems: BreadcrumbFields[];
      };
    };
  };
};
