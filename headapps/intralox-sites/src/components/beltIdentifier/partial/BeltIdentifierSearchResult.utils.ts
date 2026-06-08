import { FilterEqual } from "@sitecore-search/react";

import type { ICheckedFacets } from "components/search/SearchComponent.type";

import type {
  IFacet,
  IFacetValue,
  IRenderableCard,
  IRouteCardItem,
} from "./BeltIdentifierSearchResult.types";

export const SEARCH_ENV_FILTER = process.env.NEXT_PUBLIC_SEARCH_ENV?.trim();
export const BASE_PRODUCT_TYPE = "Belts";
export const TECHNOLOGY_FACET_NAME = "technology";
export const BELT_TYPE_FACET_NAME = "belt_type";
export const BELT_SERIES_FACET_NAME = "belt_series";
export const BELT_PITCH_US_FACET_NAME = "belt_pitch_range_us";
export const BELT_PITCH_METRIC_FACET_NAME = "belt_pitch_range_metric";
export const ACTIVE_FACET_CLASS = "active";

const SERIES_COUNT_PLACEHOLDER = "{{SERIES_COUNT}}";
const ITEM_LINK_PLACEHOLDER = "{{ITEM_LINK}}";

export const normalizeLabel = (value?: string): string =>
  (value || "").trim().toLowerCase();

export const toSlug = (value?: string): string =>
  normalizeLabel(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const toQueryToken = (value?: string): string =>
  toSlug(value).replaceAll("-", "_");

export const toRangeQueryValue = (value?: string): string =>
  (value || "").trim().replace(/\s*-\s*/g, "-");

export const removePathSegment = (
  path: string,
  segmentToRemove: string,
): string => {
  const segments = path.split("/").filter(Boolean);
  const filteredSegments = segments.filter(
    (segment) => segment !== segmentToRemove,
  );
  return `/${filteredSegments.join("/")}`;
};

export const applyMessageTemplate = (
  template: string | undefined,
  seriesCount: number,
  itemLink: string,
): string =>
  (template || "")
    .replaceAll(SERIES_COUNT_PLACEHOLDER, String(seriesCount))
    .replaceAll(ITEM_LINK_PLACEHOLDER, itemLink);

export const getFacetByName = (
  facets: IFacet[],
  facetName: string,
): IFacet | undefined =>
  facets.find(
    (facet) => normalizeLabel(facet.name) === normalizeLabel(facetName),
  );

export const buildSelectedFacetFilters = (
  selectedFacetItems: ICheckedFacets[],
): FilterEqual[] =>
  selectedFacetItems
    .map((facetItem) => {
      const facetName = (facetItem?.facetId || "").trim();
      const facetValue = (facetItem?.valueLabel || "").trim();
      if (!facetName || !facetValue) {
        return undefined;
      }
      return new FilterEqual(facetName, facetValue);
    })
    .filter(Boolean) as FilterEqual[];

export const cloneFacetValues = (values?: IFacetValue[]): IFacetValue[] =>
  (values || []).map((value) => ({ ...value }));

export const getMatchedRouteCards = (
  routeItems: IRouteCardItem[] | undefined,
  facetValues: IFacetValue[],
): IRenderableCard[] => {
  if (!routeItems?.length || !facetValues.length) {
    return [];
  }

  const facetValueByTitle = new Map(
    facetValues.map((facetValue) => [
      normalizeLabel(facetValue.text),
      facetValue,
    ]),
  );

  return routeItems
    .map((item, index) => {
      const title = item?.fields?.Title?.value;
      const matchedFacetValue = facetValueByTitle.get(normalizeLabel(title));
      if (!matchedFacetValue?.id) {
        return undefined;
      }

      return {
        id: `${matchedFacetValue.id}-${index}`,
        valueId: matchedFacetValue.id,
        Title: item?.fields?.Title,
        Description: item?.fields?.Description,
        Image: item?.fields?.Image,
      };
    })
    .filter(Boolean) as IRenderableCard[];
};
