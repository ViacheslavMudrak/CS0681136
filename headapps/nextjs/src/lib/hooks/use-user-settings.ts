import { useSwrWithAuth } from 'lib/swr';
import { useCallback, useEffect } from 'react';

interface PreferredNewsHomeSite {
  id: string;
}

interface UserSettingsResponse {
  preferredNewsHomeSite: PreferredNewsHomeSite | null;
}

interface UseUserSettingsReturn {
  preferredNewsHomeSiteId: string | null;
  isLoading: boolean;
  savePreferredNewsHomeSite: (siteId: string) => Promise<void>;
}

export const useUserSettings = (): UseUserSettingsReturn => {
  const {
    data: response,
    error,
    isLoading,
    mutate,
    userId,
    sessionStatus,
  } = useSwrWithAuth<UserSettingsResponse>({
    key: '/api/user-settings',
  });

  const preferredNewsHomeSiteId = response?.preferredNewsHomeSite?.id ?? null;

  // Ensure we refetch when session becomes available after initial load
  useEffect(() => {
    if (sessionStatus === 'authenticated' && !isLoading && response === undefined && !error) {
      mutate();
    }
  }, [sessionStatus, isLoading, response, error, mutate]);

  const savePreferredNewsHomeSite = useCallback(
    async (siteId: string) => {
      if (!userId) {
        throw new Error('User must be authenticated to save home site');
      }

      const res = await fetch('/api/user-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredNewsHomeSite: siteId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Failed to save home site');
      }

      await mutate(
        { preferredNewsHomeSite: { id: siteId } },
        { rollbackOnError: true, revalidate: true }
      );
    },
    [userId, mutate]
  );

  return {
    preferredNewsHomeSiteId,
    isLoading,
    savePreferredNewsHomeSite,
  };
};
