import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

type UseKeyphraseUrlSyncParams = {
  queryParamName?: string;
  initialValue?: string;
};

/**
 * Hook for managing keyphrase/term state synchronized with URL query parameters.
 * Handles:
 * - Reading keyphrase from URL query parameter on initialization
 * - Updating URL when keyphrase changes
 * - Syncing state when the URL changes externally (browser back/forward via
 *   popstate, or Next.js client-side navigation via routeChangeComplete)
 */
export const useKeyphraseUrlSync = ({
  queryParamName = 'q',
  initialValue = '',
}: UseKeyphraseUrlSyncParams = {}) => {
  const router = useRouter();

  const getUrlKeyphrase = useCallback(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get(queryParamName) || initialValue;
    }
    return initialValue;
  }, [queryParamName, initialValue]);

  const [keyphrase, setKeyphrase] = useState(getUrlKeyphrase);

  // Update URL when keyphrase changes
  const updateKeyphraseInUrl = useCallback(
    (newKeyphrase: string) => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (newKeyphrase) {
          params.set(queryParamName, newKeyphrase);
        } else {
          params.delete(queryParamName);
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newUrl);
      }
    },
    [queryParamName]
  );

  // Update keyphrase and URL together
  const setKeyphraseWithUrl = useCallback(
    (newKeyphrase: string) => {
      setKeyphrase(newKeyphrase);
      updateKeyphraseInUrl(newKeyphrase);
    },
    [updateKeyphraseInUrl]
  );

  // Sync state when the URL changes externally.
  // routeChangeStart fires the moment router.push() is called — before any page
  // data fetching — so the search widget starts its query immediately rather than
  // waiting for the full navigation cycle to complete.
  // popstate covers browser back/forward, which doesn't fire routeChangeStart.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncFromRouteStart = (url: string) => {
      const search = url.includes('?') ? url.split('?')[1] : '';
      const incoming = new URLSearchParams(search).get(queryParamName) || initialValue;
      setKeyphrase((prev) => (incoming !== prev ? incoming : prev));
    };

    const syncFromUrl = () => {
      const urlKeyphrase = getUrlKeyphrase();
      setKeyphrase((prev) => (urlKeyphrase !== prev ? urlKeyphrase : prev));
    };

    router.events.on('routeChangeStart', syncFromRouteStart);
    window.addEventListener('popstate', syncFromUrl);

    return () => {
      router.events.off('routeChangeStart', syncFromRouteStart);
      window.removeEventListener('popstate', syncFromUrl);
    };
  }, [getUrlKeyphrase, router.events, queryParamName, initialValue]);

  return {
    keyphrase,
    setKeyphrase: setKeyphraseWithUrl,
  };
};
