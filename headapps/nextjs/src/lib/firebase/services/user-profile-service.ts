import type { GoogleProfileData } from 'ts/google';

import { firestoreRepository } from '../repositories/firestore-repository';
import { FIRESTORE_COLLECTIONS } from '../types';

interface GoogleProfileWithTimestamp {
  googleProfile: GoogleProfileData;
  googleProfileUpdatedAt: Date;
}

// Profile cache duration (24 hours)
const PROFILE_CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Service for managing user profile data in Firestore
 * Follows the established Firebase service pattern
 */
class UserProfileService {
  private readonly collectionPath = FIRESTORE_COLLECTIONS.USERS;

  /**
   * Get Google profile from Firestore if it exists and is fresh (< 24 hours old)
   * @param userId User email (used as document ID)
   * @returns GoogleProfileData if fresh, null if stale or missing
   */
  async getGoogleProfile(userId: string): Promise<GoogleProfileData | null> {
    try {
      const doc = await firestoreRepository.get<GoogleProfileWithTimestamp>(
        this.collectionPath,
        userId
      );

      if (!doc?.data?.googleProfile) {
        return null;
      }

      const profile = doc.data.googleProfile;
      const updatedAt = doc.data.googleProfileUpdatedAt;

      // Check if profile is fresh (< 24 hours old)
      if (updatedAt && this.isGoogleProfileFresh(updatedAt)) {
        return profile;
      }

      return null; // Profile is stale
    } catch (error) {
      console.error('[UserProfileService] Failed to get Google profile:', error);
      return null;
    }
  }

  /**
   * Save or update Google profile in Firestore
   * Uses merge mode to preserve other user document fields
   * @param userId User email (used as document ID)
   * @param profile Google profile data to save
   */
  async saveGoogleProfile(userId: string, profile: GoogleProfileData): Promise<void> {
    try {
      await firestoreRepository.set(
        this.collectionPath,
        userId,
        {
          googleProfile: profile,
          employeeNumber: profile?.userInfo?.employeeNumber || '',
          employeeNumbers: profile?.userInfo?.employeeNumber
            ? [profile.userInfo.employeeNumber]
            : [],
          googleProfileUpdatedAt: new Date(),
        },
        true // merge: true - preserves other fields
      );
    } catch (error) {
      console.error('[UserProfileService] Failed to save Google profile:', error);
      throw error;
    }
  }

  /**
   * Check if a profile timestamp is fresh (< 24 hours old)
   * @param updatedAt Profile last update timestamp
   * @returns true if fresh, false if stale
   */
  private isGoogleProfileFresh(updatedAt: Date): boolean {
    const age = Date.now() - updatedAt.getTime();
    return age < PROFILE_CACHE_DURATION_MS;
  }
}

// Export singleton instance (follows established pattern)
export const userProfileService = new UserProfileService();
