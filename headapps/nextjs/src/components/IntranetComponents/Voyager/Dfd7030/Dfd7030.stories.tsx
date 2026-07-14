import type { Meta, StoryObj } from '@storybook/react';
import Dfd7030 from './Dfd7030';
import type { Dfd7030Props } from './Dfd7030.types';

const meta: Meta<typeof Dfd7030> = {
  title: 'Components/DFD7030',
  component: Dfd7030,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Dfd7030>;

export const Default: Story = {
  args: {
    rendering: {
      componentName: 'Dfd7030',
      dataSource: 'mock-dfd7030',
      uid: 'dfd7030-1',
      params: {},
    },
    params: {},
    stylesSXA: '',
  } as Dfd7030Props,
};
