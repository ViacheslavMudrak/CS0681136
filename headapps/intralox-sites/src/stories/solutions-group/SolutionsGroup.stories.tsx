import type { Meta, StoryObj } from '@storybook/react';

import { Default as SolutionsGroupDefault } from 'components/solutions-group/SolutionsGroup';
import type { ISolutionsGroupFields } from 'components/solutions-group/SolutionsGroup.type';
import { createMockParams } from 'src/storybook/mockParams';
import { storybookImage1, storybookImage2 } from 'src/storybook/storybookImageAssets';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const videoBundle = {
  fields: {
    BrightcoveId: { value: '' },
    Autoplay: { value: false },
    Loop: { value: false },
    Caption: { value: '' },
    CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
    Title: { value: '' },
  },
};

const fieldsImage: ISolutionsGroupFields = {
  Text: { value: '<p>Solutions group rich text.</p>' },
  Image: {
    value: { src: storybookImage1, width: 800, height: 600, alt: '' },
  },
  MediaType: { fields: { Value: { value: 'image' } } },
  Video: videoBundle,
  QuickLinks: [],
};

const fieldsVideo: ISolutionsGroupFields = {
  ...fieldsImage,
  MediaType: { fields: { Value: { value: 'video' } } },
  Video: {
    fields: {
      BrightcoveId: { value: 'story-bc-sg' },
      Autoplay: { value: false },
      Loop: { value: false },
      Caption: { value: '' },
      CoverImage: {
        value: {
          src: storybookImage2,
          width: 800,
          height: 600,
          alt: '',
        },
      },
      Title: { value: 'Solutions video' },
    },
  },
};

type SolutionsGroupProps = React.ComponentProps<typeof SolutionsGroupDefault>;

const baseParams = createMockParams({
  RenderingIdentifier: 'solutions-1',
  styles: '',
  ColorScheme: { Value: { value: 'Light' } },
  Theme: { Value: { value: 'landingPage' } },
}) as SolutionsGroupProps['params'];

const storyDatasets = {
  image: {
    fields: fieldsImage,
    params: baseParams,
  },
  video: {
    fields: fieldsVideo,
    params: createMockParams({
      RenderingIdentifier: 'solutions-video',
      styles: '',
      ColorScheme: { Value: { value: 'Light' } },
      Theme: { Value: { value: 'landingPage' } },
    }) as SolutionsGroupProps['params'],
  },
} satisfies Record<string, Partial<SolutionsGroupProps>>;

const datasetOrder = ['image', 'video'] as const;

const meta = {
  title: 'XM / Solutions Group',
  component: SolutionsGroupDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'image',
    ...storyDatasets.image,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    fields: { table: { disable: true } },
  },
  render: (args) => (
    <SolutionsGroupDefault
      {...mergeStoryDataset(
        args as SolutionsGroupProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<SolutionsGroupProps & { storyDataset?: string }>>,
        'image',
      )}
    />
  ),
} satisfies Meta<SolutionsGroupProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'image',
  },
};

export const VideoMedia: Story = {
  name: 'Media: Video',
  args: {
    [STORY_DATASET]: 'video',
  },
};
