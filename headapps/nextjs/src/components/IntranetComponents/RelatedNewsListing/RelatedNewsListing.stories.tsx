import { I18nProvider } from 'next-localization';

import { LinkField } from '@sitecore-content-sdk/nextjs';
import type { Meta, StoryObj } from '@storybook/react';

import { Default as RelatedNewsListing } from './RelatedNewsListing';
import { RelatedNewsListingProps } from './RelatedNewsListing.types';

// Mock dictionary
const dictionary = {
  RelatedNewsListingEditModeMessageNoNewsFoundWithTags:
    'Authoring note: No news articles found with matching tags. Add or update tags on this item to show related news. This component will be hidden on the live site with no articles.',
};

// --- Base Meta ---
const meta: Meta<typeof RelatedNewsListing> = {
  title: 'Components/Related News Listing',
  component: RelatedNewsListing,
  decorators: [
    (Story) => (
      <I18nProvider lngDict={dictionary} locale="en">
        <Story />
      </I18nProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof RelatedNewsListing>;

/**
 * Story renders the loading skeleton state — the component fetches its data
 * via /api/component-data-fetching/related-news-listing at runtime, which is not available in the
 * Storybook environment. To preview the populated state, run the app locally
 * and visit an article page that hosts this component.
 */
export const Default: Story = {
  args: {
    fields: {
      listingTitle: { value: 'Related News' },
      seeAllNewsLink: {
        value: {
          href: 'https://www.google.com',
          text: 'Button',
          target: '_blank',
        },
      } as LinkField,
      tags: { value: 'mock-tag' },
    },
    rendering: {
      componentName: 'RelatedNewsListing',
      uid: 'mock-uid-123',
      params: {},
      fields: { tags: [] },
      dataSource: 'Empty',
    },
    params: {},
    stylesSXA: '',
  } as RelatedNewsListingProps,
};
