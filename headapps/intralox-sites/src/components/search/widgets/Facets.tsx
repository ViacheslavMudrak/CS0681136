"use client";

import {
  getFacetConfigType,
  useSearchResultsActions,
  useSearchResultsConfig,
  useSearchResultsSelectedFilters,
} from "@sitecore-search/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ICheckedFacets } from "../SearchComponent.type";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IFacets {
  name: string;
  label: string;
  value: IValue[];
}

export interface IValue {
  id: string;
  text: string;
  count?: number;
}

const FILTER_BAR_LABEL = "Filter by";
const CLEAR_FILTERS_LABEL = "Clear all";
const DEFAULT_VISIBLE_FACET_ITEMS = 7;

function normalizeLabel(label: string): string {
  return label.trim().toLowerCase();
}

function syncFacetQueryParam(facetName: string, valueTexts: string[]): void {
  const currentUrl = new URL(window.location.href);
  const searchParams = currentUrl.searchParams;
  if (valueTexts.length === 0) {
    searchParams.delete(facetName);
  } else {
    searchParams.set(facetName, valueTexts.join(","));
  }
  window.history.pushState({}, "", currentUrl.toString());
}

function desiredFacetLabelsFromParams(
  facetName: string,
  params: URLSearchParams,
): string[] {
  const raw = params.get(facetName);
  if (!raw) return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];
  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Resolves a facet bucket option id from URL display text (`URLSearchParams` already decodes `+` to spaces).
 */
function facetValueIdForLabel(values: IValue[], label: string): string {
  const normalized = normalizeLabel(label);
  if (!normalized) return "";
  const byExact = values.find((v) => normalizeLabel(v.text) === normalized);
  if (byExact) return byExact.id;
  return "";
}

function areSameSelections(current: string[], desired: string[]): boolean {
  if (current.length !== desired.length) return false;
  const currentSet = new Set(current);
  return desired.every((item) => currentSet.has(item));
}

export function Facets({ facets }: { facets: IFacets[] }): JSX.Element | null {
  const searchParams = useSearchParams();
  const { onFacetClick, onClearFilters } = useSearchResultsActions();
  const config = useSearchResultsConfig();
  const selectedFacetsFromApi = useSearchResultsSelectedFilters();
  const router = useRouter();
  const pathname = usePathname();

  const filterableFacets = useMemo(
    () => facets.filter((f: IFacets) => f.name !== "price"),
    [facets],
  );

  const selectedByFacetId = useMemo(() => {
    const map = new Map<string, ICheckedFacets[]>();
    for (const item of selectedFacetsFromApi as ICheckedFacets[]) {
      const list = map.get(item.facetId);
      if (list) list.push(item);
      else map.set(item.facetId, [item]);
    }
    return map;
  }, [selectedFacetsFromApi]);

  const [expandedFacetNames, setExpandedFacetNames] = useState<string[]>([]);

  const getSelectedValueIds = useCallback(
    (facetId: string): string[] =>
      selectedByFacetId.get(facetId)?.map((item) => item.facetValueId) ?? [],
    [selectedByFacetId],
  );

  const handleFacetValueToggle = (
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
  };

  const handleClearFilters = (): void => {
    const nextParams = new URLSearchParams(searchParams.toString());
    // Remove only filter params, preserve Sitecore preview params
    for (const facet of facets) {
      nextParams.delete(facet.name);
    }
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    onClearFilters?.();
  };

  useEffect(() => {
    if (filterableFacets.length === 0) return;

    const params = new URLSearchParams(searchParams.toString());

    for (const facet of filterableFacets) {
      if (!facet.value?.length) continue;

      const desiredIds = desiredFacetLabelsFromParams(facet.name, params)
        .map((label) => facetValueIdForLabel(facet.value, label))
        .filter(Boolean);
      const currentIds = getSelectedValueIds(facet.name);

      if (areSameSelections(currentIds, desiredIds)) continue;

      const type = getFacetConfigType(config, facet.name);
      const currentlySelected = getSelectedValueIds(facet.name);

      for (const facetValueId of currentlySelected) {
        onFacetClick({
          facetId: facet.name,
          facetValueId,
          type,
          checked: false,
        } as unknown as Parameters<typeof onFacetClick>[0]);
      }

      for (const desiredId of desiredIds) {
        onFacetClick({
          facetId: facet.name,
          facetValueId: desiredId,
          type,
          checked: true,
        } as unknown as Parameters<typeof onFacetClick>[0]);
      }
    }
  }, [
    filterableFacets,
    searchParams,
    selectedByFacetId,
    config,
    onFacetClick,
    getSelectedValueIds,
  ]);

  const toggleFacetExpansion = (facetName: string): void => {
    setExpandedFacetNames((previous) =>
      previous.includes(facetName)
        ? previous.filter((name) => name !== facetName)
        : [...previous, facetName],
    );
  };

  if (filterableFacets.length === 0) {
    return null;
  }

  return (
    <>
      {filterableFacets.map((facet) => {
        const selectedIds = getSelectedValueIds(facet.name);
        const isExpanded = expandedFacetNames.includes(facet.name);
        const selectedCount = selectedIds.length;
        const visibleItems = isExpanded
          ? facet.value
          : facet.value.slice(0, DEFAULT_VISIBLE_FACET_ITEMS);
        const canToggleVisibility =
          facet.value.length > DEFAULT_VISIBLE_FACET_ITEMS;

        return (
          <div key={facet.name} className="w-full flex flex-col gap-2.5">
            <h3 className="uppercase tracking-wide font-bold text-ink-muted text-sm/tight leading-4 flex">
              {facet.label}
            </h3>

            <ul
              id={`${facet.name}-options`}
              className="!m-0 !p-0 flex flex-col gap-1 w-full"
              role="group"
              aria-label={facet.label}
            >
              {visibleItems.map((value) => {
                const isChecked = selectedIds.includes(value.id);

                return (
                  <li key={value.id} className="flex flex-col text-sm !m-0">
                    <label className="group flex gap-2 cursor-pointer">
                      <div className="flex self-start items-center h-lh">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(event) =>
                            handleFacetValueToggle(
                              facet,
                              value.id,
                              event.target.checked,
                            )
                          }
                          className="absolute opacity-0"
                        />
                        <span
                          className={`flex shrink-0 items-center justify-center border rounded-xs h-4 w-4 group-focus:ring group-focus:border-stroke-input-focus [&_svg]:stroke-[4px] ${isChecked ? "bg-stroke-input-focus border-stroke-input-focus [&_svg]:text-surface" : "bg-surface"}`}
                        >
                          {isChecked && (
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-xs"
                            />
                          )}
                        </span>
                      </div>
                      <div className="flex items-start justify-between w-full gap-[1.25em]">
                        <div>
                          <span className="text-sm text-ink-primary">
                            {value.text}
                          </span>
                        </div>
                        {typeof value.count === "number" && (
                          <span className="inline-block shrink-0 text-[0.866em] min-w-[1.333em] align-[0.0625em] text-center rounded inline-block bg-black/10 px-[0.25em] text-ink-secondary">
                            {value.count}
                          </span>
                        )}
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>

            {canToggleVisibility && (
              <button
                type="button"
                onClick={() => toggleFacetExpansion(facet.name)}
                className="mt-2 text-font-normal text-menu-hover-color underline transition-colors duration-150 hover:text-menu-active-color hover:no-underline focus:outline-none focus:ring-2 focus:ring-border-basic-color"
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        );
      })}
    </>
  );
}
