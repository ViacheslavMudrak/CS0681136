import type { Meta, StoryObj } from '@storybook/react';

import { Default as LocalNavigationDefault } from 'components/local-navigation/LocalNavigation';
import type { LocalNavigationProps } from 'components/local-navigation/LocalNavigation.type';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

function storyPage(isEditing: boolean): LocalNavigationProps['page'] {
  return {
    mode: { isEditing },
    layout: {
      sitecore: {
        route: {
          fields: { ShowSubNavigation: { value: true } },
          itemId: 'story-item',
        },
      },
    },
  } as LocalNavigationProps['page'];
}

/** Primary + secondary rows with nested tertiary links (mirrors typical Sitecore treelist output). */
const linkFields = {
  PrimaryLinkList: [
    {
      id: 'p-food',
      displayName: 'Food processing',
      fields: {
        Link: { value: { href: '/solutions/food', text: 'Food processing' } },
      },
    },
    {
      id: 'p-logistics',
      displayName: 'Logistics',
      fields: {
        Link: { value: { href: '/solutions/logistics', text: 'Logistics' } },
        ChildLinks: [
          {
            id: 'p-log-ware',
            fields: {
              Link: { value: { href: '/solutions/logistics/warehousing', text: 'Warehousing' } },
            },
          },
          {
            id: 'p-log-sort',
            fields: {
              Link: { value: { href: '/solutions/logistics/sortation', text: 'Sortation' } },
            },
          },
        ],
      },
    },
    {
      id: 'p-industrial',
      displayName: 'Industrial',
      fields: {
        Link: { value: { href: '/solutions/industrial', text: 'Industrial' } },
      },
    },
  ],
  SecondaryLinkList: [
    {
      id: 's-downloads',
      fields: { Link: { value: { href: '/downloads', text: 'Downloads' } } },
    },
    {
      id: 's-support',
      fields: { Link: { value: { href: '/support', text: 'Support' } } },
    },
  ],
};

type LocalNavProps = React.ComponentProps<typeof LocalNavigationDefault>;

const storyDatasets = {
  visitor: {
    rendering: createMockRendering({ componentName: 'LocalNavigation', uid: 'story-ln-v' }),
    page: storyPage(false),
    params: createMockParams({ RenderingIdentifier: 'local-nav', styles: '' }),
    fields: linkFields,
  },
  editing: {
    rendering: createMockRendering({ componentName: 'LocalNavigation', uid: 'story-ln' }),
    page: storyPage(true),
    params: createMockParams({ RenderingIdentifier: 'local-nav-ed', styles: '' }),
    fields: linkFields,
  },
} satisfies Record<string, Partial<LocalNavProps>>;

const datasetOrder = ['visitor', 'editing'] as const;

const meta = {
  title: 'XM / Local Navigation',
  component: LocalNavigationDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'visitor',
    ...storyDatasets.visitor,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    fields: { table: { disable: true } },
  },
  render: (args) => (
    <LocalNavigationDefault
      {...mergeStoryDataset(
        args as LocalNavProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<LocalNavProps & { storyDataset?: string }>>,
        'visitor',
      )}
    />
  ),
} satisfies Meta<LocalNavProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Editing mode renders chrome even when live visibility gates would hide the strip. */
export const Default: Story = {
  args: {
    [STORY_DATASET]: 'visitor',
  },
};

export const Editing: Story = {
  name: 'Mode: Editing',
  args: {
    [STORY_DATASET]: 'editing',
  },
};
