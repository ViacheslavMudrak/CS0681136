import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export type EventCard = {
  cardDate: string;
  cardTitle: string;
  cardTime: string;
  cardDescription: string;
  cardDestinationUrl: string;
};

type UpcomingEventCalendarFields = {
  headline: Field<string>;
  subtext: Field<string>;
  buttonText: Field<string>;
  googleCalendarId: Field<string>;
};

type UpcomingEventCalendarParams = {
  showCalendarCta?: string;
  showAllEventDescriptions?: string;
  showAllEventTimes?: string;
  GridParameters?: string;
  FieldNames?: string;
  DynamicPlaceholderId?: string;
  Styles?: string;
};

export type UpcomingEventCalendarProps = ComponentProps & {
  fields: UpcomingEventCalendarFields;
  params?: UpcomingEventCalendarParams;
};

export const UpcomingEventCalendarDictionary = {
  AllDay: 'All Day',
  NoEvents: 'This calendar has no upcoming events',
  LoadingEvents: 'Loading Events...',
  UnableToView:
    'Calendar is unable to display due to technical difficulties. Please try again later.',
  UntitledEvent: 'Untitled Event',
  LearnMore: 'Learn More',
};
