// =============================================================================
// Oracle User Expenses — Expense Report API helpers
// =============================================================================

import { oracleClientWithToken } from './oracle-oauth-client';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface OracleExpenseReport {
  ExpenseReportId: string;
  ExpenseReportStatus: string;
  ExpenseStatusCode: string;
  ExpenseReportTotal: number;
  Purpose: string;
}

export interface OracleExpenseReportsResponse {
  items: OracleExpenseReport[];
  totalResults?: number;
  count?: number;
  hasMore?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetUserExpensesOptions {
  limit?: number;
  offset?: number;
  employeeId?: string;
}

// -----------------------------------------------------------------------------
// API methods
// -----------------------------------------------------------------------------

/**
 * Fetch user expense reports from Oracle Financials Cloud.
 *
 * Uses OAuth2 Bearer token authentication (obtained via JWT).
 *
 * @param options - Request options including optional employeeId for OAuth token generation
 *
 * Endpoint:
 * `/fscmRestApi/resources/11.13.18.05/expenseReports?onlyData=true&fields=ExpenseReportId,ExpenseReportStatus,ExpenseStatusCode,ExpenseReportTotal,Purpose`
 */
export async function getUserExpenses(
  options: GetUserExpensesOptions
): Promise<OracleExpenseReportsResponse> {
  const { limit, offset, employeeId } = options;

  const params: Record<string, string> = {
    onlyData: 'true',
    fields: 'ExpenseReportId,ExpenseReportStatus,ExpenseStatusCode,ExpenseReportTotal,Purpose',
  };

  if (limit !== undefined) {
    params.limit = String(limit);
  }
  if (offset !== undefined) {
    params.offset = String(offset);
  }

  return oracleClientWithToken<OracleExpenseReportsResponse>(
    '/fscmRestApi/resources/11.13.18.05/expenseReports',
    { params },
    employeeId
  );
}
