import type { Field, ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from 'lib/component-props';

/**
 * Sitecore Icon / droplink item — supports nested `Value` or loose `value` from layout JSON.
 */
export interface LinkGroupIconRef {
  id?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Value?: Field<string>;
  };
  value?: unknown;
}

/** CMS may store icons as a droplink (FA class) or as a media `Image` field (`value.src`). */
export type LinkGroupIconField = ImageField | LinkGroupIconRef;

export interface LinkGroupItemFields {
  Title?: TextField;
  Description?: Field<string>;
  Icon?: LinkGroupIconField;
  Link?: LinkField;
}

export interface LinkGroupItem {
  id: string;
  displayName?: string;
  name?: string;
  fields?: LinkGroupItemFields;
}

export interface LinkGroupFields {
  /** Multilist order is preserved in layout service output. */
  Linkitems?: LinkGroupItem[];
  Title?: TextField;
  Description?: Field<string>;
}

export type LinkGroupProps = ComponentProps & {
  fields?: LinkGroupFields;
};

export type LinkGroupColorSchemeKey = 'default' | 'light' | 'dark' | 'gray';
