import type { Meta, StoryObj } from '@storybook/react';

import DfdExpenses from './DfdTileExpenses';
import type { DfdTileExpensesProps } from './DfdTileExpenses.types';

const meta: Meta<typeof DfdExpenses> = {
  title: 'Components/DfdExpenses',
  component: DfdExpenses,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<DfdTileExpensesProps>;

const mockProps: DfdTileExpensesProps = {
  rendering: {
    componentName: 'DfdExpenses',
    uid: 'dfd-expenses-story',
    dataSource: 'Empty',
    params: {},
  },

  params: {},

  fields: {
    tileTitle: {
      value: 'Expenses',
    },
    tileLabel1: {
      value: 'Approved Expense Reports',
    },
    tileLabel2: {
      value: 'All Expense Reports',
    },
    maxItemCount: {
      value: 3,
    },
    expenseDeepLink: {
      value: 'https://ascension-financials.cloud.oracle.com',
    },
    viewAllDeeplink: {
      value: {
        href: 'https://ascension-financials.cloud.oracle.com',
        text: 'View All',
      },
    },
    tileStatus: [],
  },
};

export const Default: Story = {
  args: mockProps,
};
