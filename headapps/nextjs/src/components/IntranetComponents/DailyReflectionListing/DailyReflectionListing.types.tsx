import { ComponentProps } from 'lib/component-props';

import { Field } from '@sitecore-content-sdk/nextjs';

type DailyReflectionListingFields = {
  headline: Field<string>;
  label: Field<string>;
};

export type DailyReflectionListingProps = ComponentProps & {
  fields: DailyReflectionListingFields;
};

export const DailyReflectionListingStatics = {
  PlaceholderText: 'Search Reflections',
  ResultsLabelSingular: 'search result',
  ResultsLabelPlural: 'search results',
  ResultsFor: 'for',
  NoResultsFor: 'No results for',
  Clear: 'Clear',
  EmptyTitle: 'No matches found',
  EmptyDescription: 'Try different search terms or adjust your filters.',
  FilterByDate: 'Filter by Date',
  PickDateRange: 'Pick a date range',
  From: 'From',
  To: 'To',
  Cancel: 'Cancel',
  Ok: 'OK',
};
