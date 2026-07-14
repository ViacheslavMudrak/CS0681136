import { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type EmployeeSpotlightFields = {
  spotlightImage: ImageField;
  headline: Field<string>;
  spotlight1Tag: Field<string>;
  spotlight1Value: Field<string>;
  spotlight2Tag: Field<string>;
  spotlight2Value: Field<string>;
  spotlight3Tag: Field<string>;
  spotlight3Value: Field<string>;
};

export type EmployeeSpotlightProps = ComponentProps & {
  fields: EmployeeSpotlightFields;
};
