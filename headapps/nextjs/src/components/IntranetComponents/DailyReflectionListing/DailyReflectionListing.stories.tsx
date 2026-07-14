import type { Meta, StoryObj } from '@storybook/react';

import DailyReflectionListing from './DailyReflectionListing';
import type { DailyReflectionListingProps } from './DailyReflectionListing.types';

const meta: Meta<typeof DailyReflectionListing> = {
  title: 'Components/Daily Reflection Listing',
  component: DailyReflectionListing,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DailyReflectionListing>;

export const Default: Story = {
  args: {
    fields: {
      headline: {
        value: 'Daily Reflections',
      },
      label: {
        value: 'Search Reflections',
      },
    },

    rendering: {
      componentName: 'DailyReflectionListing',
      uid: 'daily-reflection-listing-mock',
      dataSource: 'storybook',
      params: {},
    },

    params: {},
    stylesSXA: '',
  } as DailyReflectionListingProps,
};
