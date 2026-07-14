import type { Meta, StoryObj } from '@storybook/react';

import BrowseReflectionTopics from './BrowseReflectionTopics';
import type { BrowseReflectionTopicsProps } from './BrowseReflectionTopics.types';

const meta: Meta<typeof BrowseReflectionTopics> = {
  title: 'Components/Browse Reflection Topics',
  component: BrowseReflectionTopics,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof BrowseReflectionTopics>;

export const Default: Story = {
  args: {
    fields: {
      label: {
        value: 'Browse reflection topics',
      },
      icon: {
        fields: {
          value: {
            value: 'TravelExploreOutlined',
          },
        },
      },
      reflectionTopics: [
        {
          fields: {
            title: {
              value: 'Creativity',
            },
          },
        },
        {
          fields: {
            title: {
              value: 'Dedication',
            },
          },
        },
        {
          fields: {
            title: {
              value: 'Integrity',
            },
          },
        },
        {
          fields: {
            title: {
              value: 'Reverence',
            },
          },
        },
        {
          fields: {
            title: {
              value: 'Service Commitments',
            },
          },
        },
        {
          fields: {
            title: {
              value: 'Service of the Poor',
            },
          },
        },
        {
          fields: {
            title: {
              value: 'Wisdom',
            },
          },
        },
      ],
    },
    rendering: {
      componentName: 'BrowseReflectionTopics',
      uid: 'browse-reflection-topics-mock',
      dataSource: 'storybook',
      params: {},
    },
    params: {},
    stylesSXA: '',
  } as BrowseReflectionTopicsProps,
};
