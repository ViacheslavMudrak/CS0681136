import type { Meta, StoryObj } from '@storybook/react';
import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import { Banner as ImageBanner, Default as ImageDefault } from 'components/image/Image';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { storybookBannerImage, storybookImage1 } from 'src/storybook/storybookImageAssets';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const sampleImage: ImageField = {
  value: {
    src: storybookImage1,
    width: 640,
    height: 400,
    alt: 'Sample image',
  },
};

type ImageDefaultProps = React.ComponentProps<typeof ImageDefault>;
type ImageBannerProps = React.ComponentProps<typeof ImageBanner>;

const storyDatasets = {
  default: {
    rendering: createMockRendering({ componentName: 'Image', uid: 'story-img' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'image-1', styles: '' }),
    fields: {
      Image: sampleImage,
      ImageCaption: { value: 'Caption under the image' } as Field<string>,
      TargetUrl: { value: { href: '' } } as LinkField,
    },
  },
  withLink: {
    rendering: createMockRendering({ componentName: 'Image', uid: 'story-img-l' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'image-link', styles: '' }),
    fields: {
      Image: sampleImage,
      ImageCaption: { value: '' } as Field<string>,
      TargetUrl: { value: { href: '/target', text: 'Open' } } as LinkField,
    },
  },
  captionOnlyVariant: {
    rendering: createMockRendering({ componentName: 'Image', uid: 'story-img-m' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'image-missing', styles: '' }),
    fields: {
      Image: sampleImage,
      ImageCaption: { value: 'Image with caption; no target link (href empty).' } as Field<string>,
      TargetUrl: { value: { href: '' } } as LinkField,
    },
  },
  editing: {
    rendering: createMockRendering({ componentName: 'Image', uid: 'story-img-ed' }),
    page: createMockPage({ isEditing: true }),
    params: createMockParams({ RenderingIdentifier: 'image-ed', styles: '' }),
    fields: {
      Image: sampleImage,
      ImageCaption: { value: 'Editing caption' } as Field<string>,
      TargetUrl: { value: { href: '/edit' } } as LinkField,
    },
  },
  heroBanner: {
    rendering: createMockRendering({ componentName: 'Image', uid: 'story-img-banner' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'image-hero', styles: '' }),
    fields: {
      Image: {
        value: {
          ...sampleImage.value,
          src: storybookBannerImage,
          width: 1600,
          height: 900,
        },
      },
      ImageCaption: { value: '' } as Field<string>,
      TargetUrl: { value: { href: '' } } as LinkField,
    },
  },
} satisfies Record<string, Partial<ImageDefaultProps & ImageBannerProps>>;

const datasetOrder = ['default', 'withLink', 'captionOnlyVariant', 'editing', 'heroBanner'] as const;

const meta = {
  title: 'XM / Image',
  component: ImageDefault,
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
      args as ImageDefaultProps & { storyDataset?: string },
      storyDatasets as Record<string, Partial<ImageDefaultProps & { storyDataset?: string }>>,
      'default',
    );
    if (key === 'heroBanner') {
      return <ImageBanner {...(merged as ImageBannerProps)} />;
    }
    return <ImageDefault {...merged} />;
  },
} satisfies Meta<ImageDefaultProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'default',
  },
};

export const WithLink: Story = {
  name: 'Link: With target',
  args: {
    [STORY_DATASET]: 'withLink',
  },
};

export const CaptionOnlyVariant: Story = {
  name: 'Caption: Long, no link',
  args: {
    [STORY_DATASET]: 'captionOnlyVariant',
  },
};

export const Editing: Story = {
  name: 'Mode: Editing',
  args: {
    [STORY_DATASET]: 'editing',
  },
};

/** Sitecore rendering variant `Banner` — full-bleed hero image (`hero-banner` wrapper). */
export const HeroBanner: Story = {
  name: 'Variant: Banner, Layout: Hero',
  args: {
    [STORY_DATASET]: 'heroBanner',
  },
};
