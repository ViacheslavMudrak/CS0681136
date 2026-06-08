"use client";

import { faFilter, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  getFacetConfigType,
  useSearchResultsActions,
  useSearchResultsConfig,
  useSearchResultsSelectedFilters,
} from "@sitecore-search/react";
import { Popover } from "@laitram-l-l-c/intralox-ui-components";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Button as AriaButton,
  Dialog,
  DialogTrigger,
} from "react-aria-components";
import type { ChangeEvent, JSX } from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { ICheckedFacets } from "../../SearchComponent.type";
import {
  areSameSelections,
  buildSelectedFacetMap,
  desiredFacetLabelsFromParams,
  desiredSingleFacetLabelFromParams,
  facetValueIdForLabel,
  isSingleSelectFacetType,
  normalizeSearchParamsKey,
  readBrowserSearchParamsKey,
  syncFacetQueryParam,
} from "./PopupFacets.utils";
import { RenderFacetList } from "./RenderFacetList";
import { RenderSelectedFacets } from "./RenderSelectedFacets";
import { IFacets, IPopupFacetProps } from "./PopupFacet.types";

export function PopupFacet({ facets }: IPopupFacetProps): JSX.Element | null {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { onFacetClick, onClearFilters } = useSearchResultsActions();
  const config = useSearchResultsConfig();
  const selectedFacetsFromApi = useSearchResultsSelectedFilters();

  const filterableFacets = useMemo(
    () => facets.filter((facet) => facet.name !== "price"),
    [facets],
  );

  const selectedByFacetId = useMemo(
    () => buildSelectedFacetMap(selectedFacetsFromApi as ICheckedFacets[]),
    [selectedFacetsFromApi],
  );

  const selectedFacetsRef = useRef(selectedFacetsFromApi);
  selectedFacetsRef.current = selectedFacetsFromApi;

  const onFacetClickRef = useRef(onFacetClick);
  onFacetClickRef.current = onFacetClick;

  const filterableFacetsRef = useRef(filterableFacets);
  filterableFacetsRef.current = filterableFacets;

  const configRef = useRef(config);
  configRef.current = config;

  const lastSyncedSearchParamsRef = useRef<string | null>(null);
  const searchParamsKey = normalizeSearchParamsKey(searchParams.toString());
  const hasFilterableFacets = filterableFacets.length > 0;

  const getSelectedValueIds = useCallback(
    (facetId: string): string[] =>
      selectedByFacetId.get(facetId)?.map((item) => item.facetValueId) ?? [],
    [selectedByFacetId],
  );

  const handleCheckboxToggle = (
    facet: IFacets,
    facetValueId: string,
    isChecked: boolean,
  ): void => {
    const type = getFacetConfigType(config, facet.name);
    onFacetClick({
      facetId: facet.name,
      facetValueId,
      type,
      checked: isChecked,
    } as unknown as Parameters<typeof onFacetClick>[0]);

    const selectedNow = getSelectedValueIds(facet.name);
    const selectedSet = new Set(selectedNow);
    if (isChecked) selectedSet.add(facetValueId);
    else selectedSet.delete(facetValueId);

    const selectedTexts = facet.value
      .filter((item) => selectedSet.has(item.id))
      .map((item) => item.text);
    syncFacetQueryParam(facet.name, selectedTexts);
    lastSyncedSearchParamsRef.current = readBrowserSearchParamsKey();
  };

  const handleRemoveSelectedFacet = (selected: ICheckedFacets): void => {
    const facet = filterableFacets.find((f) => f.name === selected.facetId);
    if (!facet) return;
    handleCheckboxToggle(facet, selected.facetValueId, false);
  };

  const handleClearFilters = (): void => {
    const nextParams = new URLSearchParams(searchParams.toString());
    for (const facet of filterableFacets) {
      nextParams.delete(facet.name);
    }
    const nextQuery = normalizeSearchParamsKey(nextParams.toString());
    lastSyncedSearchParamsRef.current = nextQuery;
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    onClearFilters?.();
  };

  useEffect(() => {
    if (!hasFilterableFacets) return;
    if (lastSyncedSearchParamsRef.current === searchParamsKey) return;

    const facets = filterableFacetsRef.current;
    const params = new URLSearchParams(searchParamsKey);
    const selectedMap = buildSelectedFacetMap(
      selectedFacetsRef.current as ICheckedFacets[],
    );
    const getCurrentValueIds = (facetId: string): string[] =>
      selectedMap.get(facetId)?.map((item) => item.facetValueId) ?? [];
    const getSingleCurrentValueId = (facetId: string): string => {
      const list = selectedMap.get(facetId);
      return list?.length === 1 ? list[0].facetValueId : "";
    };
    const applyFacetClick = (payload: unknown): void => {
      onFacetClickRef.current(payload as Parameters<typeof onFacetClick>[0]);
    };

    for (const facet of facets) {
      if (!facet.value?.length) continue;

      const facetType = getFacetConfigType(configRef.current, facet.name);
      const isSingleSelect = isSingleSelectFacetType(String(facetType));
      const type = facetType;

      if (isSingleSelect) {
        const label = desiredSingleFacetLabelFromParams(facet.name, params);
        const desiredId = label ? facetValueIdForLabel(facet.value, label) : "";
        const currentId = getSingleCurrentValueId(facet.name);
        if (desiredId === currentId) continue;

        for (const facetValueId of getCurrentValueIds(facet.name)) {
          applyFacetClick({
            facetId: facet.name,
            facetValueId,
            type,
            checked: false,
          } as unknown as Parameters<typeof onFacetClick>[0]);
        }

        if (desiredId) {
          applyFacetClick({
            facetId: facet.name,
            facetValueId: desiredId,
            type,
            checked: true,
          } as unknown as Parameters<typeof onFacetClick>[0]);
        }
        continue;
      }

      const desiredIds = desiredFacetLabelsFromParams(facet.name, params)
        .map((label) => facetValueIdForLabel(facet.value, label))
        .filter(Boolean);
      const currentIds = getCurrentValueIds(facet.name);
      if (areSameSelections(currentIds, desiredIds)) continue;

      for (const facetValueId of currentIds) {
        applyFacetClick({
          facetId: facet.name,
          facetValueId,
          type,
          checked: false,
        } as unknown as Parameters<typeof onFacetClick>[0]);
      }

      for (const desiredId of desiredIds) {
        applyFacetClick({
          facetId: facet.name,
          facetValueId: desiredId,
          type,
          checked: true,
        } as unknown as Parameters<typeof onFacetClick>[0]);
      }
    }

    lastSyncedSearchParamsRef.current = searchParamsKey;
  }, [searchParamsKey, hasFilterableFacets]);

  if (filterableFacets.length === 0) {
    return null;
  }

  const hasActiveFilters = selectedFacetsFromApi.length > 0;

  return (
    <div className="flex flex-wrap items-start gap-y-2 mt-6">
      <DialogTrigger>
        <AriaButton
          className="text-sm leading-tight px-3 py-3 min-w-28 rounded-full transition-colors duration-150 flex flex-row justify-center items-center gap-1 hover:cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-border-basic-color disabled:pointer-events-none bg-bg-basic-color text-menu-hover-color hover:bg-bg-light-gray-active hover:text-menu-active-color active:bg-bg-light-gray-active active:text-menu-active-color disabled:bg-bg-light-gray-active disabled:text-text-basic border border-border-gray"
          aria-label="Product filters"
        >
          <FontAwesomeIcon icon={faFilter} aria-hidden />
          Filter
        </AriaButton>
        <Popover
          className="z-[100] max-w-64 w-full max-h-[60vh] max-h-[60dvh] overflow-y-auto rounded-lg border border-border-gray bg-bg-basic-color shadow-lg"
          includeArrow={true}
        >
          <Dialog className="outline-none">
            <RenderFacetList
              filterableFacets={filterableFacets}
              handleCheckboxToggle={handleCheckboxToggle}
            />
          </Dialog>
        </Popover>
      </DialogTrigger>

      {hasActiveFilters && (
        <RenderSelectedFacets
          handleClearFilters={handleClearFilters}
          handleRemoveSelectedFacet={handleRemoveSelectedFacet}
        />
      )}
    </div>
  );
}
