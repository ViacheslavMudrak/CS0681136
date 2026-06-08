import { Field, ImageField } from '@sitecore-content-sdk/nextjs';

export interface IBrandLineFields {
  BrandingLineImage: ImageField;
  BrandingLineType: {
    fields: {
      Value: Field<string>;
    };
  };
}
