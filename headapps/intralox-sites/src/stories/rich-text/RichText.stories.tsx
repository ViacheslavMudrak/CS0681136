import type { Meta, StoryObj } from '@storybook/react';

import type { RichTextFields } from 'components/rich-text/RichText.type';
import { RichTextStoryPreview } from 'src/storybook/async-roots/RichTextStoryPreview';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const bodyFields: RichTextFields = {
  Text: {
    value:
      '<p>Rich text supports <strong>emphasis</strong> and <a href="/">internal links</a> for visitor content.</p>',
  },
};

function storyArgs(overrides: {
  fields?: RichTextFields;
  isEditing?: boolean;
} = {}) {
  return {
    rendering: createMockRendering({ componentName: 'RichText', uid: 'story-rt' }),
    page: createMockPage({ isEditing: overrides.isEditing ?? false }),
    params: createMockParams({
      RenderingIdentifier: 'rich-text-story',
      styles: '',
    }),
    fields: overrides.fields ?? bodyFields,
  };
}

type RtProps = React.ComponentProps<typeof RichTextStoryPreview>;

const storyDatasets = {
  default: storyArgs(),
  editingEmpty: storyArgs({
    isEditing: true,
    fields: { Text: { value: '' } },
  }),
} satisfies Record<string, RtProps>;

const datasetOrder = ['default', 'editingEmpty'] as const;

const meta = {
  title: 'XM / Rich Text',
  component: RichTextStoryPreview,
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
    <RichTextStoryPreview
      {...mergeStoryDataset(
        args as RtProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<RtProps & { storyDataset?: string }>>,
        'default',
      )}
    />
  ),
} satisfies Meta<RtProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'default',
  },
};

export const EditingEmpty: Story = {
  name: 'Mode: Editing, Body: Empty',
  args: {
    [STORY_DATASET]: 'editingEmpty',
  },
};
