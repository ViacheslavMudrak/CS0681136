import type { Meta, StoryObj } from '@storybook/react';

import { Default as ColumnSplitterDefault } from 'components/column-splitter/ColumnSplitter';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

type ColumnSplitterProps = React.ComponentProps<typeof ColumnSplitterDefault>;

const storyDatasets = {
  twoColumns: {
    rendering: createMockRendering({ componentName: 'ColumnSplitter', uid: 'story-cs' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({
      RenderingIdentifier: 'column-splitter-1',
      styles: '',
      EnabledPlaceholders: '1,2',
      ColumnWidth1: '',
      ColumnWidth2: '',
      Styles1: '',
      Styles2: '',
    }),
  },
  singleColumn: {
    rendering: createMockRendering({ componentName: 'ColumnSplitter', uid: 'story-cs-1' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({
      RenderingIdentifier: 'column-splitter-single',
      styles: '',
      EnabledPlaceholders: '1',
      ColumnWidth1: '',
      ColumnWidth2: '',
      Styles1: '',
      Styles2: '',
    }),
  },
} satisfies Record<string, Partial<ColumnSplitterProps>>;

const datasetOrder = ['twoColumns', 'singleColumn'] as const;

const meta = {
  title: 'XM / Column Splitter',
  component: ColumnSplitterDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'twoColumns',
    ...storyDatasets.twoColumns,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
  },
  render: (args) => (
    <ColumnSplitterDefault
      {...mergeStoryDataset(
        args as ColumnSplitterProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<ColumnSplitterProps & { storyDataset?: string }>>,
        'twoColumns',
      )}
    />
  ),
} satisfies Meta<ColumnSplitterProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'twoColumns',
  },
};

export const SingleColumn: Story = {
  name: 'Columns: One',
  args: {
    [STORY_DATASET]: 'singleColumn',
  },
};
