import { ComponentProps } from 'lib/component-props';

import { Field, LinkField } from '@sitecore-content-sdk/nextjs';

import { BasedfdTileFields } from '../DfdTiles/DfdTiles.types';

type DfdTilePayInformationFields = BasedfdTileFields & {
  tileLabel?: Field<string>;
  paystubsDeeplink: LinkField;
  payrollCalendarDeeplink: LinkField;
  manageDirectDepositDeeplink: LinkField;
  w2FormsDeeplink: LinkField;
  payIncreasesDeeplink: LinkField;
};

export type DfdTilePayInformationProps = ComponentProps & {
  fields: DfdTilePayInformationFields;
};
