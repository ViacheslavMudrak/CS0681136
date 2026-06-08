import type { Meta, StoryObj } from '@storybook/react';

import { Default as InfoBoxDefault } from 'components/info-box/InfoBox';
import type { InfoBoxFields } from 'components/info-box/InfoBox.type';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const richFields: InfoBoxFields = {
  Text: { value: '<p>Info box <strong>message</strong> for authors and visitors.</p>' },
  Context: { value: 'Info' },
  HideIcon: { value: false },
};

type InfoBoxProps = React.ComponentProps<typeof InfoBoxDefault>;

const storyDatasets = {
  default: {
    rendering: createMockRendering({ componentName: 'InfoBox', uid: 'story-ib' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'info-box-1', styles: '' }),
    fields: richFields,
  },
  editingWithPlaceholders: {
    rendering: createMockRendering({ componentName: 'InfoBox', uid: 'story-ib-ed' }),
    page: createMockPage({ isEditing: true }),
    params: createMockParams({ RenderingIdentifier: 'info-box-ed', styles: '' }),
    fields: {
      Text: { value: '<p>Authoring placeholder — replace with final message.</p>' },
      Context: { value: 'Info' },
      HideIcon: { value: false },
    } satisfies InfoBoxFields,
  },
  previewNeutral: {
    rendering: createMockRendering({ componentName: 'InfoBox', uid: 'story-ib-none' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'info-box-none', styles: '' }),
    fields: {
      Text: { value: '<p>Neutral context copy for preview visitors.</p>' },
      Context: { value: 'None' },
      HideIcon: { value: false },
    } satisfies InfoBoxFields,
  },
  successContext: {
    rendering: createMockRendering({ componentName: 'InfoBox', uid: 'story-ib-ok' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'info-box-success', styles: '' }),
    fields: {
      Text: { value: '<p>Operation completed successfully.</p>' },
      Context: { value: 'Success' },
      HideIcon: { value: false },
    } satisfies InfoBoxFields,
  },
  withStyleParams: {
    rendering: createMockRendering({ componentName: 'InfoBox', uid: 'story-ib-st' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({
      RenderingIdentifier: 'info-box-styled',
      styles: 'bg-surface-muted border-stroke-default',
    }),
    fields: richFields,
  },
} satisfies Record<string, Partial<InfoBoxProps>>;

const datasetOrder = [
  'default',
  'editingWithPlaceholders',
  'previewNeutral',
  'successContext',
  'withStyleParams',
] as const;

const meta = {
  title: 'XM / Info Box',
  component: InfoBoxDefault,
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
    <InfoBoxDefault
      {...mergeStoryDataset(
        args as InfoBoxProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<InfoBoxProps & { storyDataset?: string }>>,
        'default',
      )}
    />
  ),
} satisfies Meta<InfoBoxProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'default',
  },
};

export const EditingWithPlaceholders: Story = {
  name: 'Mode: Editing, Full fields',
  args: {
    [STORY_DATASET]: 'editingWithPlaceholders',
  },
};

export const PreviewNeutral: Story = {
  name: 'Context: None (full fields)',
  args: {
    [STORY_DATASET]: 'previewNeutral',
  },
};

/** Success context — drives icon + accent styling. */
export const SuccessContext: Story = {
  name: 'Context: Success',
  args: {
    [STORY_DATASET]: 'successContext',
  },
};

/** Token-backed surface via `params.styles` (placeholder chrome). */
export const WithStyleParams: Story = {
  name: 'Styles: Params',
  args: {
    [STORY_DATASET]: 'withStyleParams',
  },
};
