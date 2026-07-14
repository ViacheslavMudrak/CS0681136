import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { JsonValue } from 'ts/fields';

type ValueIcon = {
  targetItem: {
    id: string;
    name: string;
    value: Field<string>;
    customSvg?: Field<string>;
  } | null;
};

export type ValueCard = {
  valueTitle?: JsonValue<string>;
  valueDescription?: JsonValue<string>;
  valueIcon: ValueIcon;
};

type ValuesDataSource = {
  title: JsonValue<string>;
  paragraph: JsonValue<string>;
  children: {
    results: ValueCard[];
  };
};

type ValuesFields = {
  data: {
    datasource: ValuesDataSource;
  };
};

export type ValuesProps = ComponentProps & {
  fields: ValuesFields;
};
