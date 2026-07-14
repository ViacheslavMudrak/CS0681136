import { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export type TestimonialItem = {
  id?: string;
  quote?: { jsonValue: Field<string> };
  authorImage?: { jsonValue: ImageField };
  authorName?: { jsonValue: Field<string> };
  authorTitle?: { jsonValue: Field<string> };
};

type TestimonialDatasourceFields = {
  title?: { jsonValue: Field<string> };
  backgroundImage?: { jsonValue: ImageField };
  children?: { results?: TestimonialItem[] };
  sharedTestimonials?: {
    targetItems?: TestimonialItem[];
  };
};

export type TestimonialProps = ComponentProps & {
  fields: {
    data: {
      datasource: TestimonialDatasourceFields;
    };
  };
};
