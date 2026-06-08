import type { Meta, StoryObj } from '@storybook/react';
import type { TextField } from '@sitecore-content-sdk/nextjs';

import { Default as TitleDefault } from 'components/title/Title';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { createMockPageWithLayoutRoute } from 'src/storybook/pageWithLayoutRoute';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const routeTitle: TextField = { value: 'Route-level title' };

type TitleProps = React.ComponentProps<typeof TitleDefault>;

const storyDatasets = {
  fromDatasource: {
    rendering: createMockRendering({ componentName: 'Title', uid: 'story-title' }),
    params: createMockParams({ RenderingIdentifier: 'title-ds', styles: '' }),
    page: createMockPageWithLayoutRoute({ isEditing: false, routeFields: { Title: routeTitle } }),
    fields: {
      data: {
        datasource: {
          url: { path: '/products', siteName: 'story' },
          field: { jsonValue: { value: 'Datasource title' } as TextField },
        },
      },
    },
  },
  fromRouteOnly: {
    rendering: createMockRendering({ componentName: 'Title', uid: 'story-title-2' }),
    params: createMockParams({ RenderingIdentifier: 'title-route', styles: '' }),
    page: createMockPageWithLayoutRoute({ isEditing: false, routeFields: { Title: routeTitle } }),
    fields: {},
  },
  editing: {
    rendering: createMockRendering({ componentName: 'Title', uid: 'story-title-ed' }),
    params: createMockParams({ RenderingIdentifier: 'title-edit', styles: 'bg-surface-muted' }),
    page: createMockPage({ isEditing: true }),
    fields: {
      data: {
        datasource: {
          url: { path: '/', siteName: 'story' },
          field: { jsonValue: { value: 'Editable title' } as TextField },
        },
      },
    },
  },
} satisfies Record<string, Partial<TitleProps>>;

const datasetOrder = ['fromDatasource', 'fromRouteOnly', 'editing'] as const;

const meta = {
  title: 'XM / Title',
  component: TitleDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'fromDatasource',
    ...storyDatasets.fromDatasource,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    fields: { table: { disable: true } },
  },
  render: (args) => (
    <TitleDefault
      {...mergeStoryDataset(
        args as TitleProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<TitleProps & { storyDataset?: string }>>,
        'fromDatasource',
      )}
    />
  ),
} satisfies Meta<TitleProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'fromDatasource',
  },
};

export const FromRouteOnly: Story = {
  name: 'Source: Route only',
  args: {
    [STORY_DATASET]: 'fromRouteOnly',
  },
};

export const Editing: Story = {
  name: 'Mode: Editing',
  args: {
    [STORY_DATASET]: 'editing',
  },
};
