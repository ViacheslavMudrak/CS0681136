"use client";

import {
  getFacetConfigType,
  useSearchResultsActions,
  useSearchResultsConfig,
  useSearchResultsSelectedFilters,
} from "@sitecore-search/react";

import {
  buildSelectedFacetMap,
  isSingleSelectFacetType,
  readBrowserSearchParamsKey,
  syncFacetQueryParam,
} from "./PopupFacets.utils";
import { ChangeEvent, useCallback, useMemo, useRef } from "react";
import { ICheckedFacets } from "components/search/SearchComponent.type";
import { IFacets, IRenderFacetList } from "./PopupFacet.types";

export const RenderFacetList = (props: IRenderFacetList) => {
  const { filterableFacets, handleCheckboxToggle } = props;
  const config = useSearchResultsConfig();

  const selectedFacetsFromApi = useSearchResultsSelectedFilters();
  const { onFacetClick, onClearFilters } = useSearchResultsActions();
  const lastSyncedSearchParamsRef = useRef<string | null>(null);

  const selectedByFacetId = useMemo(
    () => buildSelectedFacetMap(selectedFacetsFromApi as ICheckedFacets[]),
    [selectedFacetsFromApi],
  );

  const getSelectedValueIds = useCallback(
    (facetId: string): string[] =>
      selectedByFacetId.get(facetId)?.map((item) => item.facetValueId) ?? [],
    [selectedByFacetId],
  );

  const getSingleSelectedValueId = useCallback(
    (facetId: string): string => {
      const list = selectedByFacetId.get(facetId);
      return list?.length === 1 ? list[0].facetValueId : "";
    },
    [selectedByFacetId],
  );

  const handleSelectChange = (
    facet: IFacets,
    event: ChangeEvent<HTMLSelectElement>,
  ): void => {
    const newId = event.target.value;
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

    if (newId) {
      onFacetClick({
        facetId: facet.name,
        facetValueId: newId,
        type,
        checked: true,
      } as unknown as Parameters<typeof onFacetClick>[0]);
      const item = facet.value.find((value) => value.id === newId);
      syncFacetQueryParam(facet.name, item ? [item.text] : []);
    } else {
      syncFacetQueryParam(facet.name, []);
    }
    lastSyncedSearchParamsRef.current = readBrowserSearchParamsKey();
  };

  return (
    <div className="grid gap-2.5 self-start justify-items-start p-3 bg-white">
      {filterableFacets.map((facet) => {
        const facetType = getFacetConfigType(config, facet.name);
        const isSingleSelect = isSingleSelectFacetType(String(facetType));

        if (isSingleSelect) {
          const selectValue = getSingleSelectedValueId(facet.name);
          return (
            <div key={facet.name} className="flex w-full flex-col gap-2">
              <p
                className={`uppercase tracking-wide font-bold text-gray-700 text-sm/tight leading-4 block`}
              >
                {facet.label}
              </p>
              <div className="flex w-full flex-col gap-2">
                <select
                  className={`w-full px-3 py-2 border rounded-xs bg-white placeholder:text-gray-500 text-gray-900 text-base leading-tight focus:border-action-focus focus:outline-hidden focus-visible:ring disabled:bg-gray-100 disabled:text-gray-700 border-gray-300 ${selectValue ? "text-gray-900" : "text-gray-500"}`}
                  value={selectValue}
                  aria-label={facet.label}
                  onChange={(event) => handleSelectChange(facet, event)}
                >
                  <option value="">Select an Item</option>
                  {facet.value.map((value) => (
                    <option key={value.id} value={value.id}>
                      {value.text}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        }

        const selectedIds = getSelectedValueIds(facet.name);

        return (
          <div key={facet.name} className="flex w-full flex-col gap-2.5">
            <p
              className={`uppercase tracking-wide font-bold text-gray-700 text-sm/tight leading-4 flex`}
            >
              {facet.label}
            </p>
            <ul
              className="m-0 flex w-full list-none flex-col gap-1 p-0 pr-[12px]"
              role="group"
              aria-label={facet.label}
            >
              {facet.value.map((value) => {
                const isChecked = selectedIds.includes(value.id);
                return (
                  <li key={value.id} className="flex flex-col text-sm">
                    <label className="group flex cursor-pointer gap-2">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(event) =>
                            handleCheckboxToggle(
                              facet,
                              value.id,
                              event.target.checked,
                            )
                          }
                          className="h-4 w-4 cursor-pointer rounded-xs border border-gray-300 accent-menu-hover-color"
                        />
                      </span>
                      <span className="flex w-full justify-between gap-[1.25em]">
                        <span
                          className={
                            isChecked
                              ? "font-medium text-gray-900 text-[14px]"
                              : "text-gray-700 text-[14px]"
                          }
                        >
                          {value.text}
                        </span>
                        {typeof value.count === "number" ? (
                          <span
                            className={`text-[0.866em] min-w-[1.333em] align-[0.0625em] text-center rounded inline-block bg-black/10 px-[0.25em] text-gray-700 shrink-0`}
                          >
                            {value.count}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};
