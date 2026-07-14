import { useSwrWithAuth } from 'lib/swr';

import type { OracleExpenseReport, OracleExpenseReportsResponse } from '../user-expenses';

export interface UseUserExpensesReturn {
  expenses: OracleExpenseReport[];
  isLoading: boolean;
  error: Error | undefined;
}

export function useUserExpenses(): UseUserExpensesReturn {
  const apiPath = '/api/oracle/user-expenses';

  const { data, isLoading, error } = useSwrWithAuth<OracleExpenseReportsResponse>({
    key: apiPath,
  });
  return {
    expenses: data?.items ?? [],
    isLoading,
    error,
  };
}
