import { firestoreRepository } from '../repositories/firestore-repository';
import { FIRESTORE_COLLECTIONS } from '../types';

class UserLikesService {
  private readonly collectionPath = FIRESTORE_COLLECTIONS.NEWSARTICLE;
  private readonly subCollectionPath = FIRESTORE_COLLECTIONS.LIKES;
  async getUserLikes(pageId: string): Promise<string[] | null> {
    const docs = await firestoreRepository.getWithSubCollection(
      this.collectionPath,
      pageId,
      this.subCollectionPath
    );
    if (docs && docs.length > 0) {
      const userIds = [];
      for (let i = 0; i < docs.length; i++) {
        userIds.push(docs[i].id);
      }
      return userIds;
    }
    return null;
  }

  async saveUserLikes(userId: string, pageId: string): Promise<void> {
    await firestoreRepository.setWithSubCollection(
      this.collectionPath,
      pageId,
      this.subCollectionPath,
      userId,
      { id: userId },
      true
    );
  }

  async deleteUserLike(userId: string, pageId: string): Promise<void> {
    await firestoreRepository.deleteWithSubCollection(
      this.collectionPath,
      pageId,
      this.subCollectionPath,
      userId
    );
  }
}

export const userLikesService = new UserLikesService();
