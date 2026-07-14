import { useSwrWithAuth } from 'lib/swr';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

import { DriveFile, DriveFileListResponse } from '../types';

interface UseGoogleDriveReturn {
  files: DriveFile[];
  driveName?: string | null;
  loading: boolean; // loading initial
  loadingMore: boolean; // loading next page
  error: Error | null;
  isValidating: boolean;
  isForbidden: boolean;
  hasNext: boolean;
  totalCount?: number;
  nextPageToken?: string | null;
  fetchNextPage: () => Promise<DriveFile[] | null>;
  refresh: () => Promise<void>;
}

const API_URL = '/api/google/drive/list';

/**
 * useGoogleDrive
 * - uses SWR to fetch only the first page on mount
 * - exposes fetchNextPage() which will fetch using the nextPageToken and append results
 */
export const useGoogleDrive = (
  driveId?: string,
  parentId?: string,
  enabled: boolean = true
): UseGoogleDriveReturn => {
  const { data: session } = useSession();
  const hasGoogleAccess = !!session?.googleAccessToken;

  // include parentId (folder) in the key so SWR fetches the correct first page
  const baseKey = driveId
    ? `${API_URL}?driveId=${encodeURIComponent(driveId)}${parentId ? `&parentId=${encodeURIComponent(parentId)}` : ''}`
    : `${API_URL}${parentId ? `?parentId=${encodeURIComponent(parentId)}` : ''}`;

  const fetcher = async (url: string) => {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      /**
       * Session cannot self-recover (expired token, no refresh token, or Google
       * rejected the token). Redirect through the consent retry path so the
       * user re-consents and Google issues fresh tokens.
       */
      if (err.requiresReauth && typeof window !== 'undefined') {
        const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/auth/signin?error=Callback&callbackUrl=${callbackUrl}`;
        // Throw to stop SWR from treating this as a normal success
        throw new Error('Redirecting for re-authentication');
      }
      // Attach HTTP status to the thrown error so callers can detect 401/403
      const apiErr = new Error(err.error || res.statusText || 'Failed to fetch Drive files');
      // attach status with a typed assertion to avoid `any`
      (apiErr as unknown as { status?: number }).status = res.status;
      throw apiErr;
    }
    return (await res.json()) as DriveFileListResponse;
  };

  /**
   * Drive listings are per-user authorized and change relatively slowly during a
   * browsing session. A 45s dedup window collapses burst traffic from quick
   * back-and-forth folder navigation, while revalidateOnFocus ensures the user
   * sees fresh results when they return to the tab.
   */
  const { data, error, isLoading, mutate } = useSwrWithAuth<DriveFileListResponse>({
    key: (userId) => (enabled && userId && hasGoogleAccess ? baseKey : null),
    fetcher,
    swrConfig: {
      dedupingInterval: 30_000,
      revalidateOnFocus: true,
    },
  });

  // aggregated files across pages; start with first page from SWR
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [driveName, setDriveName] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // when baseKey (driveId or parentId) changes, reset aggregated files so UI shows
  // loading state for the new folder
  useEffect(() => {
    setFiles([]);
    setNextPageToken(null);
  }, [baseKey]);

  // when SWR returns initial data, replace aggregated files
  useEffect(() => {
    if (data?.files) {
      setFiles(data.files);
      setNextPageToken(data.nextPageToken ?? null);
      setDriveName(data.driveName ?? null);
    }
  }, [data]);

  // fetch next page manually when requested by UI
  const fetchNextPage = useCallback(async (): Promise<DriveFile[] | null> => {
    if (!nextPageToken) return null;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (driveId) params.set('driveId', driveId);
      if (parentId) params.set('parentId', parentId);
      params.set('pageToken', nextPageToken);
      const url = `${API_URL}?${params.toString()}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        if (err.requiresReauth && typeof window !== 'undefined') {
          const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/auth/signin?error=Callback&callbackUrl=${callbackUrl}`;
          throw new Error('Redirecting for re-authentication');
        }
        throw new Error(err.error || 'Failed to fetch Drive files');
      }
      const payload = (await res.json()) as DriveFileListResponse;
      const newFiles = payload.files ?? [];
      // append
      setFiles((prev) => (prev ? [...prev, ...newFiles] : [...newFiles]));
      setNextPageToken(payload.nextPageToken ?? null);
      return newFiles;
    } finally {
      setLoadingMore(false);
    }
  }, [nextPageToken, driveId, parentId]);

  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    files,
    driveName,
    loading: !data && !error,
    loadingMore,
    error: error ?? null,
    isValidating: Boolean(isLoading),
    // expose a shortcut flag when the API returned a 403
    isForbidden: Boolean((error as unknown as { status?: number })?.status === 403),
    hasNext: Boolean(nextPageToken),
    totalCount: data?.count,
    nextPageToken,
    fetchNextPage,
    refresh,
  };
};
