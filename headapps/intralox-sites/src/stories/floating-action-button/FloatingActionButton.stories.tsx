import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { FloatingActionButton } from 'components/floating-action-button/FloatingActionButton';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

type FabProps = React.ComponentProps<typeof FloatingActionButton>;

const fabStoryIconOptions = [
  'icon-call',
  'icon-message-square',
  'icon-mail',
] as const;

type FabStoryIcon = (typeof fabStoryIconOptions)[number];

const fabStoryIconCssClass: Record<FabStoryIcon, { CssClass: { value: string } }> = {
  'icon-call': { CssClass: { value: 'fa-solid fa-phone-volume' } },
  'icon-message-square': { CssClass: { value: 'fa-solid fa-comment-dots' } },
  'icon-mail': { CssClass: { value: 'fa-solid fa-envelope' } },
};

const storyDatasets = {
  hiddenWhenOff: {
    showFloatingButton: false,
    floatingButton: undefined,
    isEditing: false,
  },
  editingMisconfigured: {
    showFloatingButton: true,
    floatingButton: undefined,
    isEditing: true,
  },
  withPhoneLink: {
    showFloatingButton: true,
    isEditing: false,
    floatingButton: {
      id: 'fab-1',
      displayName: 'Call sales',
      fields: {
        Heading: { value: 'Talk to sales' },
        Text: { value: 'We respond within one business day.' },
        Icon: {
          fields: {
            CssClass: { value: 'fa-solid fa-phone-volume' },
          },
        },
        Link: { value: { href: 'tel:+15555550100', text: 'Call now' } },
      },
    },
  },
} satisfies Record<string, Partial<FabProps>>;

const datasetOrder = ['withPhoneLink', 'hiddenWhenOff', 'editingMisconfigured'] as const;

type FabStoryArgs = FabProps & {
  storyDataset?: (typeof datasetOrder)[number];
  icon?: FabStoryIcon;
};

const meta = {
  title: 'XM / Floating Action Button',
  component: FloatingActionButton,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'withPhoneLink',
    icon: 'icon-call' satisfies FabStoryIcon,
    ...storyDatasets.withPhoneLink,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
    icon: {
      name: 'Icon',
      control: 'inline-radio',
      options: [...fabStoryIconOptions],
    },
    floatingButton: { table: { disable: true } },
  },
  render: (args) => {
    const { icon = 'icon-call', ...restForMerge } = args as FabStoryArgs;
    const merged = mergeStoryDataset(
      restForMerge as FabProps & { storyDataset?: string },
      storyDatasets as Record<string, Partial<FabProps & { storyDataset?: string }>>,
      'withPhoneLink',
    );
    const fb = merged.floatingButton;
    const patched: FabProps =
      fb?.fields != null
        ? {
            ...merged,
            floatingButton: {
              ...fb,
              fields: {
                ...fb.fields,
                Icon: {
                  ...fb.fields.Icon,
                  id: fb.fields.Icon?.id ?? 'fab-icon-story',
                  fields: {
                    ...fb.fields.Icon?.fields,
                    ...fabStoryIconCssClass[icon],
                  },
                },
              },
            },
          }
        : merged;
    return <FloatingActionButton {...patched} />;
  },
} satisfies Meta<FabStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'withPhoneLink',
  },
};

export const HiddenWhenOff: Story = {
  name: 'Visibility: Hidden when off',
  args: {
    [STORY_DATASET]: 'hiddenWhenOff',
  },
};

export const EditingMisconfigured: Story = {
  name: 'Mode: Editing, Config: Misconfigured',
  args: {
    [STORY_DATASET]: 'editingMisconfigured',
  },
};
