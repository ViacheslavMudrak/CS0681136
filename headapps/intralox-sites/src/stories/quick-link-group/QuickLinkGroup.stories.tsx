import type { Meta, StoryObj } from '@storybook/react';

import type { QuickLinkGroupFields } from 'components/quick-link-group/QuickLinkGroup.type';
import { QuickLinkGroupStoryPreview } from 'src/storybook/async-roots/QuickLinkGroupStoryPreview';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams, type StoryMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const groupFields: QuickLinkGroupFields = {
  QuickLinkCount: {
    fields: { Value: { value: '3' } },
  },
  QuickLinkItems: [
    {
      id: 'ql-1',
      fields: {
        Title: { value: 'Products' },
        Description: { value: 'Belting and conveyance' },
        Icon: { fields: { Value: { value: 'phone' } } },
      },
    },
    {
      id: 'ql-2',
      fields: {
        Title: { value: 'Services' },
        Description: { value: 'Support and consulting' },
        Icon: { fields: { Value: { value: 'mail' } } },
      },
    },
  ],
};

function storyArgs(overrides: {
  fields?: QuickLinkGroupFields;
  isEditing?: boolean;
  params?: StoryMockParams;
} = {}) {
  return {
    rendering: createMockRendering({ componentName: 'QuickLinkGroup', uid: 'story-qlg' }),
    page: createMockPage({ isEditing: overrides.isEditing ?? false }),
    params:
      overrides.params ??
      createMockParams({
        RenderingIdentifier: 'quick-link-group-story',
        styles: '',
      }),
    fields: overrides.fields ?? groupFields,
  };
}

type QlgProps = React.ComponentProps<typeof QuickLinkGroupStoryPreview>;

const pressInquiriesFields: QuickLinkGroupFields = {
  QuickLinkItems: [],
  Headline: { value: 'Press Inquiries' },
  Description: {
    value:
      '<p>For press inquiries, please contact Brandon Campo at&nbsp;<a href="mailto:Brandon.Campo@Intralox.com?subject=Press%20Inquiry" title="Press Inquiry">Brandon.Campo@Intralox.com</a>.</p>',
  },
};

const storyDatasets = {
  default: storyArgs(),
  editingEmptyList: storyArgs({
    isEditing: true,
    fields: { QuickLinkItems: [] },
  }),
  asidePressInquiries: storyArgs({
    fields: pressInquiriesFields,
    params: createMockParams({
      RenderingIdentifier: 'quick-link-group-story',
      styles: '',
      Styles: { Value: { value: 'press-inquiries-aside' } },
    }),
  }),
} satisfies Record<string, QlgProps>;

const datasetOrder = ['default', 'editingEmptyList', 'asidePressInquiries'] as const;

const meta = {
  title: 'XM / Quick Link Group',
  component: QuickLinkGroupStoryPreview,
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
    <QuickLinkGroupStoryPreview
      {...mergeStoryDataset(
        args as QlgProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<QlgProps & { storyDataset?: string }>>,
        'default',
      )}
    />
  ),
} satisfies Meta<QlgProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'default',
  },
};

export const EditingEmptyList: Story = {
  name: 'Mode: Editing, no tiles (aside fields)',
  args: {
    [STORY_DATASET]: 'editingEmptyList',
  },
};

export const AsidePressInquiries: Story = {
  name: 'Aside: Press Inquiries',
  args: {
    [STORY_DATASET]: 'asidePressInquiries',
  },
};
