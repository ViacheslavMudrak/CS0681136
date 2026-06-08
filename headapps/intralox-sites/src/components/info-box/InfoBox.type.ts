import type { Field } from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from 'lib/component-props';

/** Droplink target item for the Context field (Info / Success / None). */
export interface InfoBoxContextItem {
  id?: string;
  name?: string;
  displayName?: string;
  fields?: { Value?: { value?: string } };
}

/** Layout service / Edge flat field shape. */
export interface InfoBoxFieldsFlat {
  Text?: Field<string>;
  Context?: Field<string> | InfoBoxContextItem;
  HideIcon?: Field<boolean | string> | boolean;
}

/** Optional integrated GraphQL datasource shape. */
export interface InfoBoxFieldsGraphQL {
  data?: {
    datasource?: {
      text?: { jsonValue?: Field<string> };
      Text?: { jsonValue?: Field<string> };
      context?: { jsonValue?: Field<string> | InfoBoxContextItem };
      Context?: { jsonValue?: Field<string> | InfoBoxContextItem };
      hideIcon?: { jsonValue?: Field<boolean | string> | boolean };
      HideIcon?: { jsonValue?: Field<boolean | string> | boolean };
    };
  };
}

export type InfoBoxFields = InfoBoxFieldsFlat | InfoBoxFieldsGraphQL;

export type InfoBoxProps = ComponentProps & {
  fields?: InfoBoxFields;
};
