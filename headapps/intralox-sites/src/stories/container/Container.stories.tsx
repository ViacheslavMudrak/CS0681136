import type { Meta, StoryObj } from '@storybook/react';

import { Default as ContainerDefault } from 'components/container/Container';
import { createMockPage } from 'src/storybook/mockPage';
import { createMockParams } from 'src/storybook/mockParams';
import { createMockRendering } from 'src/storybook/mockRendering';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

type ContainerProps = React.ComponentProps<typeof ContainerDefault>;

const storyDatasets = {
  default: {
    rendering: createMockRendering({ componentName: 'Container', uid: 'story-ct' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({
      RenderingIdentifier: 'container-1',
      styles: 'container',
      DynamicPlaceholderId: 'main',
      BackgroundImage: '',
    }) as ContainerProps['params'],
  },
  wrapped: {
    rendering: createMockRendering({ componentName: 'Container', uid: 'story-ct-2' }),
    page: createMockPage({ isEditing: false }),
    params: createMockParams({
      RenderingIdentifier: 'container-2',
      styles: 'container bg-surface-muted',
      DynamicPlaceholderId: 'sidebar',
      BackgroundImage: '',
    }) as ContainerProps['params'],
  },
} satisfies Record<string, Partial<ContainerProps>>;

const datasetOrder = ['default', 'wrapped'] as const;

const meta = {
  title: 'XM / Container',
  component: ContainerDefault,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'default',
    ...storyDatasets.default,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
  },
  render: (args) => (
    <ContainerDefault
      {...mergeStoryDataset(
        args as ContainerProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<ContainerProps & { storyDataset?: string }>>,
        'default',
      )}
    />
  ),
} satisfies Meta<ContainerProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    [STORY_DATASET]: 'default',
  },
};

export const Wrapped: Story = {
  name: 'Styles: Wrapped section',
  args: {
    [STORY_DATASET]: 'wrapped',
  },
};
