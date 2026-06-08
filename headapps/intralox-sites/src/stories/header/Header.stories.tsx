import type { Meta, StoryObj } from '@storybook/react';

import { Default as HeaderDefault } from 'components/header/Header';
import { storybookFullNavigationFields } from 'src/storybook/fixtures/layoutChromeFixtures';
import { createMockPageWithLayoutRoute } from 'src/storybook/pageWithLayoutRoute';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

type HeaderProps = React.ComponentProps<typeof HeaderDefault>;

function headerStoryPage(isEditing: boolean) {
  return createMockPageWithLayoutRoute({
    isEditing,
    itemPath: '/en/sitecore/content/home/solutions',
    routeFields: { Title: { value: 'Solutions' } },
  });
}

const storyDatasets = {
  fullNavigation: {
    rendering: createMockRendering({ componentName: 'Header', uid: 'story-hdr' }),
    page: headerStoryPage(false),
    params: createMockParams({ RenderingIdentifier: 'header-1', styles: '' }),
    fields: storybookFullNavigationFields,
  },
  editingFullNavigation: {
    rendering: createMockRendering({ componentName: 'Header', uid: 'story-hdr-ed' }),
    page: headerStoryPage(true),
    params: createMockParams({ RenderingIdentifier: 'header-ed', styles: '' }),
    fields: storybookFullNavigationFields,
  },
} satisfies Record<string, Partial<HeaderProps>>;

const datasetOrder = ['fullNavigation', 'editingFullNavigation'] as const;

const meta = {
  title: 'XM / Header',
  component: HeaderDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'fullNavigation',
    ...storyDatasets.fullNavigation,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
  },
  render: (args) => (
    <HeaderDefault
      {...mergeStoryDataset(
        args as HeaderProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<HeaderProps & { storyDataset?: string }>>,
        'fullNavigation',
      )}
    />
  ),
} satisfies Meta<HeaderProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Navigation: Full data',
  args: {
    [STORY_DATASET]: 'fullNavigation',
  },
};

export const Editing: Story = {
  name: 'Mode: Editing, Full data',
  args: {
    [STORY_DATASET]: 'editingFullNavigation',
  },
};
