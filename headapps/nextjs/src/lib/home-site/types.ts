import { Field } from '@sitecore-content-sdk/nextjs';

export interface AscensionSiteTag {
  id: string;
  name: string;
  title: Field<string>;
  facetCategory: Field<string>;
}

/**
 * Home site identification types
 */
export interface AscensionSite {
  itemId: string;
  siteName: string;
  isMarket: boolean;
  siteLevelAssociationTags: AscensionSiteTag[];
}

/** New user: no site currently configured for this user */
export const ASCENSION_SITE_UNKNOWN: AscensionSite = Object.freeze({
  itemId: '__unknown__',
  siteName: 'Unknown',
  isMarket: false,
  siteLevelAssociationTags: [],
});

/** Mapping rules did not resolve to a site */
export const ASCENSION_SITE_NONE: AscensionSite = Object.freeze({
  itemId: '__none__',
  siteName: 'None',
  isMarket: false,
  siteLevelAssociationTags: [],
});
