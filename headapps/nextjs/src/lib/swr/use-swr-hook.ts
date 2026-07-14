import { useSession } from 'next-auth/react';
import useSWR, { SWRConfiguration } from 'swr';
import { swrFetcher } from './fetcher';

/**
 * Generic SWR hook configuration
 */
export const defaultSwrConfig: SWRConfiguration = {
  revalidateOnFocus: false, // Don't refetch on window focus
  revalidateOnReconnect: true, // Refetch when network reconnects
  dedupingInterval: 2000, // Dedupe requests within 2 seconds
  onError: (error, key) => {
    // Log client-side errors for debugging
    console.error('[SWR Error]', {
      key,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  },
};

/**
 * Options for useSwr hook (non-authenticated)
 */
export interface UseSwrOptions<T> {
  /**
   * SWR key - can be a string (for static endpoints) or a function that generates the key
   * Return null to prevent fetching
   */
  key: string | null | (() => string | null);
  /**
   * Custom fetcher function (optional, defaults to generic swrFetcher)
   */
  fetcher?: (url: string) => Promise<T>;
  /**
   * Custom SWR configuration (optional, will be merged with defaults)
   */
  swrConfig?: SWRConfiguration;
}

/**
 * Simple SWR hook for non-authenticated endpoints
 * Use this for public data that doesn't require authentication
 *
 * @example
 * // Example 1: Page likes (page-specific cache)
 * const { data, isLoading, error, mutate } = useSwr<{ count: number }>({
 *   key: () => pageId ? `/api/likes/${pageId}` : null
 * });
 * // Cache key: '/api/likes/article-123' (unique per page)
 * // HTTP request: '/api/likes/article-123'
 *
 * @example
 * // Example 2: Static public endpoint
 * const { data } = useSwr<{ announcements: string[] }>({
 *   key: '/api/announcements'
 * });
 */
export function useSwr<T = unknown>(options: UseSwrOptions<T>) {
  // Resolve the key (string or function)
  const swrKey = typeof options.key === 'function' ? options.key() : options.key;

  // Use custom fetcher or default
  const fetcher = options.fetcher || swrFetcher<T>;

  // Merge custom config with defaults
  const swrConfig: SWRConfiguration = {
    ...defaultSwrConfig,
    ...options.swrConfig,
  };

  const { data, error, isLoading, mutate } = useSWR<T>(swrKey, fetcher, swrConfig);

  return {
    data,
    error: error as Error | undefined,
    isLoading,
    mutate,
  };
}

/**
 * Options for creating a SWR hook with authentication
 */
export interface UseSwrWithAuthOptions<T> {
  /**
   * SWR key - can be a string (for static endpoints) or a function that generates the key
   * Function receives userId and sessionStatus, return null to prevent fetching
   */
  key: string | null | ((userId: string | null, sessionStatus: string) => string | null);
  /**
   * Custom fetcher function (optional, defaults to generic swrFetcher)
   */
  fetcher?: (url: string) => Promise<T>;
  /**
   * Custom SWR configuration (optional, will be merged with defaults)
   */
  swrConfig?: SWRConfiguration;
  /**
   * Whether to wait for session to finish loading before fetching
   * @default true
   */
  waitForSession?: boolean;
  /**
   * Whether to fetch when the user is unauthenticated. Set true for endpoints
   * that return public/ungated content for anonymous users while still
   * filtering server-side for authenticated users. Unauthenticated requests
   * share a single cache entry scoped to `userId=anonymous`.
   * @default false
   */
  allowAnonymous?: boolean;
}

/**
 * Generic hook factory for SWR with NextAuth integration
 * Handles common patterns like waiting for session, conditional fetching
 *
 * @example
 * // Example: User preferences (user-specific cache, requires authentication)
 * const { data, isLoading, error, userId } = useSwrWithAuth<{ newsFeedTags: string[] | null }>({
 *   key: '/api/user-preferences'
 * });
 * // Cache key: '/api/user-preferences#userId=alice@example.com' (unique per user)
 * // HTTP request: '/api/user-preferences' (session identifies user)
 * // Automatically waits for session, prevents fetching if not authenticated
 */
export function useSwrWithAuth<T = unknown>(options: UseSwrWithAuthOptions<T>) {
  const { data: session, status: sessionStatus } = useSession();

  const userId = session?.user?.id || null;
  const waitForSession = options.waitForSession ?? true; // Default to true
  const allowAnonymous = options.allowAnonymous ?? false;

  /**
   * Fetch when the session has resolved (or we're not waiting on it) AND
   * either a userId is present OR the caller opted into anonymous fetching.
   * Anonymous requests share a single cache entry keyed by `userId=anonymous`.
   */
  const shouldFetch =
    (allowAnonymous || Boolean(userId)) && (!waitForSession || sessionStatus !== 'loading');

  // Resolve the key (string or function)
  // IMPORTANT: String keys are automatically scoped to userId to prevent cache collisions
  // The cache key includes userId, but the actual API call uses session-based auth
  // Function keys should handle userId scoping themselves if needed
  const swrKey = shouldFetch
    ? typeof options.key === 'function'
      ? options.key(userId, sessionStatus)
      : options.key
        ? `${options.key}#userId=${userId ?? 'anonymous'}` // Use hash fragment for cache scoping (not sent to server)
        : null
    : null;

  // Use custom fetcher or default
  const fetcher = options.fetcher || swrFetcher<T>;

  // Merge custom config with defaults
  const swrConfig: SWRConfiguration = {
    ...defaultSwrConfig,
    ...options.swrConfig,
  };

  const { data, error, isLoading, mutate } = useSWR<T>(swrKey, fetcher, swrConfig);

  return {
    data,
    error: error as Error | undefined,
    isLoading,
    mutate,
    userId,
    sessionStatus,
  };
}
