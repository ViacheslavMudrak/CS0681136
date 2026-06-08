"use client";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
  getFacetConfigType,
  useSearchResultsActions,
  useSearchResultsConfig,
  useSearchResultsSelectedFilters,
} from "@sitecore-search/react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ChangeEvent, JSX } from "react";
import { useCallback, useEffect, useMemo } from "react";
import { cn } from "lib/utils";
import { ICheckedFacets } from "../SearchComponent.type";

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

const FILTER_BAR_LABEL = "FILTER";

function placeholderLabel(facetLabel: string): string {
  return `Select ${facetLabel}`;
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

function desiredFacetLabelFromParams(
  facetName: string,
  params: URLSearchParams,
): string | undefined {
  const raw = params.get(facetName);
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const first = trimmed.split(",")[0]?.trim();
  return first || undefined;
}

/**
 * Resolves a facet bucket option id from URL display text (`URLSearchParams` already decodes `+` to spaces).
 */
function facetValueIdForLabel(values: IValue[], label: string): string {
  const normalized = label.trim();
  if (!normalized) return "";
  const lower = normalized.toLowerCase();
  const byExact = values.find((v) => v.text.trim() === normalized);
  if (byExact) return byExact.id;
  const byCaseFold = values.find((v) => v.text.trim().toLowerCase() === lower);
  return byCaseFold?.id ?? "";
}

export function DropdownFacets({
  facets,
}: {
  facets: IFacets[];
}): JSX.Element | null {
  const searchParams = useSearchParams();
  const { onFacetClick, onClearFilters } = useSearchResultsActions();
  const config = useSearchResultsConfig();
  const selectedFacetsFromApi = useSearchResultsSelectedFilters();
  const router = useRouter();
  const pathname = window.location.pathname;

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

  const getSingleSelectedValueId = useCallback(
    (facetId: string): string => {
      const list = selectedByFacetId.get(facetId);
      return list?.length === 1 ? list[0].facetValueId : "";
    },
    [selectedByFacetId],
  );

  const handleFacetChange = (
    facet: IFacets,
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const newId = event.target.value;
    const type = getFacetConfigType(config, facet.name);
    const currentlySelected =
      selectedByFacetId.get(facet.name)?.map((s) => s.facetValueId) ?? [];

    for (const facetValueId of currentlySelected) {
      onFacetClick({
        facetId: facet.name,
        facetValueId,
        type,
        checked: false,
      } as unknown as Parameters<typeof onFacetClick>[0]);
    }

    if (newId) {
      onFacetClick({
        facetId: facet.name,
        facetValueId: newId,
        type,
        checked: true,
      } as unknown as Parameters<typeof onFacetClick>[0]);
      const item = facet.value.find((v) => v.id === newId);
      syncFacetQueryParam(facet.name, item ? [item.text] : []);
    } else {
      syncFacetQueryParam(facet.name, []);
    }
  };

  const handleClearFilters = () => {
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

      const label = desiredFacetLabelFromParams(facet.name, params);
      const desiredId = label ? facetValueIdForLabel(facet.value, label) : "";
      const currentId = getSingleSelectedValueId(facet.name);

      if (desiredId === currentId) continue;

      const type = getFacetConfigType(config, facet.name);
      const currentlySelected =
        selectedByFacetId.get(facet.name)?.map((s) => s.facetValueId) ?? [];

      for (const facetValueId of currentlySelected) {
        onFacetClick({
          facetId: facet.name,
          facetValueId,
          type,
          checked: false,
        } as unknown as Parameters<typeof onFacetClick>[0]);
      }

      if (desiredId) {
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
    getSingleSelectedValueId,
  ]);

  if (filterableFacets.length === 0) {
    return null;
  }

  return (
    <div
      className="mt-8 flex flex-col items-start gap-4 md:flex-row md:items-center"
      role="toolbar"
      aria-label="Search filters"
    >
      <span className="shrink text-sm font-bold uppercase text-ink-subtle">
        {FILTER_BAR_LABEL}
      </span>
      {filterableFacets.map((f) => {
        const selectValue = getSingleSelectedValueId(f.name);
        const placeholder = placeholderLabel(f.label);

        return (
          <div
            key={f.name}
            className="w-full sm:w-initial sm:flex-[1_0_0] lg:flex-[0_0_240px]"
          >
            <select
              className={cn(
                "px-3 w-full py-2 text-base leading-none bg-bg-lighter-gray border border-neutral-200 rounded-xs",
                selectValue ? "text-ink-primary" : "text-ink-subtle",
              )}
              value={selectValue}
              aria-label={f.label}
              onChange={(event) => {
                handleFacetChange(f, event);
                event.target.blur();
              }}
            >
              <option value="" className="text-ink-tertiary">
                {placeholder}
              </option>
              {f.value.map((v) => (
                <option className="text-ink-primary" key={v.id} value={v.id}>
                  {v.text}
                  {/* {v.count != null ? ` (${v.count})` : ""} */}
                </option>
              ))}
            </select>
          </div>
        );
      })}
      {selectedFacetsFromApi.length > 0 && (
        <button
          onClick={handleClearFilters}
          className="text-action-link underline transition-colors duration-150 hover:text-action hover:no-underline hover:outline-none focus:text-action focus:no-underline focus:outline-none"
        >
          Clear
        </button>
      )}
    </div>
  );
}
