import type { ImageField, TextField } from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from 'lib/component-props';

/** Flat fields when a datasource is bound; page banner usually reads route fields only. */
export interface BannerFields {
  Title?: TextField;
  Image?: ImageField;
}

export type BannerParams = ComponentProps['params'] & {
  /** Sitecore checkbox as string: `"1"` shows route image when available. */
  ShowImage?: string;
  /** Optional alias if templates emit `hasBanner` instead of `ShowImage`. */
  hasBanner?: string;
};

export type BannerProps = ComponentProps & {
  fields?: BannerFields | null;
};
