import type { Meta, StoryObj } from '@storybook/react';
import type { ImageField, TextField } from '@sitecore-content-sdk/nextjs';

import { Default as BannerDefault } from 'components/banner/Banner';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { createMockPageWithLayoutRoute } from 'src/storybook/pageWithLayoutRoute';
import { storybookBannerImage } from 'src/storybook/storybookImageAssets';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const routeImage: ImageField = {
  value: {
    src: storybookBannerImage,
    width: 1920,
    height: 600,
    alt: 'Banner',
  },
};

const routeTitle: TextField = { value: 'Industrial automation' };

type BannerProps = React.ComponentProps<typeof BannerDefault>;

/** Datasource mirrors route fields so Storybook shows the same shape authors bind in Sitecore. */
const datasourceFields = { Title: routeTitle, Image: routeImage };

const storyDatasets = {
  titleStrip: {
    rendering: createMockRendering({ componentName: 'Banner', uid: 'story-bn' }),
    page: createMockPageWithLayoutRoute({
      isEditing: false,
      routeFields: { Title: routeTitle, Image: routeImage },
    }),
    params: createMockParams({
      RenderingIdentifier: 'banner-1',
      styles: '',
      ShowImage: '0',
    }),
    fields: datasourceFields,
  },
  withImage: {
    rendering: createMockRendering({ componentName: 'Banner', uid: 'story-bn-img' }),
    page: createMockPageWithLayoutRoute({
      isEditing: false,
      routeFields: { Title: routeTitle, Image: routeImage },
    }),
    params: createMockParams({
      RenderingIdentifier: 'banner-img',
      styles: '',
      ShowImage: '1',
    }),
    fields: datasourceFields,
  },
  editingWithRouteContent: {
    rendering: createMockRendering({ componentName: 'Banner', uid: 'story-bn-ed' }),
    page: createMockPageWithLayoutRoute({
      isEditing: true,
      routeFields: { Title: routeTitle, Image: routeImage },
    }),
    params: createMockParams({
      RenderingIdentifier: 'banner-ed',
      styles: '',
      ShowImage: '1',
    }),
    fields: datasourceFields,
  },
} satisfies Record<string, Partial<BannerProps>>;

const datasetOrder = ['titleStrip', 'withImage', 'editingWithRouteContent'] as const;

const meta = {
  title: 'XM / Banner',
  component: BannerDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'titleStrip',
    ...storyDatasets.titleStrip,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
  },
  render: (args) => (
    <BannerDefault
      {...mergeStoryDataset(
        args as BannerProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<BannerProps & { storyDataset?: string }>>,
        'titleStrip',
      )}
    />
  ),
} satisfies Meta<BannerProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'titleStrip',
  },
};

export const WithImage: Story = {
  name: 'Image: Shown',
  args: {
    [STORY_DATASET]: 'withImage',
  },
};

export const EditingWithRouteContent: Story = {
  name: 'Mode: Editing, Route + datasource',
  args: {
    [STORY_DATASET]: 'editingWithRouteContent',
  },
};
