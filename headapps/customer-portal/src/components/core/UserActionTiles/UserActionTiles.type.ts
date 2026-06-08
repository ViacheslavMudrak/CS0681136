import type { Field, ImageField, LinkField, TextField } from "@sitecore-content-sdk/nextjs";

import type { ComponentProps } from "@/lib/component-props";

/** One CMS row under `TilesSelection`. */
export interface IUserActionTileItem {
  id: string;
  displayName?: string;
  fields?: {
    TileIcon?: ImageField;
    TileURL?: LinkField;
    TileTitle?: TextField;
    TileDescription?: Field<string>;
    /** When `false`, this pill is not shown to visitors. */
    Visible?: Field<boolean>;
    /** Ascending sort; ties keep CMS list order. */
    SortOrder?: Field<string> | Field<number>;
    /** Alternate Sitecore field name for sort order. */
    "Sort Order"?: Field<string> | Field<number>;
  };
}

export interface IUserActionTilesFields {
  /** When `false`, the whole pills row is omitted for visitors (no empty gap). */
  PillsSectionVisible?: Field<boolean>;
  TilesSelection?: IUserActionTileItem[];
}

export type UserActionTilesProps = ComponentProps & {
  fields: IUserActionTilesFields;
};
