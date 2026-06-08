import type { Meta, StoryObj } from '@storybook/react';

import { Default as FooterDefault } from 'components/footer/Footer';
import { storybookFullFooterFields } from 'src/storybook/fixtures/layoutChromeFixtures';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

type FooterProps = React.ComponentProps<typeof FooterDefault>;

const storyDatasets = {
  fullFooter: {
    rendering: createMockRendering({ componentName: 'Footer', uid: 'story-ft' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'footer-1', styles: '' }),
    fields: storybookFullFooterFields,
  },
  editingFullFooter: {
    rendering: createMockRendering({ componentName: 'Footer', uid: 'story-ft-ed' }),
    page: createMockPage({ isEditing: true }),
    params: createMockParams({ RenderingIdentifier: 'footer-ed', styles: '' }),
    fields: storybookFullFooterFields,
  },
} satisfies Record<string, Partial<FooterProps>>;

const datasetOrder = ['fullFooter', 'editingFullFooter'] as const;

const meta = {
  title: 'XM / Footer',
  component: FooterDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'fullFooter',
    ...storyDatasets.fullFooter,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
  },
  render: (args) => (
    <FooterDefault
      {...mergeStoryDataset(
        args as FooterProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<FooterProps & { storyDataset?: string }>>,
        'fullFooter',
      )}
    />
  ),
} satisfies Meta<FooterProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Columns, social, legal: Full data',
  args: {
    [STORY_DATASET]: 'fullFooter',
  },
};

export const Editing: Story = {
  name: 'Mode: Editing, Full data',
  args: {
    [STORY_DATASET]: 'editingFullFooter',
  },
};
