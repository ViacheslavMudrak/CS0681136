// =============================================================================
// Oracle Pay Date — Payroll Time Periods LOV API helpers
// =============================================================================

import { oracleClientWithServiceToken } from './oracle-oauth-client';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface OraclePayrollTimePeriod {
  DefaultPaydate: string;
  PayrollName: string;
  PayrollId: string;
}

export interface OraclePayDatesResponse {
  items: OraclePayrollTimePeriod[];
  count?: number;
  hasMore?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetPayDateOptions {
  payrollId: string;
  date?: string;
  limit?: number;
  offset?: number;
}

// -----------------------------------------------------------------------------
// API methods
// -----------------------------------------------------------------------------

/**
 * Fetch payroll time periods LOV from Oracle HCM Cloud.
 *
 * Uses the service-level OAuth2 Bearer token (Client Credentials grant via
 * `ORACLE_CLIENT_ID` / `ORACLE_CLIENT_SECRET`).
 *
 * Endpoint:
 * `/hcmRestApi/resources/11.13.18.05/payrollTimePeriodsLOV?q=StartDate<='{date}';EndDate>='{date}';PeriodCategory=E;PayrollId={payrollId}&onlyData=true&fields=DefaultPaydate,PayrollName,PayrollId`
 */
export async function getPayDate(options: GetPayDateOptions): Promise<OraclePayDatesResponse> {
  const { payrollId, date, limit, offset } = options;

  const currentDate = date ?? new Date().toISOString().split('T')[0];

  const params: Record<string, string> = {
    q: `StartDate<='${currentDate}';EndDate>='${currentDate}';PeriodCategory=E;PayrollId=${payrollId}`,
    onlyData: 'true',
    fields: 'DefaultPaydate,PayrollName,PayrollId',
  };

  if (limit !== undefined) {
    params.limit = String(limit);
  }
  if (offset !== undefined) {
    params.offset = String(offset);
  }

  return oracleClientWithServiceToken<OraclePayDatesResponse>(
    '/hcmRestApi/resources/11.13.18.05/payrollTimePeriodsLOV',
    { params }
  );
}
