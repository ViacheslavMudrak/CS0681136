import type { Field, LinkField, TextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from 'lib/component-props';

/**
 * Video block returned inside article rows by FeaturedNewsContentResolver.
 */
export interface FeaturedNewsArticleVideo {
  Title?: string;
  Autoplay?: string;
  Loop?: string;
  BrightcoveId?: string;
  Caption?: string;
  CoverImage?: string;
}

/**
 * Single row in `ArticleListings` (layout JSON), plus optional `Url` from resolver.
 */
export interface FeaturedNewsArticleRow {
  Title?: string;
  SubHeadline?: string;
  Summary?: string;
  PostDate?: string;
  HideDate?: boolean;
  ShowBreadcrumb?: boolean;
  HideFromHomePage?: boolean;
  Image?: string;
  ArticleType?: string;
  Author?: { Name?: string; Bio?: string; CoverImage?: string } | null;
  Video?: FeaturedNewsArticleVideo | null;
  Industries?: string;
  Solutions?: string;
  Products?: string;
  /** Article page URL when provided by FeaturedNewsContentResolver */
  Url?: string;
  /** Same URL when layout JSON camelCases property names (`url`). */
  url?: string;
}

/** Raw `ArticleListings` field node from layout / Edge */
export type ArticleListingsFieldNode =
  | { value?: FeaturedNewsArticleRow[] | null }
  | FeaturedNewsArticleRow[]
  | null
  | undefined;

/**
 * Datasource fields for Featured News (flat layout shape from custom contents resolver).
 */
export interface FeaturedNewsFields {
  Eyebrow?: Field<string>;
  Headline?: TextField;
  Description?: Field<string>;
  ItemCount?: { Value?: string };
  Type?: { Value?: string };
  ViewAllLink?: { value?: string };
  ArticleListings?: ArticleListingsFieldNode;
}

export type FeaturedNewsProps = ComponentProps & {
  fields: FeaturedNewsFields | null | undefined;
};
