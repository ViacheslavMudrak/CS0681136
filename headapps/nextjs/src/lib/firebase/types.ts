import type { GoogleProfileData } from 'ts/google';

/**
 * Firestore collection paths
 */
export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  USERPREFERENCES: 'userPreferences',
  NEWSARTICLE: 'newsArticles',
  LIKES: 'likes',
  FAVORITES: 'favorites',
  FAVORITESFOLDER: 'favoritesFolder',
  JOINREQUESTS: 'joinRequestsCollabSites',
} as const;

/**
 * Firestore document reference type
 */
export type FirestoreDocumentRef<T> = {
  id: string;
  data: T;
  exists: boolean;
};

/**
 * Firestore query options
 */
export interface FirestoreQueryOptions {
  limit?: number;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  where?: {
    field: string;
    operator:
      | '<'
      | '<='
      | '=='
      | '!='
      | '>='
      | '>'
      | 'array-contains'
      | 'in'
      | 'array-contains-any';
    value: unknown;
  }[];
}

/**
 * Firestore error types
 */
export enum FirestoreErrorCode {
  PERMISSION_DENIED = 'permission-denied',
  NOT_FOUND = 'not-found',
  ALREADY_EXISTS = 'already-exists',
  UNAVAILABLE = 'unavailable',
  UNAUTHENTICATED = 'unauthenticated',
  UNKNOWN = 'unknown',
}

export class FirestoreError extends Error {
  constructor(
    public code: FirestoreErrorCode,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'FirestoreError';
  }
}

/**
 * Get user-friendly error message from Firestore error
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof FirestoreError) {
    switch (error.code) {
      case FirestoreErrorCode.PERMISSION_DENIED:
        return 'You do not have permission to perform this action.';
      case FirestoreErrorCode.NOT_FOUND:
        return 'The requested resource was not found.';
      case FirestoreErrorCode.UNAUTHENTICATED:
        return 'Please sign in to continue.';
      case FirestoreErrorCode.UNAVAILABLE:
        return 'Service is temporarily unavailable. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};

/**
 * Check if error is a permission error
 */
export const isPermissionError = (error: unknown): boolean => {
  return error instanceof FirestoreError && error.code === FirestoreErrorCode.PERMISSION_DENIED;
};

/**
 * Check if error is an authentication error
 */
export const isAuthenticationError = (error: unknown): boolean => {
  return error instanceof FirestoreError && error.code === FirestoreErrorCode.UNAUTHENTICATED;
};

// export type FavoriteType = 'SYSTEM' | 'DIRECTORY' | 'USER_CREATED';

// export interface Favorite {
//   id: string;
//   title?: string;
//   favoriteType?: string;
//   pageUrl?: string;
//   iconUrl?: string;
//   order?: number;
//   folderPath?: string;
// }

export interface Favorite {
  id?: string;
  name?: string;
  url?: string;
  icon?: string;
  order?: number;
  folder?: string;
  type?: string;
}

/**
 * Client-supplied fields for creating or updating a favorite.
 * Excludes server-controlled fields (id, createdAt, updatedAt).
 */
export type FavoriteInput = Omit<Favorite, 'id'>;

export interface FavoritesFolder {
  id?: string;
  name?: string;
  order?: number;
}

/**
 * Client-supplied fields for creating or updating a favorites folder.
 * Excludes server-controlled fields (id, createdAt, updatedAt).
 */
export type FavoriteFolderInput = Omit<FavoritesFolder, 'id'>;

/**
 * Google profile with timestamp for caching
 */
export interface GoogleProfileWithTimestamp {
  googleProfile: GoogleProfileData;
  googleProfileUpdatedAt: Date;
}

export interface Favorites {
  isFavoritesModified?: boolean;
  folders?: FavoritesFolder[] | undefined;
  favorites?: Favorite[] | undefined;
}
