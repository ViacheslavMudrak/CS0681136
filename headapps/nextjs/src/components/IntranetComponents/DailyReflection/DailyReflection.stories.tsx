import type { Meta, StoryObj } from '@storybook/react';

import DailyReflection from './DailyReflection';
import { DailyReflectionProps } from './DailyReflection.types';

const meta: Meta<DailyReflectionProps> = {
  title: 'Components/Daily Reflection',
  component: DailyReflection,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<DailyReflectionProps>;

/**
 * Story renders the loading skeleton state — the component fetches its data
 * via /api/component-data-fetching/daily-reflection at runtime, which is not available in the
 * Storybook environment. To preview the populated state, run the app locally
 * and visit a page that hosts this component.
 */
export const Primary: Story = {
  args: {
    rendering: {
      uid: 'mock-uid',
      componentName: 'DailyReflection',
      dataSource: 'mock-datasource',
      params: { showViewAllLink: '1' },
      placeholders: {},
      fields: {},
    },
    stylesSXA: '',
    fields: {
      headline: {
        value: 'Daily Reflection',
      },
    },
  },
};
