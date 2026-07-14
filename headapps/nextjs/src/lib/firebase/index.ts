// Hooks (Client-side)
export { useUserPreferences } from './hooks/use-user-preferences';
export { useUserLikes } from './hooks/use-user-likes';

// Types
export type { FirestoreDocumentRef, FirestoreQueryOptions } from './types';

export {
  FIRESTORE_COLLECTIONS,
  FirestoreErrorCode,
  FirestoreError,
  getErrorMessage,
  isPermissionError,
  isAuthenticationError,
} from './types';

export { useDfdTilesPreferences } from './hooks/use-dfd-tiles-preferences';
export { useUpcomingCalendarEvents } from './hooks/use-upcoming-calendar-events';
export type {
  GoogleCalendarEvent,
  CalendarEventsApiRequest,
  CalendarEventsResponse,
} from './hooks/use-upcoming-calendar-events';
