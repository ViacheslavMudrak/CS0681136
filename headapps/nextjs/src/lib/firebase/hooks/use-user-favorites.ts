import { useSwrWithAuth } from 'lib/swr';
import { useCallback } from 'react';
import { DEFAULT_SITECORE_FOLDER_ID, DEFAULT_SITECORE_FOLDER_NAME } from 'src/constants/favorites';
import { FavoritesModel } from 'ts/user-default-settings';

import { FavoriteFolderInput, FavoriteInput, Favorites } from '../types';

interface CreateResult {
  success: boolean;
  id?: string;
}

interface MutationResult {
  success: boolean;
}

interface UseUserFavoritesReturn {
  favorites: Favorites | null;
  isLoadingFavorites: boolean;
  createUserFavorite: (input: FavoriteInput) => Promise<CreateResult>;
  updateUserFavorite: (id: string, input: Partial<FavoriteInput>) => Promise<MutationResult>;
  deleteUserFavorite: (favoriteId: string) => Promise<MutationResult>;
  createUserFavoriteFolder: (input: FavoriteFolderInput) => Promise<CreateResult>;
  updateUserFavoriteFolder: (
    id: string,
    input: Partial<FavoriteFolderInput>
  ) => Promise<MutationResult>;
  deleteUserFavoriteFolder: (folderId: string, favoriteIds: string[]) => Promise<MutationResult>;
  setFavoriteFlag: (isModified: boolean) => Promise<MutationResult>;
  saveSitecoreDefaultsToFirebase: (defaultFavorites: FavoritesModel) => Promise<void>;
}

export const useUserFavorites = (): UseUserFavoritesReturn => {
  const getUserFavorites = async (): Promise<Favorites | null> => {
    const response = await fetch('/api/user-favorites', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Failed to get user favorites.');
    }
    const data = await response.json();
    return data.favorites;
  };

  const {
    data,
    isLoading: isLoadingFavorites,
    userId,
    mutate: mutateFavorites,
  } = useSwrWithAuth<Favorites | null>({
    key: '/api/user-favorites',
    fetcher: getUserFavorites,
  });
  const favorites = data ?? null;

  const createUserFavorite = useCallback(
    async (input: FavoriteInput): Promise<CreateResult> => {
      if (!userId) {
        throw new Error('User must be authenticated to save the favorite.');
      }
      const response = await fetch('/api/user-favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || 'Failed to save the favorite.');
      }
      const data = await response.json();
      mutateFavorites();
      return { success: true, id: data.id };
    },
    [mutateFavorites, userId]
  );

  const updateUserFavorite = useCallback(
    async (id: string, input: Partial<FavoriteInput>): Promise<MutationResult> => {
      if (!userId) {
        throw new Error('User must be authenticated to save the favorite.');
      }
      if (!id) {
        throw new Error('Favorite id is required to update.');
      }
      const response = await fetch(`/api/user-favorites/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || 'Failed to save the favorite.');
      }
      mutateFavorites();
      return { success: true };
    },
    [mutateFavorites, userId]
  );

  const deleteUserFavorite = useCallback(
    async (favoriteId: string): Promise<MutationResult> => {
      if (!userId) {
        throw new Error('User must be authenticated to delete the favorite.');
      }
      if (!favoriteId) {
        throw new Error('Favorite id is required to delete.');
      }
      const response = await fetch(`/api/user-favorites/${encodeURIComponent(favoriteId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || 'Failed to delete the favorite.');
      }
      mutateFavorites();
      return { success: true };
    },
    [mutateFavorites, userId]
  );

  const createUserFavoriteFolder = useCallback(
    async (input: FavoriteFolderInput): Promise<CreateResult> => {
      if (!userId) {
        throw new Error('User must be authenticated to save the favorite folder.');
      }
      const response = await fetch('/api/user-favorites/folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || 'Failed to save the favorite folder.');
      }
      const data = await response.json();
      mutateFavorites();
      return { success: true, id: data.id };
    },
    [mutateFavorites, userId]
  );

  const updateUserFavoriteFolder = useCallback(
    async (id: string, input: Partial<FavoriteFolderInput>): Promise<MutationResult> => {
      if (!userId) {
        throw new Error('User must be authenticated to save the favorite folder.');
      }
      if (!id) {
        throw new Error('Folder id is required to update.');
      }
      const response = await fetch(`/api/user-favorites/folder/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || 'Failed to save the favorite folder.');
      }
      mutateFavorites();
      return { success: true };
    },
    [mutateFavorites, userId]
  );

  const deleteUserFavoriteFolder = useCallback(
    async (folderId: string, favoriteIds: string[]): Promise<MutationResult> => {
      if (!userId) {
        throw new Error('User must be authenticated to delete the favorite folder.');
      }
      if (!folderId) {
        throw new Error('Folder id is required to delete.');
      }
      const response = await fetch(`/api/user-favorites/folder/${encodeURIComponent(folderId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ favoriteIds }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || 'Failed to delete the favorite folder.');
      }
      mutateFavorites();
      return { success: true };
    },
    [mutateFavorites, userId]
  );

  const setFavoriteFlag = useCallback(
    async (isModified: boolean): Promise<MutationResult> => {
      if (!userId) {
        throw new Error('User must be authenticated to set the flag.');
      }
      const response = await fetch('/api/user-favorites', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isModified: isModified }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || 'Failed to set the flag.');
      }
      mutateFavorites();
      return { success: true };
    },
    [mutateFavorites, userId]
  );

  const saveSitecoreDefaultsToFirebase = useCallback(
    async (defaultFavorites: FavoritesModel) => {
      const allFavorites = defaultFavorites?.targetItems ?? [];

      const savePromises = allFavorites.map((link, index) =>
        createUserFavorite({
          name: link?.name ?? '',
          url: link?.url?.url ?? '',
          icon: link?.icon?.targetItem?.value?.value ?? '',
          folder: DEFAULT_SITECORE_FOLDER_ID,
          order: index + 1,
        })
      );
      await Promise.all([
        ...savePromises,
        updateUserFavoriteFolder(DEFAULT_SITECORE_FOLDER_ID, {
          name: DEFAULT_SITECORE_FOLDER_NAME,
          order: 1,
        }),
      ]);
      await setFavoriteFlag(true);
    },
    [createUserFavorite, updateUserFavoriteFolder, setFavoriteFlag]
  );

  return {
    favorites,
    isLoadingFavorites,
    createUserFavorite,
    updateUserFavorite,
    deleteUserFavorite,
    createUserFavoriteFolder,
    updateUserFavoriteFolder,
    deleteUserFavoriteFolder,
    setFavoriteFlag,
    saveSitecoreDefaultsToFirebase,
  };
};
