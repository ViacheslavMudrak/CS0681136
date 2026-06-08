import type { Field, ImageField, TextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from 'lib/component-props';
import type { CalloutItem } from 'components/callout/Callout.type';
import type { MediaTileLinkItem, SitecoreValueItem } from 'components/media-tile/MediaTile.type';

/**
 * Datasource fields for the Global Locations rendering (flat layout JSON / Edge).
 */
export interface GlobalLocationsFields {
  Eyebrow?: TextField;
  Headline?: TextField;
  /** Sitecore rich text (HTML). */
  Description?: Field<string>;
  Image?: ImageField;
  CalloutItems?: CalloutItem[];
  Links?: MediaTileLinkItem[];
  ButtonAlignment?: SitecoreValueItem;
  FocalPoint?: SitecoreValueItem;
  /** GraphQL / integrated datasource wrapper (optional). */
  data?: { datasource?: Record<string, unknown> };
}

export type GlobalLocationsProps = ComponentProps & {
  fields?: GlobalLocationsFields;
};
