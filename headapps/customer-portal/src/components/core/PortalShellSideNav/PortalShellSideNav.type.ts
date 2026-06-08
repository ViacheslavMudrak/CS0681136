import type { Field, ImageField, LinkField } from "@sitecore-content-sdk/nextjs";
import type { ProfileAccount } from "@/lib/types/user-profile";

/**
 * Link value shape from Sitecore (internal/external).
 */
export interface PortalShellLinkValue {
  href?: string;
  text?: string;
  linktype?: string;
  target?: string;
  url?: string;
  anchor?: string;
  class?: string;
  title?: string;
  querystring?: string;
  id?: string;
}

/**
 * Image value shape from Sitecore.
 */
export interface PortalShellImageValue {
  src?: string;
  alt?: string;
}

/**
 * Single sub-navigation item (can nest SubNavigationItems for expandable sections).
 */
export interface PortalShellNavItemFields {
  Title?: Field<string>;
  Icon?: ImageField;
  URL?: LinkField;
  /** When true, expandable group renders open by default (active child link still follows URL). */
  ShowExpandMenu?: Field<boolean | string | number>;
  SubNavigationItems?: PortalShellNavItem[];
  PermissionSelection?: unknown[];
}

export interface PortalShellNavItem {
  id: string;
  url: string;
  name: string;
  displayName: string;
  fields?: PortalShellNavItemFields;
}

/**
 * One section in the side nav (e.g. "General", "Admin").
 */
export interface PortalShellNavSectionFields {
  SectionTitle?: Field<string>;
  SubNavigationItems?: PortalShellNavItem[];
  PermissionSelection?: unknown[];
}

export interface PortalShellNavSection {
  id: string;
  url: string;
  name: string;
  displayName: string;
  fields?: PortalShellNavSectionFields;
}

/**
 * Sitecore fields for PortalShellSideNav datasource.
 */
export interface PortalShellSideNavFields {
  CompanyIcon?: ImageField;
  NoCompanyIcon?: ImageField;
  NoCompanyTitle?: Field<string>;
  NoCompanyUrl?: LinkField;
  CopyrightText?: Field<string>;
  WebsiteURL?: LinkField;
  NavigationSection?: PortalShellNavSection[];
}

/** Account row in portal shell (same as profile context). */
export type PortalShellAccount = ProfileAccount;

export interface PortalShellSideNavParams {
  [key: string]: unknown;
}
