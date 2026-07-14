import type { Meta, StoryObj } from '@storybook/react';

import MarketNews from './MarketNews';
import { MarketNewsProps } from './MarketNews.types';

const meta: Meta<typeof MarketNews> = {
  title: 'Components/Market News',
  component: MarketNews,
};
export default meta;

type Story = StoryObj<typeof MarketNews>;

/**
 * Story renders the loading skeleton state — the component fetches its data
 * via /api/component-data-fetching/market-news at runtime, which is not available in the Storybook
 * environment. To preview the populated state, run the app locally and visit
 * a page that hosts this component.
 */
export const Default: Story = {
  args: {
    fields: {
      title: { value: 'Featured News' },
      seeAllNewsLink: {
        value: 'See More Market News',
      },
      featuredNewsTag: [{ id: 'tag1', name: 'Tag 1', fields: {} }],
      nonFeaturedNewsTags: [{ id: 'tag1', name: 'Tag 1', fields: {} }],
      mobileCTA: {
        value: 'Read More',
      },
    },
    rendering: {
      componentName: 'MarketNews',
      uid: 'mock-uid-123',
      params: {},
      fields: { tags: [] },
      dataSource: 'Empty',
    },
    params: {},
    stylesSXA: '',
  } as unknown as MarketNewsProps,
};
