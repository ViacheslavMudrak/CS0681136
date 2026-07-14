import type { Meta, StoryObj } from '@storybook/react';

import FeaturedDailyReflection from './FeaturedDailyReflection';
import type { FeaturedDailyReflectionProps } from './FeaturedDailyReflection.types';

const meta: Meta<FeaturedDailyReflectionProps> = {
  title: 'Components/Featured Daily Reflection',
  component: FeaturedDailyReflection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FeaturedDailyReflection>;

/**
 * Story renders the loading skeleton state — the component fetches its data
 * via /api/component-data-fetching/featured-daily-reflection at runtime, which is not available in
 * the Storybook environment. To preview the populated state, run the app
 * locally and visit a page that hosts this component.
 */
export const Default: Story = {
  args: {
    fields: {
      headline: {
        value: 'Daily Reflection',
      },
      subheadline: {
        value: 'A moment of peace in a busy world. Let the light enter your day.',
      },
    },
    rendering: {
      componentName: 'FeaturedDailyReflection',
      uid: 'featured-daily-reflection-mock',
      dataSource: '/sitecore/content/Data/FD',
      params: {},
    },
    params: {},
    stylesSXA: '',
  },
};
