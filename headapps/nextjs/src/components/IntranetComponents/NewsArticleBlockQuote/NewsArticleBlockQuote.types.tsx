import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type NewsArticleBlockQuoteFields = {
  quoteText: Field<string>;
  quoteCaption: Field<string>;
};

export type NewsArticleBlockQuoteProps = ComponentProps & {
  fields: NewsArticleBlockQuoteFields;
};
