// ---------------------------------------------------------------------------
// UKG Authentication
// ---------------------------------------------------------------------------

export interface UkgTokenResponse {
  access_token: string;
  refresh_token: string;
  id_token: string;
  scope: string;
  token_type: string; // "Bearer"
  expires_in: number;
}

// ---------------------------------------------------------------------------
// UKG Schedule — Raw API response types (from /api/v1/scheduling/schedule/multi_read)
// ---------------------------------------------------------------------------

export interface UkgRef {
  id: number;
  qualifier: string;
}

interface UkgShiftSegment {
  id: number;
  segmentTypeRef?: UkgRef;
  startDateTime: string;
  endDateTime: string;
  orgJobRef?: UkgRef;
  type?: string;
}

export interface UkgRawShift {
  id: number;
  startDateTime: string;
  endDateTime: string;
  label?: string;
  employee?: UkgRef;
  position?: UkgRef;
  segments?: UkgShiftSegment[];
}

export interface UkgRawPayCodeEdit {
  id: number;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  employee?: UkgRef;
  position?: UkgRef;
  payCodeRef?: UkgRef;
}

export interface UkgScheduleRawResponse {
  shifts?: UkgRawShift[];
  payCodeEdits?: UkgRawPayCodeEdit[];
}

// ---------------------------------------------------------------------------
// UKG Schedule — Transformed response types
// ---------------------------------------------------------------------------

export interface ScheduleShift {
  startFormatted: string;
  endFormatted: string;
  positionQualifier: string;
  orgJobQualifier: string;
}

export interface SchedulePayCodeEdit {
  startFormatted: string;
  endFormatted: string;
  payCodeQualifier: string;
}

export interface ScheduleResponse {
  shifts: ScheduleShift[];
  payCodeEdits: SchedulePayCodeEdit[];
  shiftCount: number;
  payCodeCount: number;
}

// ---------------------------------------------------------------------------
// UKG PTO Balance — Raw API response types (from /api/v1/timekeeping/timecard_metrics/multi_read)
// ---------------------------------------------------------------------------

interface UkgAccrualCode {
  id: number;
  name: string;
  shortName?: string;
  hoursPerDay?: number;
}

interface UkgBalanceDetail {
  balanceDate?: string;
  vestedHoursAmount: number;
  probationHoursAmount?: number;
}

interface UkgDailySummary {
  balanceDate?: string;
  currentBalance?: UkgBalanceDetail;
  availableBalanceHours?: number;
}

export interface UkgAccrualSummary {
  uniqueId?: string;
  accrualCode?: UkgAccrualCode;
  dailySummaries?: UkgDailySummary[];
}

export interface UkgPtoRawEmployeeRecord {
  employeeId?: UkgRef & { name?: string };
  accrualSummaryData?: UkgAccrualSummary[];
}

// ---------------------------------------------------------------------------
// UKG PTO Balance — Transformed response types
// ---------------------------------------------------------------------------

export interface PtoBalanceResponse {
  ptoBalanceToday: number;
  ptoBalanceMinusTakings: number;
}
