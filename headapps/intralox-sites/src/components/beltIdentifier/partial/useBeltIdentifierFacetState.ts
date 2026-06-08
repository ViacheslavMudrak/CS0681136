"use client";
import {
  getFacetConfigType,
  useSearchResultsActions,
  useSearchResultsConfig,
} from "@sitecore-search/react";
import { useEffect, useMemo, useState } from "react";

import type { ICheckedFacets } from "components/search/SearchComponent.type";

import type {
  BeltPitchUnit,
  IFacet,
  IFacetValue,
} from "./BeltIdentifierSearchResult.types";
import {
  BELT_PITCH_METRIC_FACET_NAME,
  BELT_PITCH_US_FACET_NAME,
  BELT_TYPE_FACET_NAME,
  TECHNOLOGY_FACET_NAME,
  cloneFacetValues,
  getFacetByName,
} from "./BeltIdentifierSearchResult.utils";
import { Unit } from "src/utils/enum";

interface UseBeltIdentifierFacetStateProps {
  selectedFacets: ICheckedFacets[];
  facets: IFacet[];
  searchConfig: ReturnType<typeof useSearchResultsConfig>;
  onFacetClick: ReturnType<typeof useSearchResultsActions>["onFacetClick"];
}

interface UseBeltIdentifierFacetStateResult {
  activeBeltPitchUnit: BeltPitchUnit;
  setActiveBeltPitchUnit: (unit: BeltPitchUnit) => void;
  selectedTechnologyValueId: string;
  selectedBeltTypeValueId: string;
  selectedBeltPitchUsValueId: string;
  selectedBeltPitchMetricValueId: string;
  selectedBeltPitchValueId: string;
  beltPitchUsValues: IFacetValue[];
  beltPitchMetricValues: IFacetValue[];
  technologyFacetValues: IFacetValue[];
  beltTypeFacetValues: IFacetValue[];
  selectedTechnologyValue?: IFacetValue;
  selectedBeltTypeValue?: IFacetValue;
  selectedBeltPitchValue?: IFacetValue;
  selectedBeltPitchFacetName: string;
  clearFacetSelection: (facetName: string) => void;
  selectSingleFacetValue: (facetName: string, facetValueId: string) => void;
}

