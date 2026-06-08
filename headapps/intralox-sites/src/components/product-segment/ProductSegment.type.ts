import type {
  Field,
  ImageField,
  LinkField,
  TextField,
} from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from 'lib/component-props';

import type { CalloutFields } from '../callout/Callout.type';
import type { TestimonialFieldsFlat } from '../testimonial/Testimonial.type';
import type { SitecoreValueItem } from '../callout/Callout.type';
import type { IVideoFields } from 'src/utils/interface';

/** Taxonomy / droplist item (Application, Solution name, MediaType). */
export interface ProductSegmentTaxonomyItem {
  id: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Value?: Field<string>;
  };
}

/** Callout folder reference on a product modal. */
export interface ProductModalCalloutReference {
  id: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: CalloutFields;
}

/** Testimonial folder reference on a product modal. */
export interface ProductModalTestimonialReference {
  id: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: TestimonialFieldsFlat;
}

/** Product modal (solution) nested under a segment. */
export interface ProductModalItem {
  id: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Title?: TextField;
    Description?: Field<string>;
    Thumbnail?: ImageField;
    Application?: ProductSegmentTaxonomyItem[];
    Overview?: Field<string>;
    FeaturesandBenefits?: Field<string>;
    Solutions?: ProductSegmentTaxonomyItem[];
    Link?: LinkField;
    MediaType?: SitecoreValueItem;
    Image?: ImageField;
    Video?: IVideoFields | null;
    Callout?: ProductModalCalloutReference | null;
    Testimonial?: ProductModalTestimonialReference | null;
  };
}

/** Segment card item from CMS multilist. */
export interface ProductSegmentItem {
  id: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Heading?: TextField;
    Description?: Field<string>;
    Icon?: ImageField;
    ProductModal?: ProductModalItem[];
  };
}

/** Top-level Product Segment datasource fields. */
export interface ProductSegmentFields {
  Eyebrow?: TextField;
  Headline?: TextField;
  SubHeadline?: Field<string>;
  Description?: Field<string>;
  Segments?: ProductSegmentItem[];
}

export type ProductSegmentProps = ComponentProps & {
  fields?: ProductSegmentFields;
};

/** Normalized application filter tab for the active segment. */
export interface ProductSegmentApplicationFilter {
  id: string;
  slug: string;
  label: string;
}

/** Resolved URL-driven state for the component. */
export interface ProductSegmentResolvedState {
  segmentIndex: number;
  segmentSlug: string;
  applicationSlug: string | null;
  itemSlug: string | null;
  openModal: boolean;
  /** True when a valid `segment` query param is present. */
  hasSegmentSelected: boolean;
}

export const PRODUCT_SEGMENT_QUERY = {
  segment: 'segment',
  application: 'application',
  item: 'item',
} as const;

export const PRODUCT_SEGMENT_LABELS = {
  emptyHint: 'Product Segment',
  noSegmentsHint: 'No segments configured',
  noSolutionsHint: 'No solutions configured',
  applicationsPrefix: 'Applications:',
  allFilter: 'All',
  solutionsHeading: 'Solution',
  featuresHeading: 'Key Features and Benefits',
  playVideo: 'Play video',
  closeModal: 'Close product details',
  calloutListLabel: 'Product highlights',
  segmentGroupLabel: 'Product segments',
  applicationTabsLabel: 'Application filters',
  solutionCardsLabel: 'Solutions',
} as const;
