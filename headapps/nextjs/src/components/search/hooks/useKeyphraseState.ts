import { useEffect, useRef } from 'react';

type UseKeyphraseStateParams = {
  externalKeyphrase?: string;
  currentKeyphrase: string;
  onKeyphraseChange: (params: { keyphrase: string }) => void;
};

/**
 * Hook for managing keyphrase/term state.
 * Syncs an external keyphrase prop to the search widget state.
 */
export const useKeyphraseState = ({
  externalKeyphrase,
  currentKeyphrase,
  onKeyphraseChange,
}: UseKeyphraseStateParams) => {
  const prevKeyphraseRef = useRef(currentKeyphrase);

  // Sync external keyphrase prop to widget state
  useEffect(() => {
    if (externalKeyphrase !== undefined && externalKeyphrase !== currentKeyphrase) {
      prevKeyphraseRef.current = currentKeyphrase;
      onKeyphraseChange({
        keyphrase: externalKeyphrase,
      });
    }
  }, [externalKeyphrase, currentKeyphrase, onKeyphraseChange]);
};
