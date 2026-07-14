// ---------------------------------------------------------------------------
// Public types — UKG endpoint identifier
// ---------------------------------------------------------------------------

export type UkgEndpoint =
  | 'my-time'
  | 'pto'
  | 'schedule'
  | 'team-time'
  | 'action-item'
  | 'shiftswaps';

// ---------------------------------------------------------------------------
// Request body types (passed in by each route handler)
// ---------------------------------------------------------------------------

export interface PtoRequestBody {
  action?: 'balance' | 'remaining' | 'next-pto' | 'requests';
  employeeNumbers: string[];
  startDate?: string;
  endDate?: string;
  baseUrl?: string;
}

export interface MyTimeRequestBody {
  employeeNumbers: string[];
  symbolicPeriodQualifier?: 'Previous_Payperiod' | 'Current_Payperiod';
  paycodes?: string[];
  baseUrl?: string;
}

export interface ScheduleRequestBody {
  employeeNumbers: string[];
  startDate: string;
  endDate: string;
  baseUrl?: string;
}

export interface TeamTimeRequestBody {
  action?: 'exceptions' | 'scorecard' | 'team-exceptions';
  employeeNumbers?: string[];
  paycodes?: string[];
  baseUrl?: string;
}

export interface ActionItemRequestBody {
  employeeNumber: string;
  startDate: string;
  endDate: string;
  baseUrl?: string;
}

export interface ShiftswapsRequestBody {
  action?: 'list' | 'approved' | 'denied';
  personNumbers: string[];
  startDate: string;
  endDate: string;
  includeShiftDetails?: boolean;
  baseUrl?: string;
}

// ---------------------------------------------------------------------------
// Internal UKG response types (used by the factory)
// ---------------------------------------------------------------------------

export type AccrualSummaryItem = {
  accrualCode?: { id?: number; name?: string; shortName?: string };
  dailySummaries?: Array<{
    balanceDate?: string;
    currentBalance?: { vestedHoursAmount?: number };
    availableBalanceHours?: number;
    plannedTakingHours?: number;
  }>;
};

export type AccrualResponse = Array<{
  employeeId?: { id?: number; qualifier?: string; name?: string };
  accrualSummaryData?: AccrualSummaryItem[];
}>;

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

export type PtoScheduleResponse = {
  shifts?: unknown[];
  payCodeEdits?: PayCodeEdit[];
  [key: string]: unknown;
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
  [key: string]: unknown;
};

export type ActualTotalsResponse = Array<{
  employeeId?: { id?: number; qualifier?: string; name?: string };
  actualTotals?: unknown[];
}>;

export interface PTO_RequestBody {
  select: string[];
  where: {
    employeeSet: {
      employees: {
        qualifiers: string[];
      };
      dateRange: {
        startDate: string;
        endDate: string;
      };
    };
  };
}
