import type { Meta, StoryObj } from '@storybook/react';

import { Default as FAQDefault } from 'components/faq/FAQ';
import type { IFAQFields } from 'components/faq/FAQ.type';
import { createMockParams } from 'src/storybook/mockParams';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const fields: IFAQFields = {
  Title: { value: 'FAQ' },
  Description: { value: '<p>Common questions.</p>' },
  FaqItems: [
    {
      id: 'faq-1',
      fields: {
        Question: { value: 'First question?' },
        Answer: { value: '<p>First answer.</p>' },
        FaqGroup: [],
      },
    },
    {
      id: 'faq-2',
      fields: {
        Question: { value: 'Second question?' },
        Answer: { value: '<p>Second answer.</p>' },
        FaqGroup: [],
      },
    },
  ],
};

type FaqProps = React.ComponentProps<typeof FAQDefault>;

const storyDatasets = {
  default: {
    fields,
    params: createMockParams({ RenderingIdentifier: 'faq-1', styles: '' }),
  },
  editing: {
    fields,
    params: createMockParams({ RenderingIdentifier: 'faq-ed', styles: '' }),
  },
} satisfies Record<string, Partial<FaqProps>>;

const datasetOrder = ['default', 'editing'] as const;

const meta = {
  title: 'XM / FAQ',
  component: FAQDefault,
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
    <FAQDefault
      {...mergeStoryDataset(
        args as FaqProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<FaqProps & { storyDataset?: string }>>,
        'default',
      )}
    />
  ),
} satisfies Meta<FaqProps & { storyDataset?: (typeof datasetOrder)[number] }>;

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
