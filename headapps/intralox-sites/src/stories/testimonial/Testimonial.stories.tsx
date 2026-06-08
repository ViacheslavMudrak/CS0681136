import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { Field, TextField } from '@sitecore-content-sdk/nextjs';

import { Default as TestimonialDefault } from 'components/testimonial/Testimonial';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const flatFields = {
  Quote: { value: '“This is a concise customer quote for Storybook.”' } as Field<string>,
  Attribution: { value: 'Alex Author' } as TextField,
  JobTitle: { value: 'Director, Operations' } as TextField,
};

type TestimonialProps = ComponentProps<typeof TestimonialDefault>;

const testimonialPositionOptions = ['left', 'center'] as const;

type TestimonialStoryPosition = (typeof testimonialPositionOptions)[number];

const storyDatasets = {
  default: {
    rendering: createMockRendering({
      componentName: 'Testimonial',
      uid: 'story-tm',
      displayName: 'Testimonial',
    }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({
      RenderingIdentifier: 'testimonial-1',
      styles: '',
      Alignment: 'Center',
    }),
    fields: flatFields,
  },
  editing: {
    rendering: createMockRendering({ componentName: 'Testimonial', uid: 'story-tm-ed' }),
    page: createMockPage({ isEditing: true }),
    params: createMockParams({ RenderingIdentifier: 'testimonial-ed', styles: '' }),
    fields: flatFields,
  },
  shortQuote: {
    rendering: createMockRendering({ componentName: 'Testimonial', uid: 'story-tm-empty' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'testimonial-empty', styles: '' }),
    fields: {
      Quote: { value: '“Short quote variant.”' } as Field<string>,
      Attribution: { value: 'J. Smith' } as TextField,
      JobTitle: { value: 'VP Operations' } as TextField,
    },
  },
  alignmentLeft: {
    rendering: createMockRendering({
      componentName: 'Testimonial',
      uid: 'story-tm-left',
      displayName: 'Testimonial',
    }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({
      RenderingIdentifier: 'testimonial-left',
      styles: 'bg-surface-muted',
      Alignment: 'Left',
    }),
    fields: flatFields,
  },
} satisfies Record<string, Partial<TestimonialProps>>;

const datasetOrder = ['default', 'editing', 'shortQuote', 'alignmentLeft'] as const;

type TestimonialStoryArgs = TestimonialProps & {
  storyDataset?: (typeof datasetOrder)[number];
  position?: TestimonialStoryPosition;
};

const meta = {
  title: 'XM / Testimonial',
  component: TestimonialDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'default',
    position: 'center' satisfies TestimonialStoryPosition,
    ...storyDatasets.default,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    position: {
      name: 'Position',
      control: 'inline-radio',
      options: [...testimonialPositionOptions],
    },
    fields: { table: { disable: true } },
  },
  render: (args) => {
    const { position = 'center', ...restForMerge } = args as TestimonialStoryArgs;
    const merged = mergeStoryDataset(
      restForMerge as TestimonialProps & { storyDataset?: string },
      storyDatasets as Record<string, Partial<TestimonialProps & { storyDataset?: string }>>,
      'default',
    );
    const params = {
      ...merged.params,
      Alignment: position,
    } as TestimonialProps['params'];
    return <TestimonialDefault {...merged} params={params} />;
  },
} satisfies Meta<TestimonialStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'default',
  },
};

export const Editing: Story = {
  name: 'Mode: Editing',
  args: {
    [STORY_DATASET]: 'editing',
  },
};

export const ShortQuote: Story = {
  name: 'Content: Short quote',
  args: {
    [STORY_DATASET]: 'shortQuote',
  },
};

/** Left alignment — different inner wrap vs center (see `Testimonial` layout utils). */
export const AlignmentLeft: Story = {
  name: 'Alignment: Left',
  args: {
    [STORY_DATASET]: 'alignmentLeft',
    position: 'left',
  },
};
