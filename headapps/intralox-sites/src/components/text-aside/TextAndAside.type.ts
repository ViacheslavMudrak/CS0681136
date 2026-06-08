import type { Field, ImageField, TextField } from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from 'lib/component-props';
import type { IVideoFields } from '../../utils/interface';

export interface TextAsideParamValue {
  Value?: {
    value?: string;
  };
}

export interface TextAsideGraphqlDatasource {
  title?: { jsonValue?: TextField };
  Title?: { jsonValue?: TextField };
  description?: { jsonValue?: Field<string> };
  Description?: { jsonValue?: Field<string> };
  mediaCaption?: { jsonValue?: Field<string> };
  MediaCaption?: { jsonValue?: Field<string> };
  mediaType?: { jsonValue?: Field<string> | null };
  MediaType?: { jsonValue?: Field<string> | null };
  image?: { jsonValue?: ImageField };
  Image?: { jsonValue?: ImageField };
  video?: { jsonValue?: IVideoFields | null };
  Video?: { jsonValue?: IVideoFields | null };
  hasTextContentPlaceholder?: { jsonValue?: Field<boolean> };
  HasTextContentPlaceholder?: { jsonValue?: Field<boolean> };
  hasAsideContentPlaceholder?: { jsonValue?: Field<boolean> };
  HasAsideContentPlaceholder?: { jsonValue?: Field<boolean> };
}

export interface TextAndAsideFields {
  Title?: TextField;
  Description?: Field<string>;
  MediaCaption?: Field<string>;
  MediaType?: Field<string> | null;
  Image?: ImageField;
  Video?: IVideoFields | null;
  HasTextContentPlaceholder?: Field<boolean>;
  HasAsideContentPlaceholder?: Field<boolean>;
  data?: {
    datasource?: TextAsideGraphqlDatasource;
  };
}

export type TextAndAsideLayoutFields = Omit<TextAndAsideFields, 'data'>;

type StripIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};

type TextAndAsideParamOverrides = {
  AsideWidth?: TextAsideParamValue | string;
  AlignColumns?: TextAsideParamValue | string;
  ColumnAlignment?: TextAsideParamValue | string;
  AsidePosition?: TextAsideParamValue | string;
  LayoutOrientation?: TextAsideParamValue | string;
  Divider?: TextAsideParamValue | string;
  HasDivider?: TextAsideParamValue | string | number | boolean;
  DynamicPlaceholderId?: string;
  BackgroundColor?: TextAsideParamValue | string;
  backgroundColor?: TextAsideParamValue | string;
};

export type TextAndAsideParams = Omit<
  StripIndexSignature<ComponentProps['params']>,
  keyof TextAndAsideParamOverrides
> &
  TextAndAsideParamOverrides;

export type TextAndAsideProps = Omit<ComponentProps, 'params' | 'fields'> & {
  params: TextAndAsideParams;
  fields?: TextAndAsideFields;
};
