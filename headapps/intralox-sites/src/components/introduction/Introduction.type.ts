import type { Field, ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from 'lib/component-props';
import type { SitecoreValueItem } from 'components/media-tile/MediaTile.type';
import type { IVideoFields } from 'src/utils/interface';

/**
 * Raw datasource node (flat or integrated GraphQL layout).
 */
export interface IntroductionFieldsDatasource {
  Headline?: TextField;
  Text?: Field<string>;
  /** Rich text body — common Sitecore template name alongside or instead of {@link IntroductionFields.Text}. */
  Description?: Field<string>;
  Link?: LinkField;
  MediaType?: SitecoreValueItem;
  Image?: ImageField;
  Video?: IVideoFields | null;
}

/** Sitecore Introduction rendering datasource fields. */
export interface IntroductionFields {
  Headline?: TextField;
  Text?: Field<string>;
  /** Rich text body — common Sitecore template name alongside or instead of {@link IntroductionFields.Text}. */
  Description?: Field<string>;
  Link?: LinkField;
  MediaType?: SitecoreValueItem;
  Image?: ImageField;
  Video?: IVideoFields | null;
  data?: {
    datasource?: IntroductionFieldsDatasource;
  };
}

export type IntroductionProps = ComponentProps & {
  fields?: IntroductionFields;
};
