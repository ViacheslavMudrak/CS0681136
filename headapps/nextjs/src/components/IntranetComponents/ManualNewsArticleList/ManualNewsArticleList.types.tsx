import { ComponentProps } from 'lib/component-props';
import { NewsDetailPage } from 'ts/common-sitecore-field-types';

import { Field } from '@sitecore-content-sdk/nextjs';

export type ManualNewsArticleListProps = ComponentProps & {
  fields: {
    sectionHeadline: Field<string>;
    selectedArticles?: NewsDetailPage[];
  };
};

export type ManualNewsArticleListVariant = 'Single' | 'TwoAcross' | 'ThreeAcross' | 'FourAcross';
