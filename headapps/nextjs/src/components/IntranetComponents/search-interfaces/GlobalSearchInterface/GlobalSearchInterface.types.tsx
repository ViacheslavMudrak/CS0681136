import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
// import { ResponsiveImageFields } from 'models/responsive-image';

type GlobalSearchInterfaceFields = {
  listingTitle: Field<string>;
};

export type GlobalSearchInterfaceProps = ComponentProps & {
  fields: GlobalSearchInterfaceFields;
};

export const GlobalSearchInterfaceStatics = {
  searchPlaceholderText: 'Search for news, content...',
  noMatchesHeading: 'No matches found',
  noMatchesSubtext: 'Try different search terms or adjust your filters.',
};
