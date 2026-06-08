import type { Field, ImageField } from '@sitecore-content-sdk/nextjs';

export interface ILanguageSourceFields {
  'Base Culture': Field<string>;
  'Fallback Region Display Name': Field<string>;
  Charset: Field<string>;
  'Code page': Field<string>;
  Dictionary: Field<string>;
  Encoding: Field<string>;
  'Fallback Language': Field<string>;
  Iso: Field<string>;
  'Regional Iso Code': Field<string>;
  'WorldLingo Language Identifier': Field<string>;
}

export interface ILanguageSource {
  id: string;
  url: string;
  name: string;
  displayName: string;
  fields: ILanguageSourceFields;
}

export interface ILanguageSelectionFields {
  LanguageTitle: Field<string>;
  LanguageSource: ILanguageSource;
}

export interface ILanguageSelection {
  id: string;
  url: string;
  name: string;
  displayName: string;
  fields: ILanguageSelectionFields;
}

export interface ILanguageSwitcherFields {
  Title: Field<string>;
  LanguageSelection: Array<ILanguageSelection>;
  Icon: ImageField;
}
