import {
  FirestoreError,
  FirestoreErrorCode,
  FirestoreQueryOptions,
  FirestoreDocumentRef,
} from '../types';
import { DocumentData, Query, QueryDocumentSnapshot, Timestamp } from 'firebase-admin/firestore';

import { adminFirestore, FieldValue } from '../config';

/**
 * Firestore Repository
 * Server-side data access layer using Firebase Admin SDK
 * Provides generic CRUD operations that can be used by any service
 */
class FirestoreRepository {
  /**
   * Get a single document by ID
   * @throws {Error} If collectionPath or documentId contains invalid characters
   */
  async get<T extends DocumentData>(
    collectionPath: string,
    documentId: string
  ): Promise<FirestoreDocumentRef<T> | null> {
    this.validatePath(collectionPath, documentId);

    try {
      const db = adminFirestore;
      const docRef = db.collection(collectionPath).doc(documentId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return null;
      }

      return {
        id: docSnap.id,
        data: this.convertTimestamps(docSnap.data() as DocumentData) as T,
        exists: true,
      };
    } catch (error) {
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Get collection with sub collection data
   * @throws {Error} If collectionPath or documentId contains invalid characters
   */
  async getWithSubCollection(
    collectionPath: string,
    documentId: string,
    subCollectionPath: string
  ): Promise<QueryDocumentSnapshot[] | null> {
    this.validatePath(collectionPath, documentId);

    try {
      const db = adminFirestore;
      const subCollection = await db
        .collection(collectionPath)
        .doc(documentId)
        .collection(subCollectionPath);
      const docRef = await subCollection.get();

      if (docRef?.docs?.length <= 0) {
        return null;
      }
      return docRef.docs;
    } catch (error) {
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Get all documents from a collection
   * @throws {Error} If collectionPath contains invalid characters
   */
  async getAll<T extends DocumentData>(
    collectionPath: string,
    options?: FirestoreQueryOptions
  ): Promise<FirestoreDocumentRef<T>[]> {
    if (!collectionPath || collectionPath.includes('/')) {
      throw new Error('Invalid collection path');
    }

    try {
      const db = adminFirestore;
      let query: Query = db.collection(collectionPath);

      if (options?.where) {
        options.where.forEach((condition) => {
          query = query.where(condition.field, condition.operator, condition.value);
        });
      }

      if (options?.orderBy) {
        query = query.orderBy(options.orderBy.field, options.orderBy.direction);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const querySnapshot = await query.get();

      return querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        data: this.convertTimestamps(docSnap.data() as DocumentData) as T,
        exists: true,
      }));
    } catch (error) {
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Create a new document
   */
  async create<T extends DocumentData>(
    collectionPath: string,
    documentId: string,
    data: T
  ): Promise<void> {
    this.validatePath(collectionPath, documentId);

    try {
      const db = adminFirestore;
      const docRef = db.collection(collectionPath).doc(documentId);
      const dataWithTimestamps = this.addTimestamps(data, true);
      await docRef.set(dataWithTimestamps);
    } catch (error) {
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Update an existing document
   */
  async update<T extends Partial<DocumentData>>(
    collectionPath: string,
    documentId: string,
    data: T
  ): Promise<void> {
    this.validatePath(collectionPath, documentId);

    try {
      const db = adminFirestore;
      const docRef = db.collection(collectionPath).doc(documentId);
      const dataWithTimestamps = this.addTimestamps(data, false);
      await docRef.update(dataWithTimestamps);
    } catch (error) {
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Create or update a document (upsert)
   */
  async set<T extends DocumentData>(
    collectionPath: string,
    documentId: string,
    data: T,
    merge = true
  ): Promise<void> {
    this.validatePath(collectionPath, documentId);

    try {
      const db = adminFirestore;
      const docRef = db.collection(collectionPath).doc(documentId);
      const dataWithTimestamps = this.addTimestamps(data, true);
      await docRef.set(dataWithTimestamps, { merge });
    } catch (error) {
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Create or update a document with sub collection (upsert)
   */
  async setWithSubCollection<T extends DocumentData>(
    collectionPath: string,
    documentId: string,
    subCollectionPath: string,
    subDocumentId: string,
    data: T,
    merge = true
  ): Promise<void> {
    this.validatePath(collectionPath, documentId);

    try {
      const db = adminFirestore;
      let dataWithTimestamps = this.addTimestamps(data, true);

      if (!subDocumentId || subDocumentId === '') {
        const docRef = db.collection(collectionPath).doc(documentId).collection(subCollectionPath);
        await docRef.add(dataWithTimestamps);
      } else {
        dataWithTimestamps = this.addTimestamps(data, false);
        const docRef = db
          .collection(collectionPath)
          .doc(documentId)
          .collection(subCollectionPath)
          .doc(subDocumentId);
        await docRef.set(dataWithTimestamps, { merge });
      }
    } catch (error) {
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Delete a document with sub collection
   */
  async deleteWithSubCollection(
    collectionPath: string,
    documentId: string,
    subCollectionPath: string,
    subDocumentId: string
  ): Promise<void> {
    this.validatePath(collectionPath, documentId);

    try {
      const db = adminFirestore;
      const docRef = db
        .collection(collectionPath)
        .doc(documentId)
        .collection(subCollectionPath)
        .doc(subDocumentId);
      await docRef.delete();
    } catch (error) {
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Delete multiple documents under a sub-collection
   */
  async deleteBatchWithSubCollection(
    collectionPath: string,
    documentId: string,
    subCollectionPath: string,
    subDocumentIds: string[]
  ): Promise<void> {
    this.validatePath(collectionPath, documentId);

    try {
      const db = adminFirestore;
      const subCollectionRef = db
        .collection(collectionPath)
        .doc(documentId)
        .collection(subCollectionPath);
      const batch = db.batch();
      subDocumentIds.forEach((subDocumentId) => {
        const docRef = subCollectionRef.doc(subDocumentId);
        batch.delete(docRef);
      });
      await batch.commit();
    } catch (error) {
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Delete a document
   */
  async delete(collectionPath: string, documentId: string): Promise<void> {
    this.validatePath(collectionPath, documentId);

    try {
      const db = adminFirestore;
      const docRef = db.collection(collectionPath).doc(documentId);
      await docRef.delete();
    } catch (error) {
      throw this.handleFirestoreError(error);
    }
  }

  /**
   * Convert Firestore Timestamps to JavaScript Dates
   */
  private convertTimestamps(data: DocumentData): DocumentData {
    const converted = { ...data };

    for (const key in converted) {
      if (converted[key] instanceof Timestamp) {
        converted[key] = converted[key].toDate();
      } else if (Array.isArray(converted[key])) {
        converted[key] = converted[key].map((item: unknown) => {
          if (item instanceof Timestamp) {
            return item.toDate();
          }
          if (item && typeof item === 'object') {
            return this.convertTimestamps(item as DocumentData);
          }
          return item;
        });
      } else if (converted[key] && typeof converted[key] === 'object') {
        converted[key] = this.convertTimestamps(converted[key] as DocumentData);
      }
    }

    return converted;
  }

  /**
   * Add timestamps to document data
   * Uses FieldValue.serverTimestamp() for accurate server-side timestamps
   */
  private addTimestamps<T extends DocumentData>(
    data: T,
    isNew: boolean
  ): T & {
    createdAt?: ReturnType<typeof FieldValue.serverTimestamp>;
    updatedAt: ReturnType<typeof FieldValue.serverTimestamp>;
  } {
    if (isNew) {
      return {
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      } as T & {
        createdAt: ReturnType<typeof FieldValue.serverTimestamp>;
        updatedAt: ReturnType<typeof FieldValue.serverTimestamp>;
      };
    }

    return {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    } as T & { updatedAt: ReturnType<typeof FieldValue.serverTimestamp> };
  }

  /**
   * Validate collection and document paths to prevent injection
   */
  private validatePath(collectionPath: string, documentId: string): void {
    // Firestore path validation: no forward slashes, no empty strings
    if (!collectionPath || !documentId) {
      throw new Error('Collection path and document ID cannot be empty');
    }
    if (collectionPath.includes('/') || documentId.includes('/')) {
      throw new Error('Collection path and document ID cannot contain forward slashes');
    }
    // Additional validation: reasonable length limits
    if (collectionPath.length > 150 || documentId.length > 1500) {
      throw new Error('Collection path or document ID exceeds maximum length');
    }
  }

  /**
   * Handle Firestore errors with proper error codes
   */
  private handleFirestoreError(error: unknown): FirestoreError {
    if (error instanceof Error) {
      // Firebase Admin SDK errors have a code property
      const errorCode = (error as { code?: number }).code;
      let code: FirestoreErrorCode;

      if (errorCode !== undefined) {
        switch (errorCode) {
          case 7: // PERMISSION_DENIED
            code = FirestoreErrorCode.PERMISSION_DENIED;
            break;
          case 5: // NOT_FOUND
            code = FirestoreErrorCode.NOT_FOUND;
            break;
          case 6: // ALREADY_EXISTS
            code = FirestoreErrorCode.ALREADY_EXISTS;
            break;
          case 14: // UNAVAILABLE
            code = FirestoreErrorCode.UNAVAILABLE;
            break;
          case 16: // UNAUTHENTICATED
            code = FirestoreErrorCode.UNAUTHENTICATED;
            break;
          default:
            code = FirestoreErrorCode.UNKNOWN;
        }
      } else {
        code = FirestoreErrorCode.UNKNOWN;
      }

      return new FirestoreError(code, error.message, error);
    }

    return new FirestoreError(FirestoreErrorCode.UNKNOWN, 'An unexpected error occurred', error);
  }
}

export const firestoreRepository = new FirestoreRepository();
