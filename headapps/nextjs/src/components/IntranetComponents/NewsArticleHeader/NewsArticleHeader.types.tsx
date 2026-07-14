import { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type NewsArticleHeaderFields = {
  articleImage: ImageField;
  authorName: Field<string>;
};

export type NewsArticleHeaderProps = ComponentProps & {
  fields: NewsArticleHeaderFields;
};

export const NewsArticleHeaderStatics = {
  NewsArticleHeaderByText: 'By',
  NewsArticleHeaderMinReadText: 'Min Read',
  NewsArticleHeaderCopyLinkText: 'Copy Link',
  NewsArticleHeaderCopiedText: 'Copied!',
};

export type NewsArticleHeaderVariant = 'fullwidth' | 'condensed';
