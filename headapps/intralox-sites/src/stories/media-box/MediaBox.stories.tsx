import type { Meta, StoryObj } from '@storybook/react';
import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import { Default as MediaBoxDefault } from 'components/media-box/MediaBox';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { storybookImage1 } from 'src/storybook/storybookImageAssets';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const richFields = {
  Heading: { value: 'Media box headline' } as Field<string>,
  Text: { value: '<p>Supporting copy beside the visual.</p>' } as Field<string>,
  Link: { value: { href: '/details', text: 'Learn more' } } as LinkField,
  Image: {
    value: {
      src: storybookImage1,
      width: 600,
      height: 400,
      alt: 'Visual',
    },
  } as ImageField,
  MediaType: { fields: { Value: { value: 'Image' } } },
};

const storyDatasets = {
  withContent: {
    rendering: createMockRendering({ componentName: 'MediaBox', uid: 'story-mb-2' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'media-box-1', styles: '' }),
    fields: richFields as never,
  },
  editingWithContent: {
    rendering: createMockRendering({ componentName: 'MediaBox', uid: 'story-mb' }),
    page: createMockPage({ isEditing: true }),
    params: createMockParams({ RenderingIdentifier: 'media-box-ed', styles: '' }),
    fields: richFields as never,
  },
} satisfies Record<string, Partial<React.ComponentProps<typeof MediaBoxDefault>>>;

const datasetOrder = ['withContent', 'editingWithContent'] as const;

const meta = {
  title: 'XM / Media Box',
  component: MediaBoxDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'withContent',
    ...storyDatasets.withContent,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    fields: { table: { disable: true } },
  },
  render: (args) => (
    <MediaBoxDefault
      {...mergeStoryDataset(
        args as React.ComponentProps<typeof MediaBoxDefault> & { storyDataset?: string },
        storyDatasets as Record<
          string,
          Partial<React.ComponentProps<typeof MediaBoxDefault> & { storyDataset?: string }>
        >,
        'withContent',
      )}
    />
  ),
} satisfies Meta<React.ComponentProps<typeof MediaBoxDefault> & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'withContent',
  },
};

export const EditingWithContent: Story = {
  name: 'Mode: Editing, Full fields',
  args: {
    [STORY_DATASET]: 'editingWithContent',
  },
};
