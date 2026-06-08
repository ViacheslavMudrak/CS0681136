import type { Field, TextField } from "@sitecore-content-sdk/nextjs";

import type { ComponentProps } from "lib/component-props";

import type { QuickLinkFields } from "../quick-link/QuickLink.type";

/**
 * One linked content item under the group datasource (same field model as standalone Quick Link).
 */
export interface QuickLinkGroupItem {
  id: string;
  displayName?: string;
  fields?: QuickLinkFields;
}

/** Reference item (e.g. taxonomy) whose `Value` drives column count. */
export interface QuickLinkGroupCountField {
  id?: string;
  fields?: {
    Value?: Field<string>;
  };
}

export interface QuickLinkGroupFields {
  QuickLinkItems?: QuickLinkGroupItem[];
  QuickLinkCount?: QuickLinkGroupCountField;
  ListofLinks?: QuickLinkGroupItem[];
  Headline?: TextField;
  Description?: Field<string>;
}

export type QuickLinkGroupProps = ComponentProps & {
  fields?: QuickLinkGroupFields;
};
