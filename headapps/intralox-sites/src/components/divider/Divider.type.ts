import type { Field } from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from 'lib/component-props';

export interface DividerDropdownItem {
  id?: string;
  name?: string;
  displayName?: string;
  fields?: { Value?: { value?: string } };
}

export interface DividerFieldsFlat {
  Style?: Field<string> | DividerDropdownItem;
  Spacing?: Field<string> | DividerDropdownItem;
  /** Droplist: 10%–90% via stored value, or Full for 100%. REST: `Width`; Edge often: `width`. */
  Width?: Field<string> | DividerDropdownItem | null;
  width?: Field<string> | DividerDropdownItem | null;
  ShowDivider?: Field<string | boolean>;
}

export interface DividerFieldsGraphQL {
  data?: {
    datasource?: {
      style?: { jsonValue?: Field<string> };
      spacing?: { jsonValue?: Field<string> };
      width?: { jsonValue?: Field<string> };
      Width?: { jsonValue?: Field<string> };
      showDivider?: { jsonValue?: Field<string | boolean> };
    };
  };
}

export type DividerFields = DividerFieldsFlat | DividerFieldsGraphQL;

export type DividerParams = ComponentProps['params'] & {
  Position?: { Value?: { value?: string } } | string;
  ShowDivider?: { value?: string } | string | boolean;
};

export type DividerProps = ComponentProps & {
  fields?: DividerFields;
  params: DividerParams;
};