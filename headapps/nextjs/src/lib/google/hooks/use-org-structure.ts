import { useSwrWithAuth } from 'lib/swr';
import { useCallback } from 'react';

import type { OrgTreeResponse } from 'ts/google';

const API_URL = '/api/google/org-structure';

interface UseOrgStructureReturn {
  data: OrgTreeResponse | undefined;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export type OrgSearchMode = 'root' | 'full-tree';

/**
 * Fetches the org structure tree for a given email.
 * Pass null to disable fetching (e.g. when input is empty).
 * @param mode 'root' builds downward from the email; 'full-tree' walks up to the top-most person.
 */
export const useOrgStructure = (
  email: string | null,
  mode: OrgSearchMode = 'root'
): UseOrgStructureReturn => {
  const params = email
    ? `email=${encodeURIComponent(email)}${mode === 'full-tree' ? '&mode=full-tree' : ''}`
    : null;
  const key = params ? `${API_URL}?${params}` : null;

  const { data, error, isLoading, mutate } = useSwrWithAuth<OrgTreeResponse>({
    key: (userId) => (userId && key ? key : null),
    swrConfig: {
      revalidateOnFocus: false,
      dedupingInterval: 60_000, // 1 minute — tree is expensive to build
    },
  });

  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    data,
    loading: isLoading,
    error: error ?? null,
    refresh,
  };
};
