import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { IconItem } from 'ts/custom-link';

export type DfdTileMyTimeFields = {
  tileTitle?: { jsonValue: Field<string> };
  tileLabel?: { jsonValue: Field<string> };
  tileSubLabel?: { jsonValue: Field<string> };
  tileDeeplink?: { jsonValue: LinkField };
  tileIcon?: { jsonValue?: IconItem };
  informationalText?: { jsonValue: Field<string> };
};

export interface MyTimeData {
  hoursSubmitted: string;
  timecarddDue: string;
}

export type DfdTileMyTimeProps = ComponentProps & {
  fields: {
    data: {
      datasource: DfdTileMyTimeFields;
    };
  };
};

export type UkgEmployeeId = {
  qualifier?: string;
};

export type UkgActualTotal = {
  hoursAmount?: number;
};

export type UkgMetric = {
  employeeId?: UkgEmployeeId;
  actualTotals?: UkgActualTotal[];
};

export type UkgMyTimeApiResponse = {
  spanEndDate?: string;
  metrics?: UkgMetric[];
};
