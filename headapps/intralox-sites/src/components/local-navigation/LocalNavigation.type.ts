import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from 'lib/component-props';

import type { RawOrResolvedChildren } from 'components/navigation/Navigation.type';

/**
 * Single local-navigation row: General Link plus optional deeper levels (flyout / nested menus).
 */
export interface LocalNavLinkItem {
  id: string;
  displayName?: string;
  fields?: {
    Link?: LinkField;
    /** Tertiary items under this secondary link (chevron / nested list). */
    ChildLinks?: RawOrResolvedChildren;
    /**
     * When true, `ChildLinks` expand in the header mega menu only — local nav renders a flat link.
     * @see resolveTree in localNavigationUtils
     */
    ShowChildLinks?: Field<boolean>;
  };
}

export interface LocalNavigationFields {
  /** Primary section links — left “category” title resolves from the active item by URL. */
  PrimaryLinkList?: LocalNavLinkItem[];

  SecondaryLinkList?: LocalNavLinkItem[];
  /** GraphQL / camelCase parity */
  primaryLinkList?: LocalNavLinkItem[];
  secondaryLinkList?: LocalNavLinkItem[];
}

export type LocalNavigationProps = ComponentProps & {
  fields?: LocalNavigationFields;
};

/** Serializable segment for the client strip (Link field passed through for SitecoreLink). */
export type LocalNavResolvedItem = {
  id: string;
  label: string;
  link: LinkField;
  children: LocalNavResolvedItem[];
};
