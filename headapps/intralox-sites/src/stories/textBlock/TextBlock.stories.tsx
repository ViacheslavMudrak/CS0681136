import type { Meta, StoryObj } from '@storybook/react';

import { Default as TextBlockDefault } from 'components/textBlock/TextBlock';
import type { ITextBlockFields } from 'components/textBlock/TextBlock.type';
import { createMockParams } from 'src/storybook/mockParams';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const fields: ITextBlockFields = {
  Eyebrow: { value: 'Eyebrow' },
  Title: { value: 'Text block title' },
  Description: { value: '<p>Supporting rich text.</p>' },
  Link: { value: { href: '/continue', text: 'Continue' } },
};

type TextBlockProps = React.ComponentProps<typeof TextBlockDefault>;

const storyDatasets = {
  default: {
    fields,
    params: createMockParams({ RenderingIdentifier: 'text-block-1', styles: '' }),
  },
  editing: {
    fields,
    params: createMockParams({
      RenderingIdentifier: 'text-block-ed',
      styles: 'bg-surface-muted',
      ColorScheme: { Value: { value: 'Light' } },
    }),
  },
} satisfies Record<string, Partial<TextBlockProps>>;

const datasetOrder = ['default', 'editing'] as const;

const meta = {
  title: 'XM / Text Block',
  component: TextBlockDefault,
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
    <TextBlockDefault
      {...mergeStoryDataset(
        args as TextBlockProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<TextBlockProps & { storyDataset?: string }>>,
        'default',
      )}
    />
  ),
} satisfies Meta<TextBlockProps & { storyDataset?: (typeof datasetOrder)[number] }>;

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
