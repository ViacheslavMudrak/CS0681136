import type { Meta, StoryObj } from '@storybook/react';
import type { LinkField, TextField } from '@sitecore-content-sdk/nextjs';

import { Default as LinkListDefault } from 'components/link-list/LinkList';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const datasource = {
  field: {
    title: { value: 'Quick links' } as TextField,
  },
  children: {
    results: [
      { field: { link: { value: { href: '/one', text: 'First link' } } as LinkField } },
      { field: { link: { value: { href: '/two', text: 'Second link' } } as LinkField } },
    ],
  },
};

type LinkListProps = React.ComponentProps<typeof LinkListDefault>;

const storyDatasets = {
  withLinks: {
    rendering: createMockRendering({ componentName: 'LinkList', uid: 'story-ll' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'link-list-1', styles: '' }),
    fields: { data: { datasource } },
  },
  missingDatasource: {
    rendering: createMockRendering({ componentName: 'LinkList', uid: 'story-ll-m' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({ RenderingIdentifier: 'link-list-m', styles: '' }),
    fields: { data: { datasource: undefined as never } },
  },
} satisfies Record<string, Partial<LinkListProps>>;

const datasetOrder = ['withLinks', 'missingDatasource'] as const;

const meta = {
  title: 'XM / Link List',
  component: LinkListDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'withLinks',
    ...storyDatasets.withLinks,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    fields: { table: { disable: true } },
  },
  render: (args) => (
    <LinkListDefault
      {...mergeStoryDataset(
        args as LinkListProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<LinkListProps & { storyDataset?: string }>>,
        'withLinks',
      )}
    />
  ),
} satisfies Meta<LinkListProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'withLinks',
  },
};

export const MissingDatasource: Story = {
  name: 'Datasource: Missing',
  args: {
    [STORY_DATASET]: 'missingDatasource',
  },
};
