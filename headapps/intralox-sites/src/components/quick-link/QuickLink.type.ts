import type { Field, ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from 'lib/component-props';

/**
 * Icon item from Sitecore (taxonomy / settings item with `Value`).
 */
export interface QuickLinkIconItem {
  id?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Value?: Field<string>;
  };
}

export interface QuickLinkFields {
  Title?: TextField;
  /** RTE / multi-line from Sitecore. */
  Description?: Field<string>;
  /** General link for the title (optional). */
  Link?: LinkField;
  Icon?: QuickLinkIconItem;
  Image?: ImageField;
}

export type QuickLinkCardType = 'base' | 'card';

/** Rendering param `IconPosition`: icon + text layout, same at all breakpoints for base and card. */
export type QuickLinkIconPosition = 'left' | 'top' | 'center';

export type QuickLinkProps = ComponentProps & {
  /** Undefined when datasource is not yet assigned in XM Cloud. */
  fields?: QuickLinkFields;
};
