import type { Meta, StoryObj } from '@storybook/react';
import type { Field, ImageField, TextField } from '@sitecore-content-sdk/nextjs';

import { Default as TextAndAsideDefault } from 'components/text-aside/TextAndAside';
import { storybookImage2 } from 'src/storybook/storybookImageAssets';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

type TextAndAsideProps = React.ComponentProps<typeof TextAndAsideDefault>;

const asideImage: ImageField = {
  value: {
    src: storybookImage2,
    width: 640,
    height: 480,
    alt: 'Supporting visual',
  },
};

const storyDatasets = {
  titleAndBody: {
    rendering: createMockRendering({ componentName: 'TextAndAside', uid: 'story-ta-2' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({
      RenderingIdentifier: 'text-aside-1',
      styles: '',
      AsideWidth: { Value: { value: '40' } },
    }),
    fields: {
      Title: { value: 'Text column headline' } as TextField,
      Description: { value: '<p>Supporting rich text for the main column.</p>' } as Field<string>,
    },
  },
  fullSplitWithImage: {
    rendering: createMockRendering({ componentName: 'TextAndAside', uid: 'story-ta-full' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({
      RenderingIdentifier: 'text-aside-full',
      styles: '',
      AsideWidth: { Value: { value: '40' } },
      AsidePosition: { Value: { value: 'Right' } },
      LayoutOrientation: { Value: { value: 'Horizontal' } },
      AlignColumns: { Value: { value: 'Top' } },
      Divider: { Value: { value: '1' } },
    }),
    fields: {
      Title: { value: 'Headline with full aside' } as TextField,
      Description: {
        value: '<p>Rich text column with media aside, caption, and placeholder flags off.</p>',
      } as Field<string>,
      MediaCaption: { value: 'Figure caption for the aside image.' } as Field<string>,
      MediaType: { fields: { Value: { value: 'Image' } } },
      Image: asideImage,
      HasTextContentPlaceholder: { value: false },
      HasAsideContentPlaceholder: { value: false },
    },
  },
  editing: {
    rendering: createMockRendering({ componentName: 'TextAndAside', uid: 'story-ta-ed' }),
    page: createMockPage({ isEditing: true }),
    params: createMockParams({
      RenderingIdentifier: 'text-aside-ed',
      styles: '',
      AsideWidth: { Value: { value: '40' } },
    }),
    fields: {
      Title: { value: 'Editable title' } as TextField,
      Description: { value: '<p>Editable body copy.</p>' } as Field<string>,
      MediaType: { fields: { Value: { value: 'Image' } } },
      Image: asideImage,
      MediaCaption: { value: 'Editable caption' } as Field<string>,
    },
  },
} satisfies Record<string, Partial<TextAndAsideProps>>;

const datasetOrder = ['fullSplitWithImage', 'titleAndBody', 'editing'] as const;

const meta = {
  title: 'XM / Text and Aside',
  component: TextAndAsideDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'fullSplitWithImage',
    ...storyDatasets.fullSplitWithImage,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    fields: { table: { disable: true } },
  },
  render: (args) => (
    <TextAndAsideDefault
      {...mergeStoryDataset(
        args as TextAndAsideProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<TextAndAsideProps & { storyDataset?: string }>>,
        'fullSplitWithImage',
      )}
    />
  ),
} satisfies Meta<TextAndAsideProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Split + image (full fields)',
  args: {
    [STORY_DATASET]: 'fullSplitWithImage',
  },
};

export const TitleAndBody: Story = {
  name: 'Text only (no aside media)',
  args: {
    [STORY_DATASET]: 'titleAndBody',
  },
};

export const Editing: Story = {
  name: 'Mode: Editing',
  args: {
    [STORY_DATASET]: 'editing',
  },
};
