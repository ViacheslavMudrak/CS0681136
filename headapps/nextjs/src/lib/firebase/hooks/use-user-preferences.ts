import { useSwrWithAuth } from 'lib/swr';
import { useCallback, useEffect } from 'react';

interface UserPreferencesResponse {
  newsFeedTags: string[] | null;
  preferredNewsHomeSite: string | null;
  preferredNewsSupplementalSites: string[] | null;
}

interface UseUserPreferencesReturn {
  newsFeedTags: string[] | null;
  preferredNewsHomeSite: string | null;
  preferredNewsSupplementalSites: string[] | null;
  saveNewsFeedTags: (tags: string[]) => Promise<void>;
  savePreferredNewsHomeSite: (siteId: string) => Promise<void>;
  savePreferredNewsSupplementalSites: (sites: string[]) => Promise<void>;
}

/**
 * Hook for managing user news preferences (news feed tags + preferred home site + preferred news sites)
 * with Firestore sync using SWR. SWR handles caching, revalidation, and loading
 * states automatically. State is shared across all components using this hook.
 *
 * @example
 * const { newsFeedTags, preferredHomeSite, preferredNewsSites, saveNewsFeedTags, savePreferredHomeSite, savePreferredNewsSites } = useUserPreferences();
 *
 * await saveNewsFeedTags(['tag1', 'tag2']);
 * await savePreferredHomeSite('site-id-123');
 * await savePreferredNewsSites(['site1', 'site2']);
 */
export const useUserPreferences = (): UseUserPreferencesReturn => {
  const {
    data: response,
    error,
    isLoading,
    mutate,
    userId,
    sessionStatus,
  } = useSwrWithAuth<UserPreferencesResponse>({
    key: '/api/user-preferences',
  });

  const newsFeedTags = response?.newsFeedTags ?? null;
  const preferredNewsHomeSite = response?.preferredNewsHomeSite ?? null;
  const preferredNewsSupplementalSites = response?.preferredNewsSupplementalSites ?? null;

  // Ensure we refetch when session becomes available after initial load
  useEffect(() => {
    if (sessionStatus === 'authenticated' && !isLoading && response === undefined && !error) {
      mutate();
    }
  }, [sessionStatus, isLoading, response, error, mutate]);

  const saveNewsFeedTags = useCallback(
    async (tags: string[]) => {
      if (!userId) {
        throw new Error('User must be authenticated to save tags');
      }

      const dedupedTags = Array.from(new Set(tags));

      const res = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsFeedTags: dedupedTags }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Failed to save tags');
      }

      await mutate(
        {
          ...response,
          newsFeedTags: dedupedTags,
          preferredNewsHomeSite: response?.preferredNewsHomeSite ?? null,
          preferredNewsSupplementalSites: response?.preferredNewsSupplementalSites ?? null,
        },
        { rollbackOnError: true, revalidate: true }
      );
    },
    [userId, mutate, response]
  );

  const savePreferredNewsHomeSite = useCallback(
    async (siteId: string) => {
      if (!userId) {
        throw new Error('User must be authenticated to save home site');
      }

      const res = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredNewsHomeSite: siteId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Failed to save home site');
      }

      await mutate(
        {
          ...response,
          newsFeedTags: response?.newsFeedTags ?? null,
          preferredNewsHomeSite: siteId,
          preferredNewsSupplementalSites: response?.preferredNewsSupplementalSites ?? null,
        },
        { rollbackOnError: true, revalidate: true }
      );
    },
    [userId, mutate, response]
  );

  const savePreferredNewsSupplementalSites = useCallback(
    async (sites: string[]) => {
      if (!userId) {
        throw new Error('User must be authenticated to save news sites');
      }

      const res = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredNewsSupplementalSites: sites }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Failed to save news sites');
      }

      await mutate(
        {
          ...response,
          newsFeedTags: response?.newsFeedTags ?? null,
          preferredNewsHomeSite: response?.preferredNewsHomeSite ?? null,
          preferredNewsSupplementalSites: sites,
        },
        { rollbackOnError: true, revalidate: true }
      );
    },
    [userId, mutate, response]
  );

  return {
    newsFeedTags,
    preferredNewsHomeSite,
    preferredNewsSupplementalSites,
    saveNewsFeedTags,
    savePreferredNewsHomeSite,
    savePreferredNewsSupplementalSites,
  };
};
