export type MyTimeMetricItem = {
  employeeId?: { qualifier?: string };
  actualTotals?: Array<{
    hoursAmount?: number;
    payPeriodWeek?: number;
    payPeriodNumber?: number;
    signedOff?: boolean;
  }>;
};

export type PtoBalanceItem = {
  employeeId: string;
  ptoBalance: number;
  balanceDate: string;
};

export type PtoRemainingItem = {
  employeeId: string;
  ptoRemaining: number;
  plannedTaking: number;
  balanceDate: string;
};

export type PtoAction = 'balance' | 'remaining';
export type PtoData = PtoBalanceItem[] | PtoRemainingItem[] | null;

export type PayCodeEdit = {
  id?: number;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  employee?: { id?: number; qualifier?: string };
  payCodeRef?: { id?: number; qualifier?: string };
  durationInMinutes?: string;
  durationInTime?: number;
};

export type TimeOffRequest = {
  id?: number;
  creator?: { id?: number; qualifier?: string };
  employee?: { id?: number; qualifier?: string };
  createDateTime?: string;
  requestSubType?: {
    requestType?: { id?: number; name?: string; description?: string };
    symbol?: string;
    id?: number;
    name?: string;
    description?: string;
  };
  currentStatus?: { id?: number; symbolicId?: string; name?: string };
  periods?: Array<{
    id?: number;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    duration?: number;
    payCode?: { id?: number; qualifier?: string };
    symbolicAmount?: { id?: number; qualifier?: string };
  }>;
  approvalPeriods?: Array<unknown>;
  nextValidStatuses?: Array<{ id?: number; symbolicId?: string; name?: string }>;
  requestStatusChanges?: Array<{
    changeDateTime?: string;
    fromStatus?: { id?: number; symbolicId?: string; name?: string };
    toStatus?: { id?: number; symbolicId?: string; name?: string };
    personName?: string;
  }>;
  historical?: boolean;
  position?: { id?: number; qualifier?: string };
  positionDetails?: Array<unknown>;
};

export type ActualTotalItem = {
  uniqueId?: string;
  employee?: { id?: number; qualifier?: string; name?: string };
  hoursAmount?: number;
  wages?: number;
  payPeriodWeek?: number;
  payPeriodNumber?: number;
  signedOff?: boolean;
};

export type ActualTotalsResponse = Array<{
  employeeId?: { id?: number; qualifier?: string; name?: string };
  actualTotals?: ActualTotalItem[];
}>;

export type UkgExceptionCategory = {
  id: number;
  name: string;
  description?: string;
  color?: string;
  exceptionTypes: Array<{ id?: number; qualifier: string }>;
  callToActions?: Array<{ id: number; qualifier: string }>;
};

export type ShiftSwapItem = {
  id?: number;
  employee?: { id?: number; qualifier?: string };
  creator?: { id?: number; qualifier?: string };
  createDateTime?: string;
  startDateTime?: string;
  endDateTime?: string;
  currentStatus?: { id?: number; symbolicId?: string; name?: string };
  swapShift?: {
    offered?: {
      employee?: { id?: number; qualifier?: string };
      shiftDetails?: {
        startDateTime?: string;
        endDateTime?: string;
      };
    };
    requested?: Array<{
      employee?: { id?: number; qualifier?: string };
      shiftDetails?: {
        startDateTime?: string;
        endDateTime?: string;
      };
    }>;
  };
};

export type MyTimeResponse = {
  spanEndDate: string | null;
  metrics: Json;
};

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
export type JsonObject = { [key: string]: Json };
