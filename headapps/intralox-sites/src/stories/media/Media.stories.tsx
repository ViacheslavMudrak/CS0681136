import type { Meta, StoryObj } from '@storybook/react';
import type { Field, ImageField } from '@sitecore-content-sdk/nextjs';

import { Default as MediaDefault } from 'components/media/Media';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { storybookImage1 } from 'src/storybook/storybookImageAssets';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const imageFields = {
  MediaType: { fields: { Value: { value: 'Image' } } },
  Image: {
    value: {
      src: storybookImage1,
      width: 800,
      height: 500,
      alt: 'Sample',
    },
  } as ImageField,
  Caption: { value: 'Caption text' } as Field<string>,
};

type MediaProps = React.ComponentProps<typeof MediaDefault>;

const storyDatasets = {
  withImage: {
    rendering: createMockRendering({ componentName: 'Media', uid: 'story-media' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'media-1', styles: '' }),
    fields: imageFields as never,
  },
  alternateCaption: {
    rendering: createMockRendering({ componentName: 'Media', uid: 'story-media-m' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'media-m', styles: '' }),
    fields: {
      ...imageFields,
      Caption: { value: 'Alternate caption — same media, different label.' },
    } as never,
  },
  editing: {
    rendering: createMockRendering({ componentName: 'Media', uid: 'story-media-ed' }),
    page: createMockPage({ isEditing: true }),
    params: createMockParams({ RenderingIdentifier: 'media-ed', styles: '' }),
    fields: imageFields as never,
  },
} satisfies Record<string, Partial<MediaProps>>;

const datasetOrder = ['withImage', 'alternateCaption', 'editing'] as const;

const meta = {
  title: 'XM / Media',
  component: MediaDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'withImage',
    ...storyDatasets.withImage,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    fields: { table: { disable: true } },
  },
  render: (args) => (
    <MediaDefault
      {...mergeStoryDataset(
        args as MediaProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<MediaProps & { storyDataset?: string }>>,
        'withImage',
      )}
    />
  ),
} satisfies Meta<MediaProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'withImage',
  },
};

export const AlternateCaption: Story = {
  name: 'Caption: Alternate',
  args: {
    [STORY_DATASET]: 'alternateCaption',
  },
};

export const Editing: Story = {
  name: 'Mode: Editing',
  args: {
    [STORY_DATASET]: 'editing',
  },
};
