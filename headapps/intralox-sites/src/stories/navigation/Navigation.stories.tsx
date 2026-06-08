import type { Meta, StoryObj } from '@storybook/react';

import { Default as NavigationDefault } from 'components/navigation/Navigation';
import { storybookFullNavigationFields } from 'src/storybook/fixtures/layoutChromeFixtures';
import { createMockPageWithLayoutRoute } from 'src/storybook/pageWithLayoutRoute';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

type NavigationProps = React.ComponentProps<typeof NavigationDefault>;

function navigationStoryPage(isEditing: boolean) {
  return createMockPageWithLayoutRoute({
    isEditing,
    itemPath: '/en/sitecore/content/home/solutions',
    routeFields: { Title: { value: 'Solutions hub' } },
  });
}

const storyDatasets = {
  fullNavigation: {
    rendering: createMockRendering({ componentName: 'Navigation', uid: 'story-nav' }),
    page: navigationStoryPage(false),
    params: createMockParams({ RenderingIdentifier: 'navigation-1', styles: '' }),
    fields: storybookFullNavigationFields,
  },
  editingFullNavigation: {
    rendering: createMockRendering({ componentName: 'Navigation', uid: 'story-nav-ed' }),
    page: navigationStoryPage(true),
    params: createMockParams({ RenderingIdentifier: 'navigation-ed', styles: '' }),
    fields: storybookFullNavigationFields,
  },
} satisfies Record<string, Partial<NavigationProps>>;

const datasetOrder = ['fullNavigation', 'editingFullNavigation'] as const;

const meta = {
  title: 'XM / Navigation',
  component: NavigationDefault,
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
    <NavigationDefault
      {...mergeStoryDataset(
        args as NavigationProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<NavigationProps & { storyDataset?: string }>>,
        'fullNavigation',
      )}
    />
  ),
} satisfies Meta<NavigationProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Top bar, mega menu, search: Full data',
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
