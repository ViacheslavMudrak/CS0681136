import type { Meta, StoryObj } from '@storybook/react';

import DfdTiles from './DfdTiles';
import type { DfdTilesProps } from './DfdTiles.types';

const meta: Meta<typeof DfdTiles> = {
  title: 'Components/DFD Tiles',
  component: DfdTiles,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DfdTiles>;

export const Default: Story = {
  args: {
    fields: {},
    rendering: {
      componentName: 'DfdTiles',
      uid: 'dfd-tiles-mock',
      dataSource: 'Empty',
      params: {},
    },
    params: {},
    stylesSXA: '',
  } as DfdTilesProps,
};
