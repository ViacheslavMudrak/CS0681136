import type { Field, ImageField, LinkField, TextField } from "@sitecore-content-sdk/nextjs";

import type { ComponentProps } from "@/lib/component-props";

/** Single utility link card fields from Sitecore (one rendering = one card). */
export interface IUtilityLinksFields {
  Icon?: ImageField;
  Label?: TextField;
  Description?: Field<string>;
  URL?: LinkField;
  SortOrder?: Field<string> | Field<number>;
  /** When `false`, the card is not shown to visitors. */
  Visible?: Field<boolean>;
}

export type UtilityLinksProps = ComponentProps & {
  fields: IUtilityLinksFields;
};
