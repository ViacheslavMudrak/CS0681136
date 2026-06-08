import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import { Default as CallToActionDefault } from 'components/callToAction/CallToAction';
import type { ICallToActionFields } from 'components/callToAction/CallToAction.type';
import { createMockParams } from 'src/storybook/mockParams';
import { storybookImage1 } from 'src/storybook/storybookImageAssets';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';
import React from 'react';

const fields: ICallToActionFields = {
  Heading: { value: 'Ready to improve throughput?' } as Field<string>,
  Text: { value: '<p>Short supporting copy for the CTA band.</p>' } as Field<string>,
  Link: { value: { href: '/contact', text: 'Talk to us' } } as LinkField,
  Image: {
    value: {
      src: storybookImage1,
      width: 400,
      height: 300,
      alt: 'CTA visual',
    },
  } as ImageField,
};

const fieldsTextOnly: ICallToActionFields = {
  Heading: { value: 'Text-only CTA' } as Field<string>,
  Text: { value: '<p>No image in this preset.</p>' } as Field<string>,
  Link: { value: { href: '/learn', text: 'Learn more' } } as LinkField,
  Image: { value: { src: '', width: 0, height: 0, alt: '' } } as ImageField,
};

type CtaProps = ComponentProps<typeof CallToActionDefault>;

type CtaTextSize = 'base' | 'xl';

const storyDatasets = {
  default: {
    fields,
    params: createMockParams({ RenderingIdentifier: 'cta-1', styles: '' }),
  },
  textOnly: {
    fields: fieldsTextOnly,
    params: createMockParams({ RenderingIdentifier: 'cta-text', styles: 'bg-surface-muted' }),
  },
} satisfies Record<string, Partial<CtaProps>>;

const datasetOrder = ['default', 'textOnly'] as const;

type CtaStoryArgs = CtaProps & {
  storyDataset?: (typeof datasetOrder)[number];
  textSize?: CtaTextSize;
};

const meta = {
  title: 'XM / Call to Action',
  component: CallToActionDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'default',
    textSize: 'base' satisfies CtaTextSize,
    ...storyDatasets.default,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    textSize: {
      name: 'Text size',
      control: 'inline-radio',
      options: ['base', 'xl'] satisfies CtaTextSize[],
    },
    fields: { table: { disable: true } },
  },
  render: (args) => {
    const { textSize = 'base', ...rest } = args as CtaStoryArgs;
    const merged = mergeStoryDataset(
      rest as CtaProps & { storyDataset?: string },
      storyDatasets as Record<string, Partial<CtaProps & { storyDataset?: string }>>,
      'default',
    );
    return (
      <CallToActionDefault
        {...merged}
        params={{
          ...merged.params,
          TextSize: { Value: { value: textSize } },
        }}
      />
    );
  },
} satisfies Meta<CtaStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'default',
  },
};

export const TextOnly: Story = {
  name: 'Layout: Text only',
  args: {
    [STORY_DATASET]: 'textOnly',
  },
};
