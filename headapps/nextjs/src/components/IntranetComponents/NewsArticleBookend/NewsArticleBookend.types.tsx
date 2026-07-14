import { ComponentProps } from 'lib/component-props';
import { TagItem } from 'ts/common-sitecore-field-types';

import { Field } from '@sitecore-content-sdk/nextjs';

export type PageFields = {
  areaTags?: TagItem[];
  topicTags?: TagItem[];
  contentTags?: TagItem[];
  [key: string]: unknown;
};

type NewsArticleBookendFields = {
  data?: {
    contextItem?: {
      lastUpdated?: Field<string>;
      lastUpdatedDateOverride?: Field<string>;
    };
  };
};

export type NewsArticleBookendProps = ComponentProps & {
  fields: NewsArticleBookendFields;
};

export const NewsArticleBookendStatics = {
  copiedLinkText: 'Copied!',
  copyLinkText: 'Copy Link',
  lastUpdatedText: 'Last Updated: ',
};
