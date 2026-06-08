import type { Meta, StoryObj } from '@storybook/react';
import type { RichTextField } from '@sitecore-content-sdk/nextjs';

import { Default as PageContentDefault } from 'components/page-content/PageContent';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { createMockPageWithLayoutRoute } from 'src/storybook/pageWithLayoutRoute';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const bodyField: RichTextField = {
  value: '<p>Storybook body copy for page content.</p>',
};

type PageContentProps = React.ComponentProps<typeof PageContentDefault>;

const storyDatasets = {
  default: {
    rendering: createMockRendering({ componentName: 'PageContent', uid: 'story-pc' }),
    params: createMockParams({ RenderingIdentifier: 'page-content-1', styles: '' }),
    page: createMockPage({ isEditing: false }),
    fields: { Content: bodyField },
  },
  fromRouteFallback: {
    rendering: createMockRendering({ componentName: 'PageContent', uid: 'story-pc-2' }),
    params: createMockParams({ RenderingIdentifier: 'page-content-route', styles: '' }),
    page: createMockPageWithLayoutRoute({
      isEditing: false,
      routeFields: { Content: bodyField },
    }),
    fields: {} as never,
  },
  editing: {
    rendering: createMockRendering({ componentName: 'PageContent', uid: 'story-pc-ed' }),
    params: createMockParams({ RenderingIdentifier: 'page-content-ed', styles: '' }),
    page: createMockPage({ isEditing: true }),
    fields: { Content: bodyField },
  },
} satisfies Record<string, Partial<PageContentProps>>;

const datasetOrder = ['default', 'fromRouteFallback', 'editing'] as const;

const meta = {
  title: 'XM / Page Content',
  component: PageContentDefault,
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
    <PageContentDefault
      {...mergeStoryDataset(
        args as PageContentProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<PageContentProps & { storyDataset?: string }>>,
        'default',
      )}
    />
  ),
} satisfies Meta<PageContentProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'default',
  },
};

export const FromRouteFallback: Story = {
  name: 'Content: Route fallback',
  args: {
    [STORY_DATASET]: 'fromRouteFallback',
  },
};

export const Editing: Story = {
  name: 'Mode: Editing',
  args: {
    [STORY_DATASET]: 'editing',
  },
};
