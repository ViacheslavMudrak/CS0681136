// =============================================================================
// Oracle Pay Information — Payroll Relationships API helpers
// =============================================================================

import { oracleClientWithServiceToken } from './oracle-oauth-client';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface AssignedPayroll {
  AssignedPayrollId: string;
  PayrollId: string;
  StartDate: string;
  EndDate: string;
  TimeCardRequired: string;
  OverridingPeriodId: string | null;
  EffectiveStartDate: string;
  EffectiveEndDate: string;
  Lsed: string | null;
  PayrollName: string;
}

export interface AssignedPayrolls {
  assignedPayrolls: AssignedPayroll[];
}

export interface PayrollAssignments {
  payrollAssignments: AssignedPayrolls[];
}

export interface OraclePayrollRelationshipsResponse {
  items: PayrollAssignments[];
  count?: number;
  hasMore?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetPayInformationOptions {
  personNumber: string;
  effectiveDate?: string;
  limit?: number;
  offset?: number;
}

// -----------------------------------------------------------------------------
// API methods
// -----------------------------------------------------------------------------

/**
 * Fetch payroll relationships from Oracle HCM Cloud.
 *
 * Uses the service-level OAuth2 Bearer token (Client Credentials grant via
 * `ORACLE_CLIENT_ID` / `ORACLE_CLIENT_SECRET`).
 *
 * Endpoint:
 * `/hcmRestApi/resources/11.13.18.05/payrollRelationships?q=PersonNumber='{personNumber}'&onlyData=true&effectiveDate={date}&fields=payrollAssignments:assignedPayrolls:PayrollName`
 */
export async function getPayInformation(
  options: GetPayInformationOptions
): Promise<OraclePayrollRelationshipsResponse> {
  const { personNumber, effectiveDate, limit, offset } = options;

  const params: Record<string, string> = {
    q: `PersonNumber='${personNumber}'`,
    onlyData: 'true',
    effectiveDate: effectiveDate ?? new Date().toISOString().split('T')[0],
    fields: 'payrollAssignments:assignedPayrolls:PayrollName',
  };

  if (limit !== undefined) {
    params.limit = String(limit);
  }
  if (offset !== undefined) {
    params.offset = String(offset);
  }

  return oracleClientWithServiceToken<OraclePayrollRelationshipsResponse>(
    '/hcmRestApi/resources/11.13.18.05/payrollRelationships',
    { params }
  );
}
