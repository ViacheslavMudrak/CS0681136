import type { Meta, StoryObj } from '@storybook/react';
import type { Field } from '@sitecore-content-sdk/nextjs';

import ContentBlock from 'components/content-block/ContentBlock';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

type ContentBlockProps = React.ComponentProps<typeof ContentBlock>;

const storyDatasets = {
  default: {
    rendering: createMockRendering({ componentName: 'ContentBlock', uid: 'story-cb' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'content-block-1', styles: '' }),
    fields: {
      heading: { value: 'Content block heading' } as Field<string>,
      content: { value: '<p>Rich text body for the content block.</p>' } as Field<string>,
    },
  },
  editing: {
    rendering: createMockRendering({ componentName: 'ContentBlock', uid: 'story-cb-ed' }),
    page: createMockPage({ isEditing: true }),
    params: createMockParams({ RenderingIdentifier: 'content-block-ed', styles: '' }),
    fields: {
      heading: { value: 'Editable heading' } as Field<string>,
      content: { value: '' } as Field<string>,
    },
  },
} satisfies Record<string, Partial<ContentBlockProps>>;

const datasetOrder = ['default', 'editing'] as const;

const meta = {
  title: 'XM / Content Block',
  component: ContentBlock,
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
    <ContentBlock
      {...mergeStoryDataset(
        args as ContentBlockProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<ContentBlockProps & { storyDataset?: string }>>,
        'default',
      )}
    />
  ),
} satisfies Meta<ContentBlockProps & { storyDataset?: (typeof datasetOrder)[number] }>;

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
