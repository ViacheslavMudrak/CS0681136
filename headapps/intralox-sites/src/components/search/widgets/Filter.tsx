"use client";
import {
  getFacetConfigType,
  useSearchResultsActions,
  useSearchResultsConfig,
  useSearchResultsSelectedFilters,
} from "@sitecore-search/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "next/navigation";

interface ISelectedFacet {
  facetId: string;
  facetLabel: string;
  facetValueId: string;
  valueLabel: string;
}

const BELT_STYLE_LVL0_FACET_ID = "belt_style_lvl0";
const BELT_STYLE_LVL1_FACET_ID = "belt_style_lvl1";

const buildFacetLabel = (selectedFacet: ISelectedFacet): string => {
  return `${selectedFacet.valueLabel}`;
};

const buildFacetTitle = (selectedFacet: ISelectedFacet): string => {
  if (
    selectedFacet.facetId === BELT_STYLE_LVL0_FACET_ID ||
    selectedFacet.facetId === BELT_STYLE_LVL1_FACET_ID
  ) {
    return "Belt Style";
  }
  return selectedFacet.facetLabel;
};

const normalizeLabel = (value: string): string => value.trim().toLowerCase();

const getFacetValuesFromParams = (
  searchParams: URLSearchParams,
  facetName: string,
): string[] => {
  const rawValue = searchParams.get(facetName);
  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

const replaceSearchParamsInUrl = (nextParams: URLSearchParams): void => {
  const nextQuery = nextParams.toString();
  const nextUrl = nextQuery
    ? `${window.location.pathname}?${nextQuery}${window.location.hash}`
    : `${window.location.pathname}${window.location.hash}`;
  window.history.replaceState({}, "", nextUrl);
};

const Filter = () => {
  const selectedFacetsFromApi =
    useSearchResultsSelectedFilters() as ISelectedFacet[];
  const { onClearFilters, onFacetClick } = useSearchResultsActions();
  const config = useSearchResultsConfig();
  const searchParams = useSearchParams();
  const activeSearchTerm = searchParams.get("q")?.trim() || "";
  const hasSelectedFacets = selectedFacetsFromApi.length > 0;
  const hasActiveSearchTerm = Boolean(activeSearchTerm);
  const hasSelectedBeltStyleChild = selectedFacetsFromApi.some(
    (selectedFacet) => selectedFacet.facetId === BELT_STYLE_LVL1_FACET_ID,
  );
  const selectedFacetsForDisplay = selectedFacetsFromApi.filter((selectedFacet) => {
    if (!hasSelectedBeltStyleChild) return true;
    return selectedFacet.facetId !== BELT_STYLE_LVL0_FACET_ID;
  });

  const handleRemoveFilter = (selectedFacet: ISelectedFacet): void => {
    const nextParams = new URLSearchParams(searchParams.toString());
    const currentValues = getFacetValuesFromParams(
      nextParams,
      selectedFacet.facetId,
    );
    const nextValues = currentValues.filter(
      (value) =>
        normalizeLabel(value) !== normalizeLabel(selectedFacet.valueLabel),
    );

    if (nextValues.length > 0) {
      nextParams.set(selectedFacet.facetId, nextValues.join(","));
    } else {
      nextParams.delete(selectedFacet.facetId);
    }

    onFacetClick({
      facetId: selectedFacet.facetId,
      facetValueId: selectedFacet.facetValueId,
      type: getFacetConfigType(config, selectedFacet.facetId),
      checked: false,
    } as unknown as Parameters<typeof onFacetClick>[0]);
    replaceSearchParamsInUrl(nextParams);
  };

  const handleClearFilters = (): void => {
    const nextParams = new URLSearchParams(searchParams.toString());

    for (const selectedFacet of selectedFacetsFromApi) {
      nextParams.delete(selectedFacet.facetId);
    }
    nextParams.delete("q");

    onClearFilters();
    replaceSearchParamsInUrl(nextParams);
  };

  const handleRemoveSearchTerm = (): void => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("q");
    replaceSearchParamsInUrl(nextParams);
  };

  return hasSelectedFacets || hasActiveSearchTerm ? (
    <div className="w-full">
      <div className="flex flex-wrap gap-2.5 w-full">
        {selectedFacetsForDisplay.map((selectedFacet) => (
          <div
            key={`${selectedFacet.facetId}${selectedFacet.facetLabel}${selectedFacet.valueLabel}`}
            className="inline-flex border border-stroke-default rounded text-xs leading-none cursor-pointer "
          >
            <div className="p-1.5 uppercase text-ink-secondary font-medium bg-surface-muted">
              {buildFacetTitle(selectedFacet)}
            </div>
            <div className="p-1.5 text-ink-primary border-l">
              {buildFacetLabel(selectedFacet)}
              <button onClick={() => handleRemoveFilter(selectedFacet)}>
                <FontAwesomeIcon
                  icon={faXmark}
                  className="text-[10px] ml-1.5"
                />
              </button>
            </div>
          </div>
        ))}
        {hasActiveSearchTerm && (
          <div className="inline-flex border border-stroke-default rounded text-xs leading-none">
            <div className="p-1.5 uppercase text-ink-secondary font-medium bg-surface-muted">
              Search Term
            </div>
            <div className="p-1.5 text-ink-primary border-l">
              {activeSearchTerm}
              <button onClick={handleRemoveSearchTerm}>
                <FontAwesomeIcon
                  icon={faXmark}
                  className="text-[10px] ml-1.5"
                />
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mb-6 mt-3 text-xs [ul+*]:block">
        <span className="text-ink-subtle">
          The series shown have belt styles matching the selected criteria.
        </span>
        <button
          onClick={handleClearFilters}
          className="leading-normal items-center w-fit text-action-link hover:text-action focus:text-action focus:outline-hidden focus-visible:ring active:text-action-active visited:text-action-visited disabled:text-action-disabled disabled:cursor-default underline hover:no-underline"
        >
          Reset
        </button>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default Filter;
