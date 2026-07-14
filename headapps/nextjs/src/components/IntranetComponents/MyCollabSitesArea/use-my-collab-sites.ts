import { useCallback, useMemo, useState } from 'react';

import { useSwrWithAuth } from 'lib/swr/use-swr-hook';
import type {
  CollabSiteCard,
  CollabSiteSortOption,
  CollabSitesListResponse,
  LeaveGroupResponse,
  RequestToJoinResponse,
} from 'lib/collab-sites/collab-site.types';

function sortCollabSites<T extends CollabSiteCard>(cards: T[], sort: CollabSiteSortOption): T[] {
  const sorted = [...cards];
  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => b.creationDate.localeCompare(a.creationDate));
    case 'oldest':
      return sorted.sort((a, b) => a.creationDate.localeCompare(b.creationDate));
    case 'alphabetical':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

export function useMyCollabSites(cardsPerPage: number, parentId: string | undefined) {
  const { data, error, isLoading, mutate, sessionStatus } = useSwrWithAuth<CollabSitesListResponse>(
    {
      // Skip fetching until the calling page provides its itemId; otherwise
      // the API would 400 on a missing parentId.
      key: parentId ? `/api/collab-sites/list?parentId=${encodeURIComponent(parentId)}` : null,
    }
  );

  // SWR returns isLoading: false when the key is null (session still loading
  // or parentId not yet available), which causes the empty state to flash
  // before data arrives.
  const loading = isLoading || sessionStatus === 'loading' || !parentId || !data;

  const [sortOption, setSortOption] = useState<CollabSiteSortOption>('newest');
  const [myPage, setMyPage] = useState(1);
  const [explorePage, setExplorePage] = useState(1);

  const myCollabSites = useMemo(
    () => sortCollabSites(data?.myCollabSites ?? [], sortOption),
    [data?.myCollabSites, sortOption]
  );

  const exploreCollabSites = useMemo(
    () => sortCollabSites(data?.exploreCollabSites ?? [], sortOption),
    [data?.exploreCollabSites, sortOption]
  );

  const myCount = myCollabSites.length;
  const exploreCount = exploreCollabSites.length;

  const myPageCount = Math.ceil(myCount / cardsPerPage);
  const explorePageCount = Math.ceil(exploreCount / cardsPerPage);

  const myCardsForPage = useMemo(
    () => myCollabSites.slice((myPage - 1) * cardsPerPage, myPage * cardsPerPage),
    [myCollabSites, myPage, cardsPerPage]
  );

  const exploreCardsForPage = useMemo(
    () => exploreCollabSites.slice((explorePage - 1) * cardsPerPage, explorePage * cardsPerPage),
    [exploreCollabSites, explorePage, cardsPerPage]
  );

  const leaveCollabSite = useCallback(
    async (groupEmails: string[]): Promise<LeaveGroupResponse> => {
      const res = await fetch('/api/collab-sites/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupEmails }),
      });
      const result = (await res.json()) as LeaveGroupResponse;

      if (result.success) {
        await mutate();
      }

      return result;
    },
    [mutate]
  );

  const requestToJoin = useCallback(
    async (collabSiteId: string): Promise<RequestToJoinResponse> => {
      const res = await fetch('/api/collab-sites/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collabSiteId, parentId }),
      });
      const result = (await res.json()) as RequestToJoinResponse;

      if (result.success) {
        await mutate();
      }

      return result;
    },
    [mutate, parentId]
  );

  const handleSortChange = useCallback((newSort: CollabSiteSortOption) => {
    setSortOption(newSort);
    setMyPage(1);
    setExplorePage(1);
  }, []);

  return {
    myCollabSites: myCardsForPage,
    exploreCollabSites: exploreCardsForPage,
    myCount,
    exploreCount,
    myPage,
    setMyPage,
    myPageCount,
    explorePage,
    setExplorePage,
    explorePageCount,
    sortOption,
    handleSortChange,
    leaveCollabSite,
    requestToJoin,
    isLoading: loading,
    error,
  };
}
