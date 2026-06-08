import type { Meta, StoryObj } from '@storybook/react';

import { Default as LinkGridDefault } from 'components/linkGrid/LinkGrid';
import type { ILinkGridFields } from 'components/linkGrid/LinkGrid.type';
import { createMockParams } from 'src/storybook/mockParams';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const fieldsDefault = {
  Headline: { value: 'Service listings' },
  Description: { value: '<p>Browse related capabilities.</p>' },
  ContentItems: { value: [] },
  ItemCount: { Value: '3' },
} as unknown as ILinkGridFields;

const fieldsAlt = {
  Headline: { value: 'Alternate grid headline' },
  Description: { value: '<p>Different copy preset.</p>' },
  ContentItems: { value: [] },
  ItemCount: { Value: '4' },
} as unknown as ILinkGridFields;

type LinkGridProps = React.ComponentProps<typeof LinkGridDefault>;

const storyDatasets = {
  default: {
    fields: fieldsDefault,
    params: createMockParams({ RenderingIdentifier: 'link-grid-1', styles: '' }),
  },
  alternateHeadline: {
    fields: fieldsAlt,
    params: createMockParams({ RenderingIdentifier: 'link-grid-2', styles: '' }),
  },
} satisfies Record<string, Partial<LinkGridProps>>;

const datasetOrder = ['default', 'alternateHeadline'] as const;

const meta = {
  title: 'XM / Link Grid',
  component: LinkGridDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'default',
    ...storyDatasets.default,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    fields: { table: { disable: true } },
  },
  render: (args) => (
    <LinkGridDefault
      {...mergeStoryDataset(
        args as LinkGridProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<LinkGridProps & { storyDataset?: string }>>,
        'default',
      )}
    />
  ),
} satisfies Meta<LinkGridProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'default',
  },
};

export const AlternateHeadline: Story = {
  name: 'Headline: Alternate',
  args: {
    [STORY_DATASET]: 'alternateHeadline',
  },
};
