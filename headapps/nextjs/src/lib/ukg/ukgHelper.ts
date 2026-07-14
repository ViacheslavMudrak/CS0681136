import type {
  UkgScheduleRawResponse,
  UkgPtoRawEmployeeRecord,
  ScheduleResponse,
  ScheduleShift,
  SchedulePayCodeEdit,
  PtoBalanceResponse,
} from 'ts/ukg';

// ---------------------------------------------------------------------------
// Request body builders
// ---------------------------------------------------------------------------

export function buildScheduleRequestBody(
  employeeNumbers: string[],
  startDate: string,
  endDate: string
) {
  return {
    where: {
      employees: {
        employeeRefs: {
          qualifiers: employeeNumbers,
        },
        startDate,
        endDate,
      },
    },
  };
}

export function buildPtoRequestBody(employeeNumbers: string[], startDate: string, endDate: string) {
  return {
    select: ['ACCRUAL_SUMMARY'],
    where: {
      employeeSet: {
        employees: {
          qualifiers: employeeNumbers,
        },
        dateRange: {
          startDate,
          endDate,
        },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Response transforms
// ---------------------------------------------------------------------------

function formatDateTime(dateTimeStr?: string | null): string {
  if (!dateTimeStr) return 'N/A';
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateAndTime(dateStr?: string | null, timeStr?: string | null): string {
  if (!dateStr) return 'N/A';
  const combinedStr = dateStr + 'T' + (timeStr || '00:00:00');
  const date = new Date(combinedStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function transformScheduleResponse(response: UkgScheduleRawResponse): ScheduleResponse {
  const shifts: ScheduleShift[] = (response.shifts || [])
    .slice()
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
    .map((shift) => {
      const orgJobQualifier =
        shift.segments && shift.segments.length > 0 && shift.segments[0].orgJobRef
          ? shift.segments[0].orgJobRef.qualifier
          : 'N/A';
      return {
        startFormatted: formatDateTime(shift.startDateTime),
        endFormatted: formatDateTime(shift.endDateTime),
        positionQualifier: shift.position ? shift.position.qualifier : 'N/A',
        orgJobQualifier,
      };
    });

  const payCodeEdits: SchedulePayCodeEdit[] = (response.payCodeEdits || [])
    .slice()
    .sort((a, b) => {
      const aDateTime = new Date(a.startDate + 'T' + (a.startTime || '00:00:00'));
      const bDateTime = new Date(b.startDate + 'T' + (b.startTime || '00:00:00'));
      return aDateTime.getTime() - bDateTime.getTime();
    })
    .map((edit) => ({
      startFormatted: formatDateAndTime(edit.startDate, edit.startTime),
      endFormatted: formatDateAndTime(edit.endDate, edit.endTime),
      payCodeQualifier: edit.payCodeRef ? edit.payCodeRef.qualifier : 'N/A',
    }));

  return {
    shifts,
    payCodeEdits,
    shiftCount: shifts.length,
    payCodeCount: payCodeEdits.length,
  };
}

export function transformPtoResponse(response: UkgPtoRawEmployeeRecord[]): PtoBalanceResponse {
  let ptoBalanceToday = 0;
  let ptoBalanceMinusTakings = 0;

  if (Array.isArray(response) && response.length > 0) {
    const accrualData = response[0].accrualSummaryData;

    if (Array.isArray(accrualData)) {
      const ptoEntry = accrualData.find(
        (entry) =>
          entry.accrualCode &&
          (entry.accrualCode.name === 'PTO Earned' || entry.accrualCode.name === 'PTO Front Load')
      );

      if (ptoEntry?.dailySummaries && ptoEntry.dailySummaries.length > 0) {
        const dailySummary = ptoEntry.dailySummaries[0];

        if (
          dailySummary.currentBalance &&
          typeof dailySummary.currentBalance.vestedHoursAmount === 'number'
        ) {
          ptoBalanceToday = dailySummary.currentBalance.vestedHoursAmount;
        }

        if (typeof dailySummary.availableBalanceHours === 'number') {
          ptoBalanceMinusTakings = dailySummary.availableBalanceHours;
        }
      }
    }
  }

  return { ptoBalanceToday, ptoBalanceMinusTakings };
}

/**
 * Build request body for shift swaps multi_read endpoint
 */
export function buildShiftSwapRequestBody(
  personNumbers: string[],
  options: {
    startDate?: string;
    endDate?: string;
    statuses?: string[];
    includeShiftDetails?: boolean;
  } = {}
): Record<string, unknown> {
  const { startDate, endDate, statuses, includeShiftDetails = true } = options;

  const body = {
    where: {
      statuses: {
        employees: personNumbers.map((qualifier) => ({ qualifier })),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(statuses && statuses.length > 0 && { statuses }),
      },
    },
    multiReadOptions: {
      includeShiftDetails,
    },
  };

  return body;
}

export function buildMyTimeMetricsRequestBody(options: {
  employeeNumbers: string[];
  symbolicPeriodQualifier?: 'Previous_Payperiod' | 'Current_Payperiod';
  paycodes?: string[];
}): Record<string, unknown> {
  const {
    employeeNumbers,
    symbolicPeriodQualifier = 'Previous_Payperiod',
    paycodes = ['Regular', 'Overtime'],
  } = options;

  return {
    select: ['ACTUAL_TOTALS'],
    where: {
      employeeSet: {
        dateRange: {
          symbolicPeriod: {
            qualifier: symbolicPeriodQualifier,
          },
        },
        employees: {
          qualifiers: employeeNumbers,
        },
      },
    },
    paycodes: {
      qualifiers: paycodes,
    },
    rollupContext: {
      byEmployee: true,
      byPaycode: false,
      byDate: false,
      byDateRange: true,
      byOrg: false,
      byLaborCategory: false,
    },
  };
}

export function buildTeamTimeExceptionsRequestBody(
  employeeNumbers: string[],
  startDate: string,
  endDate: string,
  options: {
    includeJustifications?: boolean;
  } = {}
) {
  const { includeJustifications = false } = options;

  return {
    select: ['EXCEPTIONS'],
    multiReadOptions: {
      exceptionOptions: {
        includeJustifications,
      },
    },
    where: {
      employees: {
        qualifiers: employeeNumbers,
      },
      dateRange: {
        startDate,
        endDate,
      },
    },
  };
}

export type UkgExceptionType = {
  id?: number;
  name?: string;
  displayName?: string;
};

export type UkgException = {
  id?: number;
  reviewed?: boolean;
  exceptionType?: UkgExceptionType;
};

export type UkgTimecardMetricRow = {
  employee?: { qualifier?: string; name?: string; id?: number };
  startDate?: string;
  exceptions?: UkgException[];
};

export type UkgExceptionCategory = {
  id: number;
  name: string;
  description?: string;
  color?: string;
  exceptionTypes?: Array<{ id: number; qualifier: string }>;
};

const EXCLUDED_DISPLAY_NAMES = new Set(['Short Shift', 'Short Break', 'Core Hours Violation']);

export function filterTeamExceptions(rows: UkgTimecardMetricRow[]): UkgTimecardMetricRow[] {
  return rows.map((row) => {
    const filtered = (row.exceptions || []).filter((ex) => {
      if (ex.reviewed === true) return false;

      const display = ex.exceptionType?.displayName;
      if (display && EXCLUDED_DISPLAY_NAMES.has(display)) return false;

      return true;
    });

    return { ...row, exceptions: filtered };
  });
}

export function buildExceptionCategoryLookup(categories: UkgExceptionCategory[]) {
  const lookup = new Map<string, string>();

  for (const cat of categories) {
    for (const t of cat.exceptionTypes || []) {
      lookup.set(t.qualifier, cat.name);
    }
  }

  return lookup;
}

export function buildTeamTimeScorecard(
  rows: UkgTimecardMetricRow[],
  categoryByQualifier: Map<string, string>
) {
  const totals: Record<string, number> = {};
  const byEmployee: Record<string, Record<string, number>> = {};

  for (const row of rows) {
    const emp = row.employee?.qualifier || 'Unknown';
    if (!byEmployee[emp]) byEmployee[emp] = {};

    for (const ex of row.exceptions || []) {
      const qualifier = ex.exceptionType?.displayName || ex.exceptionType?.name || 'Unknown';
      const categoryName = categoryByQualifier.get(qualifier) || 'Uncategorized';

      totals[categoryName] = (totals[categoryName] || 0) + 1;
      byEmployee[emp][categoryName] = (byEmployee[emp][categoryName] || 0) + 1;
    }
  }

  return { totals, byEmployee };
}

/**
 * Get UKG hostname from environment variable
 * Defaults to production if not set
 */
export function getUkgHostname(): string {
  const envHostname = process.env.NEXT_PUBLIC_UKG_HOSTNAME || process.env.UKG_HOSTNAME;

  if (envHostname) {
    return envHostname.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  return 'ascension.mykronos.com';
}

export function getUkgBaseUrl(): string {
  return `https://${getUkgHostname()}`;
}

export function replaceHostnameToken(template: string): string {
  return template.replace(/{hostname}/g, getUkgHostname());
}
