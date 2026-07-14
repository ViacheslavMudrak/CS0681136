import { ComponentProps } from 'lib/component-props';
import { Field, LinkField } from '@sitecore-content-sdk/nextjs';

export type ReflectionDetailHeaderFields = {
  label: Field<string>;
  googleSlideFile: LinkField;
  pdfFile: LinkField;
};

export type ReflectionDetailHeaderProps = ComponentProps & {
  fields: ReflectionDetailHeaderFields;
};

export const ReflectionDetailHeaderStatics = {
  NoDatasourceFallbackMessage:
    'No reflection detail header configured. Please add a datasource with required fields.',
  DictionaryKey_NoDatasource: 'ReflectionDetailHeaderNoDatasource',
  InvalidPageMessage:
    'This component can only be used on Reflection Detail pages. Please move it to the correct page type.',
  DefaultLabel: "TODAY'S REFLECTION",
  GoogleSlideText: 'Google Slide',
  PDFText: 'PDF',
};
