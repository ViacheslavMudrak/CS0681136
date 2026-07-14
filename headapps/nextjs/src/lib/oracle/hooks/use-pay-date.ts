import { useSwrWithAuth } from 'lib/swr';

import type { OraclePayDatesResponse, OraclePayrollTimePeriod } from '../pay-date';

export interface UsePayDateOptions {
  /** PayrollId from pay-information response — pass undefined to defer fetching */
  payrollId?: string;
}

export interface UsePayDateReturn {
  payDate: OraclePayrollTimePeriod | undefined;
  defaultPaydate: string | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

export function usePayDate({ payrollId }: UsePayDateOptions = {}): UsePayDateReturn {
  const { data, isLoading, error } = useSwrWithAuth<OraclePayDatesResponse>({
    key: payrollId ? `/api/oracle/pay-date?payrollId=${payrollId}` : null,
  });

  const payDate = data?.items?.[0];

  return {
    payDate,
    defaultPaydate: payDate?.DefaultPaydate,
    isLoading,
    error,
  };
}
