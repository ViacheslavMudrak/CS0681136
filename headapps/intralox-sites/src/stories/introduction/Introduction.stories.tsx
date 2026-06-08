import type { Meta, StoryObj } from '@storybook/react';
import type { Field, ImageField, TextField } from '@sitecore-content-sdk/nextjs';

import { Default as IntroductionDefault } from 'components/introduction/Introduction';
import type { IntroductionFields } from 'components/introduction/Introduction.type';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { storybookImage2 } from 'src/storybook/storybookImageAssets';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

type IntroductionProps = React.ComponentProps<typeof IntroductionDefault>;

const fullIntroFields = {
  Headline: { value: 'Introduction headline' } as TextField,
  Description: { value: '<p>Body copy for the introduction block.</p>' } as Field<string>,
  MediaType: { fields: { Value: { value: 'Image' } } },
  Image: {
    value: {
      src: storybookImage2,
      width: 440,
      height: 440,
      alt: 'Intro visual',
    },
  } as ImageField,
} satisfies IntroductionFields;

const storyDatasets = {
  minimalTextOnly: {
    rendering: createMockRendering({ componentName: 'Introduction', uid: 'story-intro' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'intro-m', styles: '' }),
    fields: {
      Headline: { value: 'Text-only introduction' } as TextField,
      Description: { value: '<p>Headline and body without media.</p>' } as Field<string>,
    } satisfies IntroductionFields,
  },
  withHeadlineAndImage: {
    rendering: createMockRendering({ componentName: 'Introduction', uid: 'story-intro-2' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'intro-1', styles: '' }),
    fields: fullIntroFields,
  },
  editing: {
    rendering: createMockRendering({ componentName: 'Introduction', uid: 'story-intro-ed' }),
    page: createMockPage({ isEditing: true }),
    params: createMockParams({ RenderingIdentifier: 'intro-ed', styles: '' }),
    fields: {
      ...fullIntroFields,
      Headline: { value: 'Editable headline' } as TextField,
      Description: { value: '<p>Editable rich text in Pages mode.</p>' } as Field<string>,
    } satisfies IntroductionFields,
  },
} satisfies Record<string, Partial<IntroductionProps>>;

const datasetOrder = ['withHeadlineAndImage', 'minimalTextOnly', 'editing'] as const;

const meta = {
  title: 'XM / Introduction',
  component: IntroductionDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'withHeadlineAndImage',
    ...storyDatasets.withHeadlineAndImage,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    fields: { table: { disable: true } },
  },
  render: (args) => (
    <IntroductionDefault
      {...mergeStoryDataset(
        args as IntroductionProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<IntroductionProps & { storyDataset?: string }>>,
        'withHeadlineAndImage',
      )}
    />
  ),
} satisfies Meta<IntroductionProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'withHeadlineAndImage',
  },
};

export const MinimalTextOnly: Story = {
  name: 'Text only (no media)',
  args: {
    [STORY_DATASET]: 'minimalTextOnly',
  },
};

export const Editing: Story = {
  name: 'Mode: Editing',
  args: {
    [STORY_DATASET]: 'editing',
  },
};
