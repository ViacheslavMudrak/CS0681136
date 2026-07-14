import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { IconItem } from 'ts/custom-link';

export type DfdTileMyTeamTimeFields = {
  tileTitle?: { jsonValue: Field<string> };
  tileLabel?: { jsonValue: Field<string> };
  otherDeepLink?: { jsonValue: LinkField };
  tileIcon?: { jsonValue?: IconItem };
};

export interface TeamTimeData {
  mustFix: number;
  needsReview: number;
  miscellaneous: number;
}

export type DfdTileMyTeamTimeProps = ComponentProps & {
  fields: {
    data: {
      datasource: DfdTileMyTeamTimeFields;
    };
  };
};

// UKG API Types
export type UkgExceptionType = {
  id?: number;
  qualifier: string;
};

export type UkgExceptionCategory = {
  id: number;
  name: string;
  description?: string;
  color?: string;
  exceptionTypes: UkgExceptionType[];
  callToActions?: Array<{ id: number; qualifier: string }>;
};

export type UkgException = {
  employee?: {
    id?: number;
    qualifier?: string;
    name?: string;
  };
  startDateTime?: string;
  endDateTime?: string;
  applyDate?: string;
  id?: number;
  exceptionType?: {
    id?: number;
    name?: string;
    description?: string;
    displayName?: string;
    category?: string;
  };
  reviewed?: boolean;
  isExcusedAbsence?: boolean;
  isUnExcusedAbsence?: boolean;
};

export type UkgEmployeeExceptions = {
  employee?: {
    id?: number;
    qualifier?: string;
    name?: string;
  };
  startDate?: string;
  exceptions?: UkgException[];
};

export type UkgTeamTimeApiResponse = UkgEmployeeExceptions[];

export const DFDTeamTileDictionary = {
  MustFix: 'Must Fix',
  NeedsReview: 'Needs Review',
  Miscellaneous: 'Miscellaneous',
};
