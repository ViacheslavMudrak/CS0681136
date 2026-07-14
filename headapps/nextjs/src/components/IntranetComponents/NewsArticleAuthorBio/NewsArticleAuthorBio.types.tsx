import { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type NewsArticleAuthorBioFields = {
  authorImage: ImageField;
  optionalEyebrow?: Field<string>;
  authorName: Field<string>;
  authorBio?: Field<string>;
};

export type NewsArticleAuthorBioProps = ComponentProps & {
  fields: NewsArticleAuthorBioFields;
};
