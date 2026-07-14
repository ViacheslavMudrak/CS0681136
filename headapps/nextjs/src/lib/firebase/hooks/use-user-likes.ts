import { useSession } from 'next-auth/react';
import { useSwr } from 'lib/swr';
import { useCallback, useEffect } from 'react';

interface UseUserLikesReturn {
  users: string[] | null;
  isLoadingUsers: boolean;
  saveUserLike: () => Promise<{ success: boolean }>;
  deleteUserLike: () => Promise<{ success: boolean }>;
}

export const useUserLikes = (pageId: string): UseUserLikesReturn => {
  const getUserLikes = async (): Promise<string[] | null> => {
    const response = await fetch('/api/user-likes?pageId=' + pageId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Failed to get the users.');
    }
    const data = await response.json();
    return data.userEmails;
  };

  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  const {
    data,
    isLoading: isLoadingUsers,
    mutate: mutateUsers,
  } = useSwr<string[] | null>({
    key: `/api/user-likes?pageId=${pageId}`,
    fetcher: getUserLikes,
  });
  const users = data ?? null;
  const likesCount = users?.length || 0;

  // Update meta tag in head with like count
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Find or create the meta tag
    let metaTag = document.querySelector('meta[name="likes-count"]');

    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'likes-count');
      document.head.appendChild(metaTag);
    }

    metaTag.setAttribute('content', likesCount.toString());

    // Cleanup function to remove meta tag if component unmounts
    return () => {
      const tagToRemove = document.querySelector('meta[name="likes-count"]');
      if (tagToRemove) {
        tagToRemove.remove();
      }
    };
  }, [likesCount]);

  const deleteUserLike = useCallback(async () => {
    if (!userId) {
      throw new Error('User must be authenticated to like a page.');
    }
    const response = await fetch('/api/user-likes', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pageId: pageId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Failed to delete the user like.');
    }
    const data = await response.json();
    mutateUsers();
    return data;
  }, [userId, pageId, mutateUsers]);

  const saveUserLike = useCallback(async () => {
    if (!userId) {
      throw new Error('User must be authenticated to like a page.');
    }
    const response = await fetch('/api/user-likes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pageId: pageId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Failed to like the page.');
    }
    const data = await response.json();
    mutateUsers();
    return data;
  }, [userId, pageId, mutateUsers]);

  return {
    users: users,
    isLoadingUsers: isLoadingUsers,
    saveUserLike,
    deleteUserLike,
  };
};
