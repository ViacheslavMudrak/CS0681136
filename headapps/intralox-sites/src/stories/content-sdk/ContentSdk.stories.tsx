import type { Meta, StoryObj } from '@storybook/react';
import type { LayoutServiceData } from '@sitecore-content-sdk/nextjs';

import SitecoreStyles from 'components/content-sdk/SitecoreStyles';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

/** Minimal layout payload so `SitecoreStyles` can resolve head links when styles are enabled. */
const layoutStub = {
  sitecore: {
    context: {},
    route: {
      itemId: 'story-item',
      itemLanguage: 'en',
    },
  },
} as LayoutServiceData;

type SitecoreStylesProps = React.ComponentProps<typeof SitecoreStyles>;

const storyDatasets = {
  stylesHead: {
    layoutData: layoutStub,
    enableStyles: true,
    enableThemes: false,
  },
  themesOn: {
    layoutData: layoutStub,
    enableStyles: false,
    enableThemes: true,
  },
  minimal: {
    layoutData: layoutStub,
    enableStyles: false,
    enableThemes: false,
  },
} satisfies Record<string, Partial<SitecoreStylesProps>>;

const datasetOrder = ['stylesHead', 'themesOn', 'minimal'] as const;

const meta = {
  title: 'XM / Content SDK',
  component: SitecoreStyles,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'stylesHead',
    ...storyDatasets.stylesHead,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    layoutData: { table: { disable: true } },
  },
  render: (args) => (
    <SitecoreStyles
      {...mergeStoryDataset(
        args as SitecoreStylesProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<SitecoreStylesProps & { storyDataset?: string }>>,
        'stylesHead',
      )}
    />
  ),
} satisfies Meta<SitecoreStylesProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'stylesHead',
  },
};

export const ThemesOnly: Story = {
  name: 'Styles: Themes only',
  args: {
    [STORY_DATASET]: 'themesOn',
  },
};

export const MinimalHead: Story = {
  name: 'Head: Minimal',
  args: {
    [STORY_DATASET]: 'minimal',
  },
};
