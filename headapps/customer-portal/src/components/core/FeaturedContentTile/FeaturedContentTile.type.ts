import type { Field, ImageField, LinkField, TextField } from "@sitecore-content-sdk/nextjs";

import type { ComponentProps } from "@/lib/component-props";

/** Dashboard featured promo tile (Figma: OneTrack / featured content tile). */
export interface IFeaturedContentTileFields {
  CategoryLabel?: TextField;
  TileHeading?: TextField;
  /** Rich text body. */
  TileDescription?: Field<string>;
  CTALabel?: TextField;
  CTAURL?: LinkField;
  BackgroundImage?: ImageField;
  /** When `false`, the tile is not shown to visitors (still shown while editing). */
  Visible?: Field<boolean>;
}

export type FeaturedContentTileProps = ComponentProps & {
  fields: IFeaturedContentTileFields;
};
