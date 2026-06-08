import type { ComponentProps } from 'lib/component-props';

/** General link JSON from layout for `EventUrl`. */
export interface EventListEventUrlJson {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
  target?: string;
  querystring?: string;
}

/** Single event row from `EventListings` / content resolver. */
export interface EventListEventItem {
  EventName?: string;
  Location?: string;
  Region?: string;
  StartDate?: string;
  EndDate?: string;
  EventUrl?: EventListEventUrlJson | string | null;
  EventStartDate?: string;
  EventEndDate?: string;
  EventYear?: string;
}

/** One year bucket in `EventListings`. */
export interface EventListYearGroup {
  Year?: string;
  EventItems?: EventListEventItem[] | null;
}

/** Raw `EventListings` node from layout / Edge. */
export type EventListingsFieldNode =
  | { value?: EventListYearGroup[] | null }
  | EventListYearGroup[]
  | null
  | undefined;

export interface EventListFields {
  EventListings?: EventListingsFieldNode;
}

export type EventListProps = ComponentProps & {
  fields: EventListFields | null | undefined;
};

export type EventListParamRecord = ComponentProps['params'] & Record<string, unknown>;
