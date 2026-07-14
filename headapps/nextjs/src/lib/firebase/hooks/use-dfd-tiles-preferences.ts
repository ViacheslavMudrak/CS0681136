import { useCallback, useEffect } from 'react';
import { useSwrWithAuth } from 'lib/swr';

export type TilePreference = {
  id: string;
  isVisible: boolean;
  order: number;
};

interface UseDfdTilesPreferencesReturn {
  tilePreferences: TilePreference[] | null;
  saveTilePreferences: (preferences: TilePreference[]) => Promise<void>;
  isLoading: boolean;
}

/**
 * Hook for managing user DFD Tiles preferences with Firestore sync using SWR
 *
 * @param pageId - The Sitecore page/item ID to scope preferences to
 */
export const useDfdTilesPreferences = (pageId: string): UseDfdTilesPreferencesReturn => {
  const {
    data: response,
    error,
    isLoading,
    mutate: mutatePreferences,
    userId,
    sessionStatus,
  } = useSwrWithAuth<{ tilePreferences: TilePreference[] | null }>({
    key: pageId ? `/api/dfd-tiles-preferences?pageId=${pageId}` : null,
  });

  const tilePreferences = response?.tilePreferences ?? null;

  // Refetch when session becomes available after initial load
  useEffect(() => {
    if (
      sessionStatus === 'authenticated' &&
      !isLoading &&
      tilePreferences === undefined &&
      !error &&
      pageId
    ) {
      mutatePreferences();
    }
  }, [sessionStatus, isLoading, tilePreferences, error, mutatePreferences, pageId]);

  // Save preferences via API and revalidate SWR cache
  const saveTilePreferences = useCallback(
    async (preferences: TilePreference[]) => {
      if (!userId) {
        throw new Error('User must be authenticated to save preferences');
      }

      if (!pageId) {
        throw new Error('Page ID is required to save preferences');
      }

      const response = await fetch('/api/dfd-tiles-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          tilePreferences: preferences,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || 'Failed to save tile preferences');
      }

      await mutatePreferences(
        { tilePreferences: preferences },
        {
          rollbackOnError: true,
          revalidate: true,
        }
      );
    },
    [userId, pageId, mutatePreferences]
  );

  return {
    tilePreferences,
    saveTilePreferences,
    isLoading,
  };
};
