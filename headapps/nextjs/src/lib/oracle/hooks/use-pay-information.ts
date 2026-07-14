import { useSwrWithAuth } from 'lib/swr';

import type { OraclePayrollRelationshipsResponse } from '../pay-information';

export interface UsePayInformationReturn {
  payInformation: OraclePayrollRelationshipsResponse | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

export function usePayInformation(): UsePayInformationReturn {
  const apiPath = '/api/oracle/pay-information';

  const { data, isLoading, error } = useSwrWithAuth<OraclePayrollRelationshipsResponse>({
    key: apiPath,
  });

  return {
    payInformation: data,
    isLoading,
    error,
  };
}
