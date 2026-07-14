import { firestoreRepository } from '../repositories/firestore-repository';
import { FIRESTORE_COLLECTIONS } from '../types';

/**
 * User Preferences Service
 * Server-side business logic for managing user preferences
 */
class UserPreferencesService {
  private readonly collectionPath = FIRESTORE_COLLECTIONS.USERPREFERENCES;
  private readonly fieldName = 'newsFeedTags';
  private readonly preferredNewsHomeSiteField = 'preferredNewsHomeSite';
  private readonly preferredNewsSupplementalSitesField = 'preferredNewsSupplementalSites';

  async getPreferredNewsHomeSite(userId: string): Promise<string | null> {
    const doc = await firestoreRepository.get<{ preferredNewsHomeSite?: string }>(
      this.collectionPath,
      userId
    );
    const value = doc?.data?.preferredNewsHomeSite;
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  async setPreferredNewsHomeSite(userId: string, siteId: string): Promise<void> {
    await firestoreRepository.set(
      this.collectionPath,
      userId,
      { [this.preferredNewsHomeSiteField]: siteId },
      true
    );
  }

  async getPreferredNewsSupplementalSites(userId: string): Promise<string[] | null> {
    const doc = await firestoreRepository.get<{ preferredNewsSupplementalSites?: string[] }>(
      this.collectionPath,
      userId
    );

    const sites = doc?.data?.preferredNewsSupplementalSites;
    if (!sites) {
      return null;
    }

    if (Array.isArray(sites)) {
      return sites;
    }

    if (typeof sites === 'object') {
      const arrayFromObject = Object.values(sites);
      if (arrayFromObject.every((val) => typeof val === 'string')) {
        return arrayFromObject as string[];
      }
    }

    return null;
  }

  async savePreferredNewsSupplementalSites(userId: string, sites: string[]): Promise<void> {
    await firestoreRepository.set(
      this.collectionPath,
      userId,
      { [this.preferredNewsSupplementalSitesField]: sites },
      true // merge = true
    );
  }

  async getNewsFeedTags(userId: string): Promise<string[] | null> {
    const doc = await firestoreRepository.get<{ newsFeedTags?: string[] }>(
      this.collectionPath,
      userId
    );

    const tags = doc?.data?.newsFeedTags;
    if (!tags) {
      return null;
    }

    if (Array.isArray(tags)) {
      return tags;
    }

    if (typeof tags === 'object') {
      const arrayFromObject = Object.values(tags);
      if (arrayFromObject.every((val) => typeof val === 'string')) {
        return arrayFromObject as string[];
      }
    }

    return null;
  }

  async saveNewsFeedTags(userId: string, tags: string[]): Promise<void> {
    // Use set() with merge to create document if it doesn't exist, or update if it does
    await firestoreRepository.set(
      this.collectionPath,
      userId,
      {
        [this.fieldName]: tags,
      },
      true // merge = true
    );
  }

  async deleteNewsFeedTags(userId: string): Promise<void> {
    await firestoreRepository.update(this.collectionPath, userId, {
      [this.fieldName]: null,
    });
  }

  async hasNewsFeedTags(userId: string): Promise<boolean> {
    const tags = await this.getNewsFeedTags(userId);
    return tags !== null && tags.length > 0;
  }
}

export const userPreferencesService = new UserPreferencesService();
