import type { Meta, StoryObj } from '@storybook/react';

import RelatedReflections from './RelatedReflections';
import type { RelatedReflectionsProps } from './RelatedReflections.types';
import { LinkField } from '@sitecore-content-sdk/nextjs';

const meta: Meta<RelatedReflectionsProps> = {
  title: 'Components/Related Reflections',
  component: RelatedReflections,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof RelatedReflections>;

const reflectionsTags = {
  targetItems: [
    {
      id: '84486610F42B48E0874FDD4766F1A04C',
      name: 'Ascension news',
    },
    {
      id: '9CF45AB7233246D1B07BCB2BF4E8FFBB',
      name: 'Leader News',
    },
  ],
};

/**
 * Story renders the loading skeleton state — the component fetches its data
 * via /api/component-data-fetching/related-reflections at runtime, which is not available in the
 * Storybook environment. To preview the populated state, run the app locally
 * and visit a reflection page that hosts this component.
 */
export const Default: Story = {
  args: {
    fields: {
      title: { value: 'Related Reflections' },
      link: {
        value: {
          href: '#',
          text: 'See all category reflections',
          linktype: 'internal',
        },
      } as LinkField,
      reflectionsTags: reflectionsTags,
    },
    rendering: {
      componentName: 'RelatedReflections',
      uid: 'related-reflections-mock',
      dataSource: '/sitecore/content/mock/related-reflections',
      fields: { tags: [] },
      params: {},
    },
    params: {},
    stylesSXA: '',
  } as RelatedReflectionsProps,
};
