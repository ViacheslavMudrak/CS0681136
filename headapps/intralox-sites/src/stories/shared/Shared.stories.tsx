import type { Meta, StoryObj } from '@storybook/react';

import { Container } from 'components/shared/BaseContainer';
import { STORY_DATASET, mergeStoryDataset, storyDatasetArgType } from 'src/storybook/storyDataset';

const child = (
  <p className="text-ink-secondary font-roboto">
    Shared `Container` — max-width and horizontal padding mirror page layout shells.
  </p>
);

type ContainerProps = React.ComponentProps<typeof Container>;

const storyDatasets = {
  defaultWidth: {
    width: 'default' as const,
    children: child,
  },
  narrowWidth: {
    width: 'sm' as const,
    children: child,
  },
} satisfies Record<string, Partial<ContainerProps>>;

const datasetOrder = ['defaultWidth', 'narrowWidth'] as const;

const meta = {
  title: 'XM / Shared / Base Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'defaultWidth',
    ...storyDatasets.defaultWidth,
  },
  argTypes: {
    ...storyDatasetArgType(datasetOrder),
  },
  render: (args) => (
    <Container
      {...mergeStoryDataset(
        args as ContainerProps & { storyDataset?: string },
        storyDatasets as Record<string, Partial<ContainerProps & { storyDataset?: string }>>,
        'defaultWidth',
      )}
    />
  ),
} satisfies Meta<ContainerProps & { storyDataset?: (typeof datasetOrder)[number] }>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Catalog entry for shared layout primitives (`BaseContainer` / `Section` patterns). */
export const Default: Story = {
  args: {
    [STORY_DATASET]: 'defaultWidth',
  },
};

export const BaseContainerNarrow: Story = {
  name: 'Width: Narrow',
  args: {
    [STORY_DATASET]: 'narrowWidth',
  },
};
