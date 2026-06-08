import type { Meta, StoryObj } from '@storybook/react';

import { Default as ContentSwitcherDefault } from 'components/contentSwitcher/ContentSwitcher';
import type { IContentSwitcherFields } from 'components/contentSwitcher/ContentSwitcher.type';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { storybookImage1, storybookImage2 } from 'src/storybook/storybookImageAssets';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

/** Matches {@link IVideoFields} — same nesting as Vitest fixtures in `ContentSwitcherClient.test.tsx`. */
const videoStub = {
  fields: {
    BrightcoveId: { value: '' },
    Autoplay: { value: false },
    Loop: { value: false },
    Caption: { value: '' },
    CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
    Title: { value: '' },
  },
};

const tabFields: IContentSwitcherFields = {
  Headline: { value: 'Solutions' },
  Description: { value: '<p>Pick a tab to compare options.</p>' },
  TabItems: [
    {
      id: 't1',
      /** Drives `?solution=` keys via {@link getContentSwitcherTabSolutionKey} (mirrors Sitecore item paths). */
      url: '/sitecore/content/Modular-Plastic-Belting',
      fields: {
        TabLabel: { value: 'Modular belting' },
        TabContent: { value: '<p>Tab one body.</p>' },
        MediaType: { fields: { Value: { value: 'Image' } } },
        Image: {
          value: {
            src: storybookImage1,
            width: 400,
            height: 300,
            alt: 'Modular belting sample',
          },
        },
        Video: videoStub,
      },
    },
    {
      id: 't2',
      url: '/sitecore/content/Services',
      fields: {
        TabLabel: { value: 'Services' },
        TabContent: { value: '<p>Tab two body.</p>' },
        MediaType: { fields: { Value: { value: 'Image' } } },
        Image: {
          value: {
            src: storybookImage2,
            width: 400,
            height: 300,
            alt: 'Services sample',
          },
        },
        Video: videoStub,
      },
    },
  ],
};

type ContentSwitcherProps = React.ComponentProps<typeof ContentSwitcherDefault>;

const storyDatasets = {
  default: {
    fields: tabFields,
    params: createMockParams({ RenderingIdentifier: 'content-switcher-1', styles: '' }),
    page: createMockPage({ isEditing: false }),
    rendering: createMockRendering({ componentName: 'ContentSwitcher', uid: 'story-cs' }),
  },
  editing: {
    fields: tabFields,
    params: createMockParams({ RenderingIdentifier: 'content-switcher-ed', styles: '' }),
    page: createMockPage({ isEditing: true }),
    rendering: createMockRendering({ componentName: 'ContentSwitcher', uid: 'story-cs-ed' }),
  },
} satisfies Record<string, Partial<ContentSwitcherProps>>;

const datasetOrder = ['default', 'editing'] as const;

const meta = {
  title: 'XM / Content Switcher',
  component: ContentSwitcherDefault,
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
  render: (args) => (
    <ContentSwitcherDefault
      {...mergeStoryDataset(
        args as ContentSwitcherProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<ContentSwitcherProps & { storyDataset?: string }>>,
        'default',
      )}
    />
  ),
} satisfies Meta<ContentSwitcherProps & { storyDataset?: (typeof datasetOrder)[number] }>;

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