export const useBeltIdentifierFacetState = ({
  selectedFacets,
  facets,
  searchConfig,
  onFacetClick,
}: UseBeltIdentifierFacetStateProps): UseBeltIdentifierFacetStateResult => {
  const [activeBeltPitchUnit, setActiveBeltPitchUnit] = useState<BeltPitchUnit>(
    Unit.INCH,
  );
  const [baseTechnologyFacetValues, setBaseTechnologyFacetValues] = useState<
    IFacetValue[]
  >([]);
  const [beltTypeFacetValuesByTechnology, setBeltTypeFacetValuesByTechnology] =
    useState<Record<string, IFacetValue[]>>({});
  const [beltPitchFacetValuesBySelection, setBeltPitchFacetValuesBySelection] =
    useState<Record<string, { us: IFacetValue[]; metric: IFacetValue[] }>>({});

  const selectedByFacet = useMemo(() => {
    const map = new Map<string, ICheckedFacets[]>();
    for (const item of selectedFacets) {
      const list = map.get(item.facetId);
      if (list) {
        list.push(item);
      } else {
        map.set(item.facetId, [item]);
      }
    }
    return map;
  }, [selectedFacets]);

  const technologyFacet = useMemo(
    () => getFacetByName(facets, TECHNOLOGY_FACET_NAME),
    [facets],
  );
  const beltTypeFacet = useMemo(
    () => getFacetByName(facets, BELT_TYPE_FACET_NAME),
    [facets],
  );
  const beltPitchUsFacet = useMemo(
    () => getFacetByName(facets, BELT_PITCH_US_FACET_NAME),
    [facets],
  );
  const beltPitchMetricFacet = useMemo(
    () => getFacetByName(facets, BELT_PITCH_METRIC_FACET_NAME),
    [facets],
  );

  const getSelectedFacetValueId = (facetName: string): string =>
    selectedByFacet.get(facetName)?.[0]?.facetValueId || "";

  const selectedTechnologyValueId = getSelectedFacetValueId(
    TECHNOLOGY_FACET_NAME,
  );
  const selectedBeltTypeValueId = getSelectedFacetValueId(BELT_TYPE_FACET_NAME);
  const selectedBeltPitchUsValueId = getSelectedFacetValueId(
    BELT_PITCH_US_FACET_NAME,
  );
  const selectedBeltPitchMetricValueId = getSelectedFacetValueId(
    BELT_PITCH_METRIC_FACET_NAME,
  );
  const selectedBeltPitchValueId =
    activeBeltPitchUnit === Unit.INCH
      ? selectedBeltPitchUsValueId
      : selectedBeltPitchMetricValueId;

  const hasAnyBeltPitchSelected = Boolean(
    selectedBeltPitchUsValueId || selectedBeltPitchMetricValueId,
  );
  const hasAnySelection = Boolean(
    selectedTechnologyValueId ||
    selectedBeltTypeValueId ||
    selectedBeltPitchUsValueId ||
    selectedBeltPitchMetricValueId,
  );
  const beltTypeSelectionKey =
    selectedTechnologyValueId && selectedBeltTypeValueId
      ? `${selectedTechnologyValueId}::${selectedBeltTypeValueId}`
      : "";

  useEffect(() => {
    if (!hasAnySelection && technologyFacet?.value?.length) {
      setBaseTechnologyFacetValues(cloneFacetValues(technologyFacet.value));
    }
  }, [hasAnySelection, technologyFacet]);

  useEffect(() => {
    if (
      selectedTechnologyValueId &&
      !selectedBeltTypeValueId &&
      !hasAnyBeltPitchSelected &&
      beltTypeFacet?.value
    ) {
      setBeltTypeFacetValuesByTechnology((current) => ({
        ...current,
        [selectedTechnologyValueId]: cloneFacetValues(beltTypeFacet.value),
      }));
    }
  }, [
    selectedTechnologyValueId,
    selectedBeltTypeValueId,
    hasAnyBeltPitchSelected,
    beltTypeFacet,
  ]);

  useEffect(() => {
    if (beltTypeSelectionKey && !hasAnyBeltPitchSelected) {
      setBeltPitchFacetValuesBySelection((current) => ({
        ...current,
        [beltTypeSelectionKey]: {
          us: cloneFacetValues(beltPitchUsFacet?.value),
          metric: cloneFacetValues(beltPitchMetricFacet?.value),
        },
      }));
    }
  }, [
    beltTypeSelectionKey,
    hasAnyBeltPitchSelected,
    beltPitchUsFacet,
    beltPitchMetricFacet,
  ]);

  const technologyFacetValues =
    baseTechnologyFacetValues.length > 0
      ? baseTechnologyFacetValues
      : technologyFacet?.value || [];
  const beltTypeFacetValues =
    (selectedTechnologyValueId &&
      beltTypeFacetValuesByTechnology[selectedTechnologyValueId]) ||
    beltTypeFacet?.value ||
    [];
  const beltPitchFacetSnapshot = beltTypeSelectionKey
    ? beltPitchFacetValuesBySelection[beltTypeSelectionKey]
    : undefined;
  const beltPitchUsValues =
    beltPitchFacetSnapshot?.us || beltPitchUsFacet?.value || [];
  const beltPitchMetricValues =
    beltPitchFacetSnapshot?.metric || beltPitchMetricFacet?.value || [];

  const selectedTechnologyValue = technologyFacetValues.find(
    (facetValue) => facetValue.id === selectedTechnologyValueId,
  );
  const selectedBeltTypeValue = beltTypeFacetValues.find(
    (facetValue) => facetValue.id === selectedBeltTypeValueId,
  );
  const selectedBeltPitchFacetName =
    activeBeltPitchUnit === Unit.INCH
      ? BELT_PITCH_US_FACET_NAME
      : BELT_PITCH_METRIC_FACET_NAME;
  const selectedBeltPitchValue = (
    activeBeltPitchUnit === Unit.INCH
      ? beltPitchUsValues
      : beltPitchMetricValues
  ).find((facetValue) => facetValue.id === selectedBeltPitchValueId);

  const clearFacetSelection = (facetName: string) => {
    const selectedValues = selectedByFacet.get(facetName) || [];
    if (!selectedValues.length) {
      return;
    }

    const type = getFacetConfigType(searchConfig, facetName);
    selectedValues.forEach((item) => {
      onFacetClick({
        facetId: facetName,
        facetValueId: item.facetValueId,
        type,
        checked: false,
      } as unknown as Parameters<typeof onFacetClick>[0]);
    });
  };

  const selectSingleFacetValue = (facetName: string, facetValueId: string) => {
    const currentSelectedId = getSelectedFacetValueId(facetName);
    const type = getFacetConfigType(searchConfig, facetName);

    if (facetValueId && currentSelectedId === facetValueId) {
      return;
    }

    clearFacetSelection(facetName);
    if (facetValueId) {
      onFacetClick({
        facetId: facetName,
        facetValueId,
        type,
        checked: true,
      } as unknown as Parameters<typeof onFacetClick>[0]);
    }
  };

  return {
    activeBeltPitchUnit,
    setActiveBeltPitchUnit,
    selectedTechnologyValueId,
    selectedBeltTypeValueId,
    selectedBeltPitchUsValueId,
    selectedBeltPitchMetricValueId,
    selectedBeltPitchValueId,
    beltPitchUsValues,
    beltPitchMetricValues,
    technologyFacetValues,
    beltTypeFacetValues,
    selectedTechnologyValue,
    selectedBeltTypeValue,
    selectedBeltPitchValue,
    selectedBeltPitchFacetName,
    clearFacetSelection,
    selectSingleFacetValue,
  };
};
