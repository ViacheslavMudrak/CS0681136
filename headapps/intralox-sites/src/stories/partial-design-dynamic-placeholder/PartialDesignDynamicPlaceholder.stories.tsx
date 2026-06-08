import type { Meta, StoryObj } from '@storybook/react';

import PartialDesignDynamicPlaceholder from 'components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

type PddpProps = React.ComponentProps<typeof PartialDesignDynamicPlaceholder>;

const storyDatasets = {
  default: {
    rendering: createMockRendering({
      componentName: 'PartialDesignDynamicPlaceholder',
      uid: 'story-pddp',
      params: { sig: 'dynamic-placeholder-1' },
    }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'pddp-1', styles: '' }),
  },
  editing: {
    rendering: createMockRendering({
      componentName: 'PartialDesignDynamicPlaceholder',
      uid: 'story-pddp-ed',
      params: { sig: 'dynamic-placeholder-ed' },
    }),
    page: createMockPage({ isEditing: true }),
    params: createMockParams({ RenderingIdentifier: 'pddp-ed', styles: '' }),
  },
} satisfies Record<string, Partial<PddpProps>>;

const datasetOrder = ['default', 'editing'] as const;

const meta = {
  title: 'XM / Partial Design Dynamic Placeholder',
  component: PartialDesignDynamicPlaceholder,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'default',
    ...storyDatasets.default,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
  },
  render: (args) => (
    <PartialDesignDynamicPlaceholder
      {...mergeStoryDataset(
        args as PddpProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<PddpProps & { storyDataset?: string }>>,
        'default',
      )}
    />
  ),
} satisfies Meta<PddpProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'default',
  },
};

export const Editing: Story = {
  name: 'Mode: Editing',
  args: {
    [STORY_DATASET]: 'editing',
  },
};
