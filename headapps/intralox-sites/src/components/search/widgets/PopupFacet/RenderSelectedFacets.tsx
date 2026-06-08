"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import { useSearchResultsSelectedFilters } from "@sitecore-search/react";
import { ICheckedFacets } from "components/search/SearchComponent.type";
import { IRenderSelectedFacets } from "./PopupFacet.types";

export const RenderSelectedFacets = (props: IRenderSelectedFacets) => {
  const { handleRemoveSelectedFacet, handleClearFilters } = props;

  const selectedFacetsFromApi = useSearchResultsSelectedFilters();

  return (
    <div className="ml-4 mr-2 mt-2 flex flex-col gap-2 self-start">
      <div className="flex flex-wrap gap-2">
        {(selectedFacetsFromApi as ICheckedFacets[]).map((selected) => (
          <div
            key={`${selected.facetId}-${selected.facetValueId}`}
            className="inline-flex overflow-hidden rounded border border-border-gray text-xs leading-none"
          >
            <span className="border-r border-border-gray bg-[#f8f8f8] px-[6px] py-[6px] font-medium uppercase text-gray-700 ">
              {selected.facetLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-bg-basic-color px-[6px] py-[6px] text-gray-900">
              {selected.valueLabel}
              <button
                type="button"
                aria-label={`Remove ${selected.valueLabel} filter`}
                className="leading-none text-text-basic cursor-pointer hover:text-text-heading-color focus:text-text-heading-color focus:outline-none focus-visible:ring-2 focus-visible:ring-border-basic-color"
                onClick={() => handleRemoveSelectedFacet(selected)}
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  className="text-[10px] ml-1.5 text-gray-500"
                  aria-hidden
                />
              </button>
            </span>
          </div>
        ))}
      </div>
      <div className="text-xs">
        <span className="text-gray-600">
          The series shown have belt styles matching the selected criteria.{" "}
        </span>
        <button
          type="button"
          className="leading-normal items-center w-fit text-action-link hover:text-action focus:text-action focus:outline-hidden focus-visible:ring active:text-action-active visited:text-action-visited disabled:text-action-disabled disabled:cursor-default underline hover:no-underline cursor-pointer"
          onClick={handleClearFilters}
        >
          Reset
        </button>
      </div>
    </div>
  );
};
