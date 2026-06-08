import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from 'lib/component-props';
import type { IVideoFields } from 'src/utils/interface';

/**
 * Sitecore value item for Background Color lookup field.
 */
export interface TimelineBackgroundColor {
  id?: string;
  fields?: {
    Value?: Field<string>;
  };
}

/**
 * Fields on a single Timeline Event item.
 */
export interface TimelineEventFields {
  Year?: Field<string>;
  Title?: Field<string>;
  Description?: Field<string>;
  Image?: ImageField;
  Video?: IVideoFields | null;
  Link?: LinkField;
}

/**
 * A single timeline event (child item under a Timeline Group).
 */
export interface TimelineEvent {
  id: string;
  displayName?: string;
  fields?: TimelineEventFields;
}

/**
 * Fields on a Timeline Group item.
 */
export interface TimelineGroupFields {
  BackgroundColor?: TimelineBackgroundColor;
  BackgroundImage?: ImageField;
  TimelineEvents?: TimelineEvent[];
}

/**
 * A timeline group (decade section) containing one or more events.
 */
export interface TimelineGroup {
  id: string;
  displayName?: string;
  fields?: TimelineGroupFields;
}

/**
 * Decade-level aggregation from {@link buildDecadeTimelineBlocks} (unit tests / helpers only).
 * `Timeline.tsx` renders one section per {@link TimelineGroup} in datasource order.
 */
export interface TimelineDecadeBlock {
  decadeStart: number;
  events: TimelineEvent[];
  styleSource: TimelineGroup;
}

/** One jump target for the tablet/desktop year rail (chronological order matches rendered cards). */
export interface TimelineNavigatorEntry {
  anchorId: string;
  yearLabel: string;
}

/**
 * Root datasource fields for the Timeline rendering.
 */
export interface TimelineFields {
  Headline?: Field<string>;
  Introduction?: Field<string>;
  Summary?: Field<string>;
  BannerImage?: ImageField;
  SummaryImage?: ImageField;
  TimelineGroup?: TimelineGroup[];
}

export type TimelineProps = ComponentProps & {
  fields?: TimelineFields;
};
