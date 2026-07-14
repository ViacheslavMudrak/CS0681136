import { ComponentProps } from 'lib/component-props';
import { DfdTileStatus } from 'ts/dfd-tile-status';

import { Field, LinkField } from '@sitecore-content-sdk/nextjs';

export type ExpenseItem = {
  id?: string;
  title?: string;
  amount?: string;
  status?: string;
  statusIconName?: string;
  statusCssModifier?: string;
  deepLink?: string;
};

type DfdTileExpensesFields = {
  tileTitle?: Field<string>;
  tileLabel1?: Field<string>;
  tileLabel2?: Field<string>;
  maxItemCount?: Field<number>;
  expenseDeepLink?: Field<string>;
  tileStatus?: DfdTileStatus[];
  viewAllDeeplink?: LinkField;
};

export type DfdTileExpensesProps = ComponentProps & {
  fields: DfdTileExpensesFields;
};

export const DfdTileExpensesStatics = {
  pageCountLabel: 'Showing {current} of {total}',
  showAmountLabel: 'Show TTL',
};
