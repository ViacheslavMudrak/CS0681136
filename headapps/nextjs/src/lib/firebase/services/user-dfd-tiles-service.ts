import { firestoreRepository } from '../repositories/firestore-repository';
import { FIRESTORE_COLLECTIONS } from '../types';

export type TilePreference = {
  id?: string;
  isVisible: boolean;
  order: number;
};

class UserDfdTilesService {
  private readonly collectionPath = FIRESTORE_COLLECTIONS.USERPREFERENCES;
  private readonly subCollectionPath = 'dfd-tiles';

  /**
   * Get user's tile preferences for a specific page
   * Returns array of tiles with their visibility and order
   */
  async getTilePreferences(userId: string, pageId: string): Promise<TilePreference[] | null> {
    const tileDocs = await firestoreRepository.getWithSubCollection(
      this.collectionPath,
      userId,
      `${this.subCollectionPath}-${pageId}`
    );

    if (!tileDocs || tileDocs.length === 0) {
      return null;
    }

    const preferences: TilePreference[] = [];
    for (let i = 0; i < tileDocs.length; i++) {
      const data = tileDocs[i].data() as TilePreference;
      data.id = tileDocs[i].id;
      preferences.push(data);
    }

    // Sort by order
    return preferences.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }

  /**
   * Save a single tile preference (visibility + order)
   */
  async saveTilePreference(
    userId: string,
    pageId: string,
    tileId: string,
    preference: { isVisible: boolean; order: number }
  ): Promise<void> {
    await firestoreRepository.setWithSubCollection(
      this.collectionPath,
      userId,
      `${this.subCollectionPath}-${pageId}`,
      tileId,
      {
        isVisible: preference.isVisible,
        order: preference.order,
      },
      true
    );
  }

  /**
   * Save all tile preferences at once
   */
  async saveTilePreferences(
    userId: string,
    pageId: string,
    preferences: TilePreference[]
  ): Promise<void> {
    // Save each tile preference individually
    for (const pref of preferences) {
      if (pref.id) {
        await this.saveTilePreference(userId, pageId, pref.id, {
          isVisible: pref.isVisible,
          order: pref.order,
        });
      }
    }
  }

  /**
   * Delete all tile preferences for a specific page
   */
  async deleteTilePreferences(userId: string, pageId: string): Promise<void> {
    const tileDocs = await firestoreRepository.getWithSubCollection(
      this.collectionPath,
      userId,
      `${this.subCollectionPath}-${pageId}`
    );

    if (tileDocs && tileDocs.length > 0) {
      const tileIds = tileDocs.map((doc) => doc.id);
      await firestoreRepository.deleteBatchWithSubCollection(
        this.collectionPath,
        userId,
        `${this.subCollectionPath}-${pageId}`,
        tileIds
      );
    }
  }
}

export const userDfdTilesService = new UserDfdTilesService();
