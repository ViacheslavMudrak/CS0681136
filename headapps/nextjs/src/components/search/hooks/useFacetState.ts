import { useEffect, useRef, useState, useCallback } from 'react';
import type { SearchResponseFacet } from '@sitecore-search/react';
import type { SearchResultsStoreSelectedFacets } from '@sitecore-search/widgets';

type UseFacetStateParams = {
  keyphrase: string;
  selectedFacets: SearchResultsStoreSelectedFacets;
  facets: SearchResponseFacet[];
  isLoading: boolean;
  isFetching: boolean;
  onFacetClick: (params: {
    facetId: string;
    facetValueId: string;
    checked: boolean;
    facetIndex: number;
    facetValueIndex: number;
    type: 'valueId';
  }) => void;
};

/**
 * Hook for managing facet state including query string synchronization and restoration.
 * Handles:
 * - Reading facets from URL query string
 * - Restoring facets from query string on initial load or keyphrase change
 * - Syncing selected facets to query string
 */
export const useFacetState = ({
  keyphrase,
  selectedFacets,
  facets,
  isLoading,
  isFetching,
  onFacetClick,
}: UseFacetStateParams) => {
  // Track previous keyphrase to detect changes
  const prevKeyphraseRef = useRef(keyphrase);
  // Track if we've done initial restoration (using state for reactivity)
  const [hasRestored, setHasRestored] = useState(false);

  /**
   * Reads facets from the URL query string and converts them to selected facets format.
   * Uses lowercase labels for case-insensitive matching.
   */
  const getFacetsFromQueryString = useCallback(
    (availableFacets: SearchResponseFacet[]): SearchResultsStoreSelectedFacets => {
      if (typeof window === 'undefined') return [];

      const urlParams = new URLSearchParams(window.location.search);
      const facetMap: Record<string, string[]> = {};

      for (const [key, value] of urlParams.entries()) {
        if (key.startsWith('f.')) {
          const facetLabel = key.substring(2).toLowerCase();
          if (!facetMap[facetLabel]) {
            facetMap[facetLabel] = [];
          }
          facetMap[facetLabel].push(value.toLowerCase());
        }
      }

      // Convert lowercase labels to IDs by doing case-insensitive lookup in the facets response
      if (availableFacets.length === 0) return [];

      return Object.entries(facetMap).flatMap(([facetLabelLower, valueLabelsLower]) => {
        // Case-insensitive facet label match
        const facet = availableFacets.find((f) => f.label.toLowerCase() === facetLabelLower);
        if (!facet) return [];

        return valueLabelsLower
          .map((valueLabelLower) => {
            // Case-insensitive value label match
            const facetValue = facet.value.find((v) => v.text.toLowerCase() === valueLabelLower);
            if (!facetValue) return null;
            return {
              facetId: facet.name,
              facetValueId: facetValue.id,
            } as SearchResultsStoreSelectedFacets[number];
          })
          .filter((f): f is SearchResultsStoreSelectedFacets[number] => f !== null);
      });
    },
    []
  );

  /**
   * Updates the URL query string with the current selected facets.
   * Uses lowercase labels for consistency.
   */
  const updateQueryStringWithFacets = useCallback(
    (facetsToSync: SearchResultsStoreSelectedFacets, availableFacets: SearchResponseFacet[]) => {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);

      // Remove all existing facet params
      const keysToRemove: string[] = [];
      for (const key of urlParams.keys()) {
        if (key.startsWith('f.')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => urlParams.delete(key));

      // Add current selectedFacets using lowercase labels
      facetsToSync.forEach((facet) => {
        if ('facetValueId' in facet && facet.facetValueId) {
          // Use facetLabel and valueLabel if available, otherwise look them up
          let facetLabel: string | undefined = facet.facetLabel;
          let valueLabel: string | undefined = facet.valueLabel;

          if (!facetLabel || !valueLabel) {
            // Fallback: look up labels from facets response
            const facetInResponse = availableFacets.find((f) => f.name === facet.facetId);
            if (facetInResponse) {
              const valueInResponse = facetInResponse.value.find(
                (v) => v.id === facet.facetValueId
              );
              if (valueInResponse) {
                facetLabel = facetInResponse.label;
                valueLabel = valueInResponse.text;
              }
            }
          }

          if (facetLabel && valueLabel) {
            // Convert to lowercase for URL
            urlParams.append(`f.${facetLabel.toLowerCase()}`, valueLabel.toLowerCase());
          }
        }
      });

      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.history.replaceState({}, '', newUrl);
    },
    []
  );

  // Restore selectedFacets from query string after keyphrase change or initial load
  // Wait for search results to load so facet labels are available
  useEffect(() => {
    const keyphraseChanged = prevKeyphraseRef.current !== keyphrase;

    // Reset restoration flag when keyphrase changes so we can restore again
    if (keyphraseChanged) {
      setHasRestored(false);
    }

    prevKeyphraseRef.current = keyphrase;
    const isInitialLoad = !hasRestored;

    // Restore if:
    // 1. Initial load (haven't restored yet) AND facets are loaded AND selectedFacets is empty, OR
    // 2. Keyphrase changed AND facets were cleared AND results have loaded
    // This prevents restoring when user intentionally deselects facets
    const shouldRestore =
      !isLoading &&
      !isFetching &&
      facets.length > 0 &&
      selectedFacets.length === 0 &&
      !hasRestored &&
      (isInitialLoad || keyphraseChanged);

    if (shouldRestore) {
      const queryFacets = getFacetsFromQueryString(facets);
      // Mark as restored immediately to prevent query string sync from clearing it
      setHasRestored(true);

      if (queryFacets.length > 0) {
        // Facets exist in query string but not in widget state - restore them
        // Find matching facets in the response to get proper indices
        queryFacets.forEach((facet) => {
          if ('facetValueId' in facet && facet.facetValueId) {
            // Find the facet and value in the response to get correct indices
            const facetInResponse = facets.find((f) => f.name === facet.facetId);
            if (facetInResponse) {
              const valueIndex = facetInResponse.value.findIndex(
                (v) => v.id === facet.facetValueId
              );
              if (valueIndex >= 0) {
                const facetIndex = facets.findIndex((f) => f.name === facet.facetId);
                onFacetClick({
                  facetId: facet.facetId,
                  facetValueId: facet.facetValueId,
                  checked: true,
                  facetIndex,
                  facetValueIndex: valueIndex,
                  type: 'valueId',
                });
              }
            }
          }
        });
      }
    }
  }, [
    keyphrase,
    selectedFacets,
    onFacetClick,
    isLoading,
    isFetching,
    facets,
    getFacetsFromQueryString,
    hasRestored,
  ]);

  // Update query string when selectedFacets changes (using labels)
  // Skip if we haven't restored yet to avoid clearing the query string before restoration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Don't clear query string if we haven't restored yet (might be restoring from URL)
    if (!hasRestored && selectedFacets.length === 0) {
      return;
    }

    updateQueryStringWithFacets(selectedFacets, facets);
  }, [selectedFacets, facets, hasRestored, updateQueryStringWithFacets]);
};
