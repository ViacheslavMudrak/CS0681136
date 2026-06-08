import type { Meta, StoryObj } from '@storybook/react';
import type { ImageField } from '@sitecore-content-sdk/nextjs';

import { Default as BrandingLineDefault, SlantBottom as BrandingLineSlantBottom } from 'components/branding-line/BrandingLine';
import type { IBrandLineFields } from 'components/branding-line/BrandingLine.type';
import { createMockParams } from 'src/storybook/mockParams';
import { storybookImage3 } from 'src/storybook/storybookImageAssets';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const fields: IBrandLineFields = {
  BrandingLineImage: {
    value: {
      src: storybookImage3,
      width: 1200,
      height: 200,
      alt: 'Brand line',
    },
  } as ImageField,
  BrandingLineType: { fields: { Value: { value: 'default' } } },
};

type BrandingLineDefaultProps = React.ComponentProps<typeof BrandingLineDefault>;

const storyDatasets = {
  default: {
    fields,
    params: createMockParams({ RenderingIdentifier: 'branding-line-1', styles: '' }),
  },
  slantBottom: {
    fields,
    params: createMockParams({ RenderingIdentifier: 'branding-line-slant', styles: '' }),
  },
} satisfies Record<string, Partial<BrandingLineDefaultProps>>;

const datasetOrder = ['default', 'slantBottom'] as const;

const meta = {
  title: 'XM / Branding Line',
  component: BrandingLineDefault,
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
  render: (args) => {
    const key = (args as Record<string, unknown>)[STORY_DATASET] ?? 'default';
    const merged = mergeStoryDataset(
      args as BrandingLineDefaultProps & { storyDataset?: string },
      storyDatasets as Record<string, Partial<BrandingLineDefaultProps & { storyDataset?: string }>>,
      'default',
    );
    if (key === 'slantBottom') {
      return <BrandingLineSlantBottom {...merged} />;
    }
    return <BrandingLineDefault {...merged} />;
  },
} satisfies Meta<BrandingLineDefaultProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'default',
  },
};

export const SlantBottomVariant: Story = {
  name: 'Variant: Slant bottom',
  args: {
    [STORY_DATASET]: 'slantBottom',
  },
};
