import type { Field, ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from 'lib/component-props';

import type { SitecoreValueItem } from 'components/media-tile/MediaTile.type';
import type { IVideoFields } from '../../utils/interface';

/** Flat datasource fields for Media Box (layout / Edge). */
export interface MediaBoxFields {
  Heading?: TextField;
  /** Rich text (HTML). */
  Description?: Field<string>;
  Link?: LinkField;
  MediaType?: SitecoreValueItem;
  Video?: IVideoFields | null;
  Thumbnail?: ImageField;
  /** Optional primary image when template provides a separate field from Thumbnail. */
  Media?: ImageField;
  Image?: ImageField;
  /** Integrated GraphQL: merge `data.datasource` via `resolveMediaBoxFields` in `mediaBoxUtils`. */
  data?: {
    datasource?: Partial<MediaBoxFields> & Record<string, unknown>;
  };
}

export type MediaBoxProps = ComponentProps & {
  fields?: MediaBoxFields;
};

/** Nested Sitecore droplist param value. */
export interface MediaBoxParamValueShape {
  Value?: {
    value?: string;
  };
}
