import type { Field, TextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from 'lib/component-props';

/**
 * General Link JSON emitted by `CaseStudiesContentResolver` for the company CTA.
 */
export interface RelatedCaseStudyCompanyLink {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
  target?: string;
  querystring?: string;
}

/**
 * Optional company block returned on each case study row (layout JSON).
 *
 * Navigation for the company name uses the **`url`** key on `Link` (see `getCaseStudyCompanyLinkUrl`),
 * or top-level **`url`** / **`Url`** when the payload omits a nested `Link` object.
 */
export interface RelatedCaseStudyCompany {
  Name?: string;
  Logo?: string;
  /** General Link JSON, occasionally serialized as a string in layout payloads. */
  Link?: RelatedCaseStudyCompanyLink | string | null;
  /** Company detail path when surfaced next to `Name` (e.g. `/media/case-studies/kurose-suisan`). */
  url?: string;
  Url?: string;
}

/**
 * Video block on a case study row when present.
 */
export interface RelatedCaseStudyVideo {
  Title?: string;
  Autoplay?: string;
  Loop?: string;
  BrightcoveId?: string;
  Caption?: string;
  CoverImage?: string;
}

/**
 * Single row from `CaseStudyListings` (custom contents resolver / Edge layout).
 */
export interface RelatedCaseStudyRow {
  Company?: RelatedCaseStudyCompany;
  /** Primary title in current layout JSON */
  Headline?: string;
  /** Alternate title key if resolver changes */
  Title?: string;
  Summary?: string;
  PostDate?: string;
  HideDate?: boolean;
  ShowBreadcrumb?: boolean;
  ShowFeatured?: boolean;
  Image?: string;
  Video?: RelatedCaseStudyVideo | null;
  Industries?: string;
  Solutions?: string;
  Products?: string;
  /** Case study page path (e.g. `/media/case-studies/...`); used for headline link and as company-name href when `Company.Link` is empty. */
  Url?: string;
  url?: string;
}

/** Raw `CaseStudyListings` field node from layout */
export type CaseStudyListingsFieldNode =
  | { value?: RelatedCaseStudyRow[] | null }
  | RelatedCaseStudyRow[]
  | null
  | undefined;

/**
 * Datasource fields for Related Case Studies (flat layout shape).
 */
export interface RelatedCaseStudiesFields {
  Eyebrow?: Field<string>;
  Headline?: TextField;
  Description?: Field<string>;
  ItemCount?: { Value?: string };
  /** Datasource checkbox from `CaseStudiesContentResolver`: when true, base cards show `Company.Name` in the footer instead of the dictionary case-study label. */
  ShowCompany?: { value?: boolean };
  CaseStudyListings?: CaseStudyListingsFieldNode;
}

export type RelatedCaseStudiesProps = ComponentProps & {
  fields: RelatedCaseStudiesFields | null | undefined;
};
