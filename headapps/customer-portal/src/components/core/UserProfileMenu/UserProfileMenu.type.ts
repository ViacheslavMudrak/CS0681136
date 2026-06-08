import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

/** Single profile menu item from Sitecore (e.g. Profile Setting). */
export interface IUserProfileMenuItem {
  id: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Icon?: ImageField;
    Link?: LinkField;
    /** When true, render a control that opens the global language sheet (Link href may be empty). */
    LanguagePopup?: Field<boolean>;
    ContactPopup?: Field<boolean>;
    Title?: Field<string>;
  };
}

export interface IUserProfileMenuFields {
  CompanyIcon: ImageField;
  /** Selected / single-account indicator (Sitecore field name: ActiveAccountIcon). */
  ActiveAccountIcon?: ImageField;
  SectionTitle: Field<string>;
  /** Shown for single-account state (e.g. "Logged in as"). */
  SingleAccountTitle?: Field<string>;
  AccountInfo: Field<string>;
  /** Profile menu links (icon + link per item). When set, used instead of ProfileIcon/ProfileUrl. */
  ProfileItems?: IUserProfileMenuItem[];
  ProfileIcon?: ImageField;
  ProfileUrl?: LinkField;
  SignOutIcon: ImageField;
  SignOutText: Field<string>;
  AccountAddress: Field<string>;
  /** No-account state: link (if enabled in CMS). */
  NoAccountLink?: LinkField;
  /** No-location empty state: icon, title, and CTA link. */
  NoLocationIcon?: ImageField;
  NoLocationTitle?: Field<string>;
  NoLocationCTA?: LinkField;
}

/** Rendering parameters for UserProfileMenu (Sitecore checkbox params arrive as "1" / undefined). */
export type IUserProfileMenuParams = {
  HideCTA?: unknown;
};

