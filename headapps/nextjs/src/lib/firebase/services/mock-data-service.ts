import { VoyagerMockData } from 'ts/voyager-mock-data';

import { firestoreRepository } from '../repositories/firestore-repository';
import { FIRESTORE_COLLECTIONS } from '../types';

/**
 * Mock-Data Service
 * The entire form payload is JSON-encoded and stored as a single string
 */

class MockDataService {
  private readonly collectionPath = FIRESTORE_COLLECTIONS.USERS;
  private readonly fieldName = 'VoyagerMockJson';

  async get(userId: string): Promise<VoyagerMockData | null> {
    const doc = await firestoreRepository.get<{ VoyagerMockJson?: string }>(
      this.collectionPath,
      userId
    );

    const raw = doc?.data?.VoyagerMockJson;
    if (!raw) return null;

    try {
      const parsed: VoyagerMockData = JSON.parse(raw);
      return Object.keys(parsed).length > 0 ? parsed : null;
    } catch {
      return null;
    }
  }

  async save(userId: string, data: VoyagerMockData): Promise<void> {
    // Load existing data so unchanged fields are preserved
    const existing = (await this.get(userId)) ?? {};

    // Merge: only overwrite fields present in the incoming payload
    const merged: VoyagerMockData = { ...existing };
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        (merged as Record<string, string | undefined>)[key] = value === '' ? undefined : value;
      }
    }

    // Strip empty/undefined values before encoding
    const sanitised: VoyagerMockData = {};
    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined && value !== '') {
        (sanitised as Record<string, string>)[key] = value;
      }
    }

    const encoded = JSON.stringify(sanitised);

    await firestoreRepository.set(this.collectionPath, userId, { [this.fieldName]: encoded }, true);
  }
}

export const mockDataService = new MockDataService();
