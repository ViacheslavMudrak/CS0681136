import { randomUUID } from 'crypto';

import { firestoreRepository } from '../repositories/firestore-repository';
import {
  Favorite,
  FavoriteFolderInput,
  FavoriteInput,
  FavoritesFolder,
  Favorites,
  FIRESTORE_COLLECTIONS,
} from '../types';

/**
 * Whitelist client-supplied favorite fields. Drops anything not in this set
 * (id, createdAt, updatedAt, or any other unexpected field). Numeric and
 * string guards preserve falsy-but-valid values like order: 0.
 */
function pickFavoriteFields(input: Partial<FavoriteInput>): Partial<FavoriteInput> {
  return {
    ...(typeof input.name === 'string' && { name: input.name }),
    ...(typeof input.url === 'string' && { url: input.url }),
    ...(typeof input.icon === 'string' && { icon: input.icon }),
    ...(typeof input.order === 'number' && { order: input.order }),
    ...(typeof input.folder === 'string' && { folder: input.folder }),
    ...(typeof input.type === 'string' && { type: input.type }),
  };
}

/**
 * Whitelist client-supplied folder fields. Drops anything not in this set.
 */
function pickFolderFields(input: Partial<FavoriteFolderInput>): Partial<FavoriteFolderInput> {
  return {
    ...(typeof input.name === 'string' && { name: input.name }),
    ...(typeof input.order === 'number' && { order: input.order }),
  };
}

class UserFavoritesService {
  private readonly collectionPath = FIRESTORE_COLLECTIONS.USERPREFERENCES;
  private readonly subCollectionPath = FIRESTORE_COLLECTIONS.FAVORITES;
  private readonly folderCollectionPath = FIRESTORE_COLLECTIONS.FAVORITESFOLDER;

  async getFavorites(userEmail: string): Promise<Favorites | null> {
    const favorites: Favorites = { isFavoritesModified: false, favorites: undefined };
    const favoriteDocs = await firestoreRepository.getWithSubCollection(
      this.collectionPath,
      userEmail,
      this.subCollectionPath
    );
    if (favoriteDocs && favoriteDocs.length > 0) {
      favorites.favorites = [];
      for (let i = 0; i < favoriteDocs.length; i++) {
        const data = favoriteDocs[i].data() as Favorite;
        data.id = favoriteDocs[i].id;
        favorites.favorites.push(data);
      }
    }

    const folderDocs = await firestoreRepository.getWithSubCollection(
      this.collectionPath,
      userEmail,
      this.folderCollectionPath
    );
    if (folderDocs && folderDocs.length > 0) {
      favorites.folders = [];
      for (let i = 0; i < folderDocs.length; i++) {
        const data = folderDocs[i].data() as FavoritesFolder;
        data.id = folderDocs[i].id;
        favorites.folders.push(data);
      }
    }

    const userDoc = await firestoreRepository.get<{ isFavoritesModified?: boolean }>(
      this.collectionPath,
      userEmail
    );
    favorites.isFavoritesModified = userDoc?.data?.isFavoritesModified || false;

    return favorites;
  }

  async setFavoriteFlag(userEmail: string, isModified: boolean): Promise<void> {
    await firestoreRepository.set(
      this.collectionPath,
      userEmail,
      { isFavoritesModified: isModified },
      true
    );
  }

  /**
   * Create a new favorite. The id is generated server-side; any id supplied
   * by the caller is ignored (handled by pickFavoriteFields).
   */
  async createFavorite(userEmail: string, input: FavoriteInput): Promise<{ id: string }> {
    const id = randomUUID();
    await firestoreRepository.setWithSubCollection(
      this.collectionPath,
      userEmail,
      this.subCollectionPath,
      id,
      pickFavoriteFields(input),
      false
    );
    return { id };
  }

  /**
   * Update an existing favorite. Uses merge so partial payloads (e.g. drag/
   * reorder sending only { order, folder }) leave untouched fields intact.
   */
  async updateFavorite(
    userEmail: string,
    id: string,
    input: Partial<FavoriteInput>
  ): Promise<void> {
    await firestoreRepository.setWithSubCollection(
      this.collectionPath,
      userEmail,
      this.subCollectionPath,
      id,
      pickFavoriteFields(input),
      true
    );
  }

  async deleteFavorite(userEmail: string, favoriteId: string): Promise<void> {
    await firestoreRepository.deleteWithSubCollection(
      this.collectionPath,
      userEmail,
      this.subCollectionPath,
      favoriteId
    );
  }

  /**
   * Create a new folder. The id is generated server-side; any id supplied
   * by the caller is ignored (handled by pickFolderFields).
   */
  async createFavoriteFolder(
    userEmail: string,
    input: FavoriteFolderInput
  ): Promise<{ id: string }> {
    const id = randomUUID();
    await firestoreRepository.setWithSubCollection(
      this.collectionPath,
      userEmail,
      this.folderCollectionPath,
      id,
      pickFolderFields(input),
      false
    );
    return { id };
  }

  /**
   * Update an existing folder. Uses merge, so this also acts as upsert at the
   * given id when called by the seed flow for the well-known top-favorites
   * folder.
   */
  async updateFavoriteFolder(
    userEmail: string,
    id: string,
    input: Partial<FavoriteFolderInput>
  ): Promise<void> {
    await firestoreRepository.setWithSubCollection(
      this.collectionPath,
      userEmail,
      this.folderCollectionPath,
      id,
      pickFolderFields(input),
      true
    );
  }

  async deleteFavoriteFolder(
    userEmail: string,
    folderId: string,
    favoriteIds: string[]
  ): Promise<void> {
    await firestoreRepository.deleteWithSubCollection(
      this.collectionPath,
      userEmail,
      this.folderCollectionPath,
      folderId
    );
    if (favoriteIds && favoriteIds.length > 0) {
      await firestoreRepository.deleteBatchWithSubCollection(
        this.collectionPath,
        userEmail,
        this.subCollectionPath,
        favoriteIds
      );
    }
  }
}

export const userFavoritesService = new UserFavoritesService();
