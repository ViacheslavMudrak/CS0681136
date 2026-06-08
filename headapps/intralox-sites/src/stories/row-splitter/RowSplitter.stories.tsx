import type { Meta, StoryObj } from '@storybook/react';

import { Default as RowSplitterDefault } from 'components/row-splitter/RowSplitter';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

type RowSplitterProps = React.ComponentProps<typeof RowSplitterDefault>;

const storyDatasets = {
  singleRow: {
    rendering: createMockRendering({ componentName: 'RowSplitter', uid: 'story-rs' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({
      RenderingIdentifier: 'row-splitter-1',
      styles: '',
      EnabledPlaceholders: '1',
      Styles1: 'bg-surface-muted',
    }),
  },
  twoRows: {
    rendering: createMockRendering({ componentName: 'RowSplitter', uid: 'story-rs-2' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({
      RenderingIdentifier: 'row-splitter-2',
      styles: '',
      EnabledPlaceholders: '1,2',
      Styles1: 'bg-surface-muted',
      Styles2: 'bg-surface',
    }),
  },
} satisfies Record<string, Partial<RowSplitterProps>>;

const datasetOrder = ['singleRow', 'twoRows'] as const;

const meta = {
  title: 'XM / Row Splitter',
  component: RowSplitterDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'singleRow',
    ...storyDatasets.singleRow,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
  },
  render: (args) => (
    <RowSplitterDefault
      {...mergeStoryDataset(
        args as RowSplitterProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<RowSplitterProps & { storyDataset?: string }>>,
        'singleRow',
      )}
    />
  ),
} satisfies Meta<RowSplitterProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'singleRow',
  },
};

/** Two row placeholders — `Styles1` / `Styles2` per-row chrome. */
export const TwoRows: Story = {
  name: 'Rows: Two',
  args: {
    [STORY_DATASET]: 'twoRows',
  },
};
