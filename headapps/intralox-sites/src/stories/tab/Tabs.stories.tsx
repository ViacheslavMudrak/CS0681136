import type { Meta, StoryObj } from '@storybook/react';

import { Default as TabsDefault } from 'components/tab/Tabs';
import type { ITabFields } from 'components/tab/Tabs.type';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const fields: ITabFields = {
  TabItems: [
    {
      fields: {
        ComponentId: { value: 'tab-a' },
        Title: { value: 'First tab' },
        Description: { value: '<p>Content for the first tab.</p>' },
      },
    },
    {
      fields: {
        ComponentId: { value: 'tab-b' },
        Title: { value: 'Second tab' },
        Description: { value: '<p>Content for the second tab.</p>' },
      },
    },
  ],
};

type TabsProps = React.ComponentProps<typeof TabsDefault>;

const storyDatasets = {
  default: {
    fields,
    params: createMockParams({ RenderingIdentifier: 'tabs-1', styles: '' }),
    page: createMockPage({ isEditing: false }),
  },
  editing: {
    fields,
    params: createMockParams({ RenderingIdentifier: 'tabs-ed', styles: '' }),
    page: createMockPage({ isEditing: true }),
  },
} satisfies Record<string, Partial<TabsProps>>;

const datasetOrder = ['default', 'editing'] as const;

const meta = {
  title: 'XM / Tabs',
  component: TabsDefault,
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
    <TabsDefault
      {...mergeStoryDataset(
        args as TabsProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<TabsProps & { storyDataset?: string }>>,
        'default',
      )}
    />
  ),
} satisfies Meta<TabsProps & { storyDataset?: (typeof datasetOrder)[number] }>;

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
