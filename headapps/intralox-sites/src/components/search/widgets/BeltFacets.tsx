"use client";

import {
  getFacetConfigType,
  useSearchResultsActions,
  useSearchResultsConfig,
  useSearchResultsSelectedFilters,
} from "@sitecore-search/react";
import { type ImageField } from "@sitecore-content-sdk/nextjs";
import { Popover } from "@laitram-l-l-c/intralox-ui-components";
import {
  Button,
  Dialog,
  DialogTrigger,
  ListBox,
  ListBoxItem,
  Popover as AriaPopover,
  Select,
} from "react-aria-components";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { JSX } from "react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  ISearchFacetInfoItem,
  ISearchPageFields,
} from "../SearchComponent.type";
import { ICheckedFacets } from "../SearchComponent.type";
import {
  faCheck,
  faChevronDown,
  faChevronUp,
  faCircleInfo,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "lib/utils";
import { ImageView } from "components/shared/ImageView/ImageView";

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
const BELT_TYPE_VISIBLE_FACET_ITEMS = 5;
const SINGLE_SELECT_PLACEHOLDER = "Select an Item";
const SINGLE_SELECT_CLEAR_KEY = "__clear__";
const UNIT_IMPERIAL = "imperial";
const UNIT_METRIC = "metric";
type UnitType = typeof UNIT_IMPERIAL | typeof UNIT_METRIC;

function normalizeLabel(label: string): string {
  return label.trim().toLowerCase();
}

function syncFacetQueryParam(facetName: string, valueTexts: string[]): void {
  const currentUrl = new URL(window.location.href);
  const currentParams = currentUrl.searchParams;
  if (valueTexts.length === 0) currentParams.delete(facetName);
  else currentParams.set(facetName, valueTexts.join(","));
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

function facetValueIdForLabel(values: IValue[], label: string): string {
  const normalized = normalizeLabel(label);
  if (!normalized) return "";
  const byExact = values.find(
    (value) => normalizeLabel(value.text) === normalized,
  );
  return byExact?.id ?? "";
}

function areSameSelections(current: string[], desired: string[]): boolean {
  if (current.length !== desired.length) return false;
  const currentSet = new Set(current);
  return desired.every((item) => currentSet.has(item));
}

function isSingleSelectFacetType(facetType: string | undefined): boolean {
  const normalized = facetType?.trim().toLowerCase();
  return normalized === "text" || normalized === "range";
}

function isBeltSeriesFacet(facet: IFacets): boolean {
  return normalizeLabel(facet.label) === "belt series";
}

function isSprocketTeethFacet(facet: IFacets): boolean {
  return normalizeLabel(facet.label) === "sprocket teeth";
}

function isUnitDrivenDropdownFacet(facet: IFacets): boolean {
  const name = normalizeLabel(facet.name);
  return (
    name === "belt_pitch_range_us" ||
    name === "belt_pitch_range_metric" ||
    name === "sprocket_pitch_diameter_ranges_us" ||
    name === "sprocket_pitch_diameter_ranges_metric"
  );
}

function isBeltPitchFacet(facet: IFacets): boolean {
  const name = normalizeLabel(facet.name);
  return name === "belt_pitch_range_us" || name === "belt_pitch_range_metric";
}

function formatUnitDropdownValueLabel(
  facet: IFacets,
  valueText: string,
): string {
  const unit = resolveUnitForFacet(facet);
  const normalizedValue = normalizeLabel(valueText);

  if (unit === UNIT_IMPERIAL) {
    if (
      /\bin\b/.test(normalizedValue) ||
      /\binch(es)?\b/.test(normalizedValue)
    ) {
      return valueText;
    }
    return `${valueText} in`;
  }

  if (unit === UNIT_METRIC) {
    if (/\bmm\b/.test(normalizedValue)) {
      return valueText;
    }
    return `${valueText} mm`;
  }

  return valueText;
}

function resolveUnitForFacet(facet: IFacets): UnitType | null {
  const normalizedName = normalizeLabel(facet.name);
  if (normalizedName === "belt_pitch_range_us") return UNIT_IMPERIAL;
  if (normalizedName === "belt_pitch_range_metric") return UNIT_METRIC;
  if (normalizedName === "sprocket_pitch_diameter_ranges_us")
    return UNIT_IMPERIAL;
  if (normalizedName === "sprocket_pitch_diameter_ranges_metric")
    return UNIT_METRIC;

  const target = normalizeLabel(`${facet.name} ${facet.label}`);
  if (target.includes("metric") || target.includes(" mm")) return UNIT_METRIC;
  if (
    target.includes(" us") ||
    target.includes("inch") ||
    target.includes(" in")
  ) {
    return UNIT_IMPERIAL;
  }
  return null;
}

function isBeltStyleLevel0Facet(facet: IFacets): boolean {
  const target = normalizeLabel(`${facet.name} ${facet.label}`);
  return target.includes("belt style") && target.includes("lvl0");
}

function isBeltStyleLevel1Facet(facet: IFacets): boolean {
  const target = normalizeLabel(`${facet.name} ${facet.label}`);
  return target.includes("belt style") && target.includes("lvl1");
}

function getDefaultVisibleFacetItems(facet: IFacets): number {
  if (normalizeLabel(facet.label) === "belt type") {
    return BELT_TYPE_VISIBLE_FACET_ITEMS;
  }
  return DEFAULT_VISIBLE_FACET_ITEMS;
}

function shouldFacetRenderForUnit(
  facet: IFacets,
  activeUnit: UnitType,
  config: ReturnType<typeof useSearchResultsConfig>,
): boolean {
  const type = getFacetConfigType(config, facet.name);
  if (
    !isSingleSelectFacetType(String(type)) &&
    !isUnitDrivenDropdownFacet(facet)
  ) {
    return true;
  }
  const unit = resolveUnitForFacet(facet);
  if (!unit) return true;
  return unit === activeUnit;
}

function toLiveLabel(facetLabel: string): string {
  const normalizedFacetLabel = normalizeLabel(facetLabel);
  if (normalizedFacetLabel === "belt type") return "Type";
  if (normalizedFacetLabel === "sprocket pitch diameter ranges") {
    return "Sprocket Pitch Diameter";
  }

  return facetLabel
    .replace(/\blvl0\b/gi, "")
    .replace(/\blvl1\b/gi, "")
    .replace(/\bmetric\b/gi, "")
    .replace(/\bus\b/gi, "")
    .replace(/\branges?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toBeltStyleChildLabel(rawLabel: string): string {
  const parts = rawLabel
    .split(">")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= 1) return rawLabel;
  return parts[parts.length - 1];
}

function normalizeFacetValueMatch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");
}

function getFieldTextValue(fieldValue?: { value?: string }): string {
  return (fieldValue?.value || "").trim();
}

function itemMatchesFacetValue(
  item: ISearchFacetInfoItem,
  facetValueText: string,
): boolean {
  const normalizedFacetValue = normalizeFacetValueMatch(facetValueText);
  if (!normalizedFacetValue) return false;

  const title = getFieldTextValue(item.fields?.Title);
  const name = getFieldTextValue(item.fields?.Name);
  const displayName = (item.displayName || "").trim();
  const synonyms = getFieldTextValue(item.fields?.Synonyms)
    .split(/[|,]/)
    .map((value) => value.trim())
    .filter(Boolean);
  const comparisonCandidates = [displayName, name, title, ...synonyms]
    .map(normalizeFacetValueMatch)
    .filter(Boolean);

  return comparisonCandidates.some(
    (candidate) => candidate === normalizedFacetValue,
  );
}

function facetCategoryFromFacet(
  facet: IFacets,
): "technology" | "style" | "type" | null {
  const normalizedName = normalizeLabel(facet.name);
  const normalizedFacetLabel = normalizeLabel(facet.label);
  const joined = `${normalizedName} ${normalizedFacetLabel}`;

  if (joined.includes("technology")) return "technology";
  if (joined.includes("style")) return "style";
  if (joined.includes("type")) return "type";

  return null;
}

function getFacetInfoItemsByCategory(
  pageFields: ISearchPageFields | undefined,
  category: "technology" | "style" | "type",
): ISearchFacetInfoItem[] {
  if (!pageFields) return [];

  const normalizeFacetInfoCollection = (
    value: unknown,
  ): ISearchFacetInfoItem[] => {
    if (Array.isArray(value)) {
      return value.filter(Boolean) as ISearchFacetInfoItem[];
    }

    if (!value || typeof value !== "object") {
      return [];
    }

    const collection = value as {
      results?: unknown;
      items?: unknown;
    };

    if (Array.isArray(collection.results)) {
      return collection.results.filter(Boolean) as ISearchFacetInfoItem[];
    }

    if (Array.isArray(collection.items)) {
      return collection.items.filter(Boolean) as ISearchFacetInfoItem[];
    }

    return [value as ISearchFacetInfoItem];
  };

  if (category === "technology") {
    return [...normalizeFacetInfoCollection(pageFields.Technologies)];
  }

  if (category === "style") {
    return [...normalizeFacetInfoCollection(pageFields.Styles)];
  }

  return [...normalizeFacetInfoCollection(pageFields.Types)];
}

function getFacetInfoForValue(
  pageFields: ISearchPageFields | undefined,
  facet: IFacets,
  facetValueText: string,
): { description?: string; imageField?: ImageField } | null {
  const category = facetCategoryFromFacet(facet);
  if (!category) return null;

  const matchedItem = getFacetInfoItemsByCategory(pageFields, category).find(
    (item) => itemMatchesFacetValue(item, facetValueText),
  );
  if (!matchedItem) return null;

  const description = (
    category === "type"
      ? getFieldTextValue(matchedItem.fields?.BeltTypeHelpText) ||
        getFieldTextValue(matchedItem.fields?.Description)
      : category === "style"
        ? getFieldTextValue(matchedItem.fields?.BeltStyleHelpText) ||
          getFieldTextValue(matchedItem.fields?.Description)
        : getFieldTextValue(matchedItem.fields?.Description)
  ).trim();

  const candidateImageFields: Array<ImageField | undefined> =
    category === "style"
      ? [
          matchedItem.fields?.ThermoDriveSurfaceImage,
          matchedItem.fields?.ModularPlasticBeltingSurfaceImage,
          matchedItem.fields?.Image,
        ]
      : [matchedItem.fields?.Image];
  const imageField = candidateImageFields.find((field) =>
    Boolean(field?.value?.src),
  );

  if (!imageField?.value?.src) return null;

  return { description, imageField };
}

export function BeltFacets({
  facets,
  pageFields,
}: {
  facets: IFacets[];
  pageFields?: ISearchPageFields;
}): JSX.Element | null {
  const searchParams = useSearchParams();
  const { onFacetClick, onClearFilters } = useSearchResultsActions();
  const config = useSearchResultsConfig();
  const selectedFacetsFromApi = useSearchResultsSelectedFilters();
  const router = useRouter();
  const pathname = usePathname();

  const filterableFacets = useMemo(
    () => facets.filter((facet) => facet.name !== "price"),
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
  const [activeUnit, setActiveUnit] = useState<UnitType>(UNIT_IMPERIAL);
  const [activeBeltStyleRootId, setActiveBeltStyleRootId] = useState<
    string | null
  >(null);
  const [activeBeltStyleRootCount, setActiveBeltStyleRootCount] = useState<
    number | null
  >(null);

  const getSelectedValueIds = useCallback(
    (facetId: string): string[] =>
      selectedByFacetId.get(facetId)?.map((item) => item.facetValueId) ?? [],
    [selectedByFacetId],
  );

  const getSingleSelectedValueId = useCallback(
    (facetId: string): string => {
      const selected = getSelectedValueIds(facetId);
      return selected.length === 1 ? selected[0] : "";
    },
    [getSelectedValueIds],
  );

  const clearFacetSelection = useCallback(
    (facet: IFacets): void => {
      const type = getFacetConfigType(config, facet.name);
      const selectedNow = getSelectedValueIds(facet.name);
      for (const selectedId of selectedNow) {
        onFacetClick({
          facetId: facet.name,
          facetValueId: selectedId,
          type,
          checked: false,
        } as unknown as Parameters<typeof onFacetClick>[0]);
      }
      syncFacetQueryParam(facet.name, []);
    },
    [config, getSelectedValueIds, onFacetClick],
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

  const handleSingleSelectFacet = (facet: IFacets, nextId: string): void => {
    const type = getFacetConfigType(config, facet.name);
    const selectedNow = getSelectedValueIds(facet.name);
    for (const selectedId of selectedNow) {
      onFacetClick({
        facetId: facet.name,
        facetValueId: selectedId,
        type,
        checked: false,
      } as unknown as Parameters<typeof onFacetClick>[0]);
    }
    if (!nextId) {
      syncFacetQueryParam(facet.name, []);
      return;
    }
    onFacetClick({
      facetId: facet.name,
      facetValueId: nextId,
      type,
      checked: true,
    } as unknown as Parameters<typeof onFacetClick>[0]);
    const selected = facet.value.find((value) => value.id === nextId);
    syncFacetQueryParam(facet.name, selected ? [selected.text] : []);
  };

  const handleClearFilters = (): void => {
    const nextParams = new URLSearchParams(searchParams.toString());
    for (const facet of facets) nextParams.delete(facet.name);
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    onClearFilters?.();
    setActiveBeltStyleRootId(null);
    setActiveBeltStyleRootCount(null);
  };

  const beltStyleLvl0Facet = useMemo(
    () => filterableFacets.find((facet) => isBeltStyleLevel0Facet(facet)),
    [filterableFacets],
  );
  const beltStyleLvl1Facet = useMemo(
    () => filterableFacets.find((facet) => isBeltStyleLevel1Facet(facet)),
    [filterableFacets],
  );

  useEffect(() => {
    if (!filterableFacets.length) return;
    const params = new URLSearchParams(searchParams.toString());
    for (const facet of filterableFacets) {
      if (!facet.value?.length) continue;
      const desiredIds = desiredFacetLabelsFromParams(facet.name, params)
        .map((label) => facetValueIdForLabel(facet.value, label))
        .filter(Boolean);
      const currentIds = getSelectedValueIds(facet.name);
      if (areSameSelections(currentIds, desiredIds)) continue;

      const type = getFacetConfigType(config, facet.name);
      for (const currentId of currentIds) {
        onFacetClick({
          facetId: facet.name,
          facetValueId: currentId,
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

  useEffect(() => {
    const metricSelected = filterableFacets.some((facet) => {
      if (resolveUnitForFacet(facet) !== UNIT_METRIC) return false;
      return getSelectedValueIds(facet.name).length > 0;
    });
    if (metricSelected) setActiveUnit(UNIT_METRIC);
  }, [filterableFacets, getSelectedValueIds, selectedByFacetId]);

  useEffect(() => {
    if (!beltStyleLvl0Facet) {
      setActiveBeltStyleRootId(null);
      setActiveBeltStyleRootCount(null);
      return;
    }
    const selected = getSelectedValueIds(beltStyleLvl0Facet.name);
    if (selected.length === 1) {
      const selectedId = selected[0];
      if (activeBeltStyleRootId !== selectedId) {
        const selectedValue = beltStyleLvl0Facet.value.find(
          (value) => value.id === selectedId,
        );
        setActiveBeltStyleRootCount(selectedValue?.count ?? null);
      }
      setActiveBeltStyleRootId(selectedId);
      return;
    }
    setActiveBeltStyleRootId(null);
    setActiveBeltStyleRootCount(null);
  }, [
    beltStyleLvl0Facet,
    getSelectedValueIds,
    selectedByFacetId,
    activeBeltStyleRootId,
  ]);

  const handleToggleUnits = (): void => {
    setActiveUnit((prev) =>
      prev === UNIT_METRIC ? UNIT_IMPERIAL : UNIT_METRIC,
    );
    for (const facet of filterableFacets) {
      if (!resolveUnitForFacet(facet)) continue;
      clearFacetSelection(facet);
    }
  };

  const handleBeltStyleRootClick = (valueId: string): void => {
    if (!beltStyleLvl0Facet) return;
    if (activeBeltStyleRootId === valueId) {
      handleBackToAllBeltStyles();
      return;
    }
    const type = getFacetConfigType(config, beltStyleLvl0Facet.name);
    const selectedNow = getSelectedValueIds(beltStyleLvl0Facet.name);
    for (const selectedId of selectedNow) {
      onFacetClick({
        facetId: beltStyleLvl0Facet.name,
        facetValueId: selectedId,
        type,
        checked: false,
      } as unknown as Parameters<typeof onFacetClick>[0]);
    }
    onFacetClick({
      facetId: beltStyleLvl0Facet.name,
      facetValueId: valueId,
      type,
      checked: true,
    } as unknown as Parameters<typeof onFacetClick>[0]);
    const selected = beltStyleLvl0Facet.value.find(
      (value) => value.id === valueId,
    );
    syncFacetQueryParam(
      beltStyleLvl0Facet.name,
      selected ? [selected.text] : [],
    );
    setActiveBeltStyleRootId(valueId);
    setActiveBeltStyleRootCount(selected?.count ?? null);
  };

  const handleBackToAllBeltStyles = (): void => {
    if (beltStyleLvl0Facet) clearFacetSelection(beltStyleLvl0Facet);
    if (beltStyleLvl1Facet) clearFacetSelection(beltStyleLvl1Facet);
    setActiveBeltStyleRootId(null);
    setActiveBeltStyleRootCount(null);
  };

  const toggleFacetExpansion = (facetName: string): void => {
    setExpandedFacetNames((prev) =>
      prev.includes(facetName)
        ? prev.filter((name) => name !== facetName)
        : [...prev, facetName],
    );
  };

  if (!filterableFacets.length) return null;

  const visibleFacets = filterableFacets.filter((facet) => {
    if (beltStyleLvl1Facet && facet.name === beltStyleLvl1Facet.name)
      return false;
    return shouldFacetRenderForUnit(facet, activeUnit, config);
  });

  const selectedRootLabel = beltStyleLvl0Facet?.value.find(
    (value) => value.id === activeBeltStyleRootId,
  )?.text;
  const selectedRootCount = activeBeltStyleRootCount;
  const selectedRootFacetInfo =
    beltStyleLvl0Facet && selectedRootLabel
      ? getFacetInfoForValue(pageFields, beltStyleLvl0Facet, selectedRootLabel)
      : null;
  const isDrillDown = Boolean(
    beltStyleLvl0Facet && beltStyleLvl1Facet && activeBeltStyleRootId,
  );

  return (
    <>
      {visibleFacets.map((facet) => {
        const facetType = getFacetConfigType(config, facet.name);
        const isSingleSelect =
          isSingleSelectFacetType(String(facetType)) ||
          isBeltSeriesFacet(facet) ||
          isSprocketTeethFacet(facet) ||
          isUnitDrivenDropdownFacet(facet);
        const isBeltStyleRoot = beltStyleLvl0Facet?.name === facet.name;
        const maxVisibleItems = getDefaultVisibleFacetItems(facet);
        const visibleItems = expandedFacetNames.includes(facet.name)
          ? facet.value
          : facet.value.slice(0, maxVisibleItems);
        const showUnitSwitchBeforeFacet =
          isBeltPitchFacet(facet) &&
          visibleFacets.some((visibleFacet) => isBeltPitchFacet(visibleFacet));
        const selectedSingleValueId = getSingleSelectedValueId(facet.name);
        const selectedSingleLabel = selectedSingleValueId
          ? formatUnitDropdownValueLabel(
              facet,
              facet.value.find((value) => value.id === selectedSingleValueId)
                ?.text || "",
            )
          : SINGLE_SELECT_PLACEHOLDER;

        if (isBeltStyleRoot && isDrillDown && beltStyleLvl1Facet) {
          return (
            <Fragment key={facet.name}>
              <div className="w-full flex flex-col gap-2.5">
                <h3 className="uppercase tracking-wide font-bold text-ink-muted text-sm/tight leading-4">
                  {toLiveLabel(facet.label)}
                </h3>
                <button
                  type="button"
                  onClick={handleBackToAllBeltStyles}
                  className="text-sm text-left leading-normal font-medium hover:bg-gray-300 transition-colors duration-150 rounded"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className=" text-xs" />{" "}
                  All Belt Styles
                </button>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <button
                      type="button"
                      onClick={handleBackToAllBeltStyles}
                      className="tracking-wide font-bold text-text-heading-color text-sm/tight text-left hover:text-menu-active-color"
                      aria-label={`Back to all belt styles from ${selectedRootLabel}`}
                    >
                      {selectedRootLabel}
                    </button>
                    {selectedRootFacetInfo && (
                      <DialogTrigger>
                        <Button
                          className="mt-[1px] text-ink-subtle hover:text-menu-active-color focus:outline-none"
                          aria-label={`More info about ${selectedRootLabel}`}
                        >
                          <FontAwesomeIcon
                            icon={faCircleInfo}
                            className="text-sm leading-none text-ink-muted"
                          />
                        </Button>
                        <Popover
                          className="w-64 overflow-hidden rounded-lg border 
                                border-stroke-default bg-surface shadow-lg
                                [&_.fill-white]:fill-surface [&_.stroke-gray-300]:stroke-stroke-default"
                          includeArrow={true}
                        >
                          <Dialog className="outline-none p-3">
                            {selectedRootFacetInfo.imageField?.value?.src && (
                              <div className="overflow-hidden">
                                <ImageView
                                  image={selectedRootFacetInfo.imageField}
                                />
                              </div>
                            )}
                            {selectedRootFacetInfo.description && (
                              <p className="text-sm leading-snug mt-2 text-ink-primary">
                                {selectedRootFacetInfo.description}
                              </p>
                            )}
                          </Dialog>
                        </Popover>
                      </DialogTrigger>
                    )}
                  </div>
                  {typeof selectedRootCount === "number" && (
                    <span className="inline-block shrink-0 min-w-[1.333em] rounded bg-black/10 px-[0.25em] text-center mt-1 text-[0.76em] text-ink-secondary">
                      {selectedRootCount}
                    </span>
                  )}
                </div>
                <ul
                  className="flex flex-col gap-1 !m-0 !p-0 "
                  role="group"
                  aria-label="Belt style level 1"
                >
                  {(expandedFacetNames.includes(beltStyleLvl1Facet.name)
                    ? beltStyleLvl1Facet.value
                    : beltStyleLvl1Facet.value.slice(
                        0,
                        DEFAULT_VISIBLE_FACET_ITEMS,
                      )
                  ).map((value) => {
                    const isChecked = getSelectedValueIds(
                      beltStyleLvl1Facet.name,
                    ).includes(value.id);
                    const facetInfo = getFacetInfoForValue(
                      pageFields,
                      beltStyleLvl1Facet,
                      toBeltStyleChildLabel(value.text),
                    );
                    return (
                      <li key={value.id} className="text-sm !ml-0">
                        <div className="flex w-full items-start justify-between gap-2">
                          <label className="group flex w-full gap-2 cursor-pointer">
                            <div className="flex self-start items-center h-lh">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(event) => {
                                  handleFacetValueToggle(
                                    beltStyleLvl1Facet,
                                    value.id,
                                    event.target.checked,
                                  );
                                }}
                                className="absolute opacity-0"
                              />
                            </div>
                            <div className="flex w-full items-start justify-between gap-[1.25em]">
                              <div>
                                <span
                                  className={cn(
                                    "text-sm text-ink-primary",
                                    isChecked && "font-bold",
                                  )}
                                >
                                  {toBeltStyleChildLabel(value.text)}
                                </span>
                                {facetInfo && (
                                  <DialogTrigger>
                                    <Button
                                      className="mt-[1px] text-ink-subtle hover:text-menu-active-color focus:outline-none"
                                      aria-label={`More info about ${toBeltStyleChildLabel(value.text)}`}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        icon={faCircleInfo}
                                        className="text-sm leading-none text-ink-muted"
                                      />
                                    </Button>
                                    <Popover
                                      className="w-64 overflow-hidden rounded-lg border 
                                border-stroke-default bg-surface shadow-lg
                                [&_.fill-white]:fill-surface [&_.stroke-gray-300]:stroke-stroke-default"
                                      includeArrow={true}
                                    >
                                      <Dialog className="outline-none p-3">
                                        {facetInfo.imageField?.value?.src && (
                                          <div className="overflow-hidden">
                                            <ImageView
                                              image={facetInfo.imageField}
                                            />
                                          </div>
                                        )}
                                        {facetInfo.description && (
                                          <p className="text-sm leading-snug mt-2 text-ink-primary">
                                            {facetInfo.description}
                                          </p>
                                        )}
                                      </Dialog>
                                    </Popover>
                                  </DialogTrigger>
                                )}
                              </div>
                              <span className="flex shrink-0 items-start gap-2">
                                {typeof value.count === "number" && (
                                  <span className="inline-block shrink-0 min-w-[1.333em] rounded bg-black/10 px-[0.25em] text-center mt-1 text-[0.76em] text-ink-secondary">
                                    {value.count}
                                  </span>
                                )}
                              </span>
                            </div>
                          </label>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {beltStyleLvl1Facet.value.length >
                  DEFAULT_VISIBLE_FACET_ITEMS && (
                  <button
                    type="button"
                    onClick={() =>
                      toggleFacetExpansion(beltStyleLvl1Facet.name)
                    }
                    className="items-center w-fit text-action-link hover:text-action focus:text-action focus:outline-hidden focus-visible:ring active:text-action-active visited:text-action-visited disabled:text-action-disabled disabled:cursor-default text-sm underline hover:no-underline"
                  >
                    {expandedFacetNames.includes(beltStyleLvl1Facet.name) ? (
                      <>
                        Show less
                        <FontAwesomeIcon
                          icon={faChevronUp}
                          className="ml-[2px] text-xs"
                        />
                      </>
                    ) : (
                      <>
                        Show more
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className="ml-[2px] text-xs"
                        />
                      </>
                    )}
                  </button>
                )}
              </div>
            </Fragment>
          );
        }

        return (
          <Fragment key={facet.name}>
            {showUnitSwitchBeforeFacet && (
              <div className="text-xs leading-snug w-full">
                <span className="text-ink-tertiary">
                  Configured for{" "}
                  {activeUnit === UNIT_METRIC ? "Metric Units" : "U.S. Units"}
                </span>
                <br />
                <button
                  type="button"
                  onClick={handleToggleUnits}
                  className="leading-normal items-center w-fit text-action-link hover:text-action focus:text-action focus:outline-hidden focus-visible:ring active:text-action-active visited:text-action-visited disabled:text-action-disabled disabled:cursor-default underline hover:no-underline"
                >
                  Change
                </button>
              </div>
            )}
            <div className="w-full flex flex-col gap-2.5">
              <h3 className="uppercase tracking-wide font-bold text-ink-muted text-sm/tight leading-4">
                {toLiveLabel(facet.label)}
              </h3>

              {isSingleSelect ? (
                <Select
                  selectedKey={selectedSingleValueId || null}
                  onSelectionChange={(key) => {
                    if (typeof key !== "string") return;
                    if (key === SINGLE_SELECT_CLEAR_KEY) {
                      handleSingleSelectFacet(facet, "");
                      return;
                    }
                    handleSingleSelectFacet(facet, key);
                  }}
                >
                  <Button
                    className={cn(
                      "w-full px-3 py-2 border rounded-xs bg-white text-left text-base leading-tight focus:border-action-focus focus:outline-none border-gray-300 flex items-center justify-between gap-2",
                      selectedSingleValueId
                        ? "text-ink-primary"
                        : "text-ink-subtle",
                    )}
                    aria-label={facet.label}
                  >
                    <span>{selectedSingleLabel}</span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className="text-sm text-ink-primary"
                    />
                  </Button>
                  <AriaPopover
                    offset={0}
                    className="overflow-hidden overflow-y-auto border border-stroke-default bg-surface shadow-[0_0_12px_0_rgba(0,0,0,0.13) w-[var(--trigger-width)]"
                    style={{
                      width: "var(--trigger-width)",
                      minWidth: "var(--trigger-width)",
                      maxWidth: "var(--trigger-width)",
                    }}
                  >
                    <ListBox className="bg-transparent rounded-xs p-1.5 flex flex-col items-start gap-1 focus:outline-hidden">
                      {facet.value.map((value) => (
                        <ListBoxItem
                          key={value.id}
                          id={value.id}
                          textValue={formatUnitDropdownValueLabel(
                            facet,
                            value.text,
                          )}
                          className="relative bg-surface text-ink-primary flex flex-wrap items-center w-full py-2 px-5 rounded-xs focus:outline-hidden focus-visible:ring focus-visible:rounded-sm! hover:bg-gray-200 active:bg-gray-300 disabled:text-gray-500"
                        >
                          {selectedSingleValueId === value.id && (
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-xs leading-none text-ink-primary absolute left-1"
                            />
                          )}
                          {formatUnitDropdownValueLabel(facet, value.text)}
                        </ListBoxItem>
                      ))}
                    </ListBox>
                  </AriaPopover>
                </Select>
              ) : (
                <ul
                  className="flex flex-col gap-1 !m-0 !p-0 "
                  role="group"
                  aria-label={facet.label}
                >
                  {visibleItems.map((value) => {
                    const isChecked = getSelectedValueIds(facet.name).includes(
                      value.id,
                    );
                    const facetInfo = getFacetInfoForValue(
                      pageFields,
                      facet,
                      value.text,
                    );
                    return (
                      <li key={value.id} className="flex flex-col text-sm !m-0">
                        {isBeltStyleRoot ? (
                          <button
                            type="button"
                            onClick={() => handleBeltStyleRootClick(value.id)}
                            className="flex  w-full items-start justify-between gap-[1.25em] text-left text-ink-primary hover:text-menu-active-color"
                          >
                            <div>
                              <span className="text-sm">{value.text}</span>
                              {facetInfo && (
                                <DialogTrigger>
                                  <Button
                                    className="mt-[1px] ml-1 text-ink-subtle hover:text-menu-active-color focus:outline-none"
                                    aria-label={`More info about ${value.text}`}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                    }}
                                  >
                                    <FontAwesomeIcon
                                      icon={faCircleInfo}
                                      className="text-sm leading-none text-ink-muted"
                                    />
                                  </Button>
                                  <Popover
                                    className="w-64 overflow-hidden rounded-lg border 
                                          border-stroke-default bg-surface shadow-lg
                                          [&_.fill-white]:fill-surface [&_.stroke-gray-300]:stroke-stroke-default"
                                    includeArrow={true}
                                  >
                                    <Dialog className="outline-none p-3">
                                      {facetInfo.imageField?.value?.src && (
                                        <div className="overflow-hidden">
                                          <ImageView
                                            image={facetInfo.imageField}
                                          />
                                        </div>
                                      )}
                                      {facetInfo.description && (
                                        <p className="text-sm leading-snug mt-2 text-ink-primary">
                                          {facetInfo.description}
                                        </p>
                                      )}
                                    </Dialog>
                                  </Popover>
                                </DialogTrigger>
                              )}
                            </div>
                            <span className="flex shrink-0 items-start gap-2">
                              {typeof value.count === "number" && (
                                <span className="inline-block shrink-0 min-w-[1.333em] rounded bg-black/10 px-[0.25em] text-center mt-1 text-[0.76em] text-ink-secondary">
                                  {value.count}
                                </span>
                              )}
                            </span>
                          </button>
                        ) : (
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
                                className={cn(
                                  "flex shrink-0 items-center justify-center border rounded-xs h-4 w-4 [&_svg]:stroke-[4px]",
                                  isChecked
                                    ? "bg-stroke-input-focus border-stroke-input-focus [&_svg]:text-surface"
                                    : "bg-surface",
                                )}
                              >
                                {isChecked && (
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    className="text-xs"
                                  />
                                )}
                              </span>
                            </div>
                            <div className="flex w-full items-start justify-between gap-[1.25em]">
                              <div>
                                <span className="text-sm text-ink-primary">
                                  {value.text}
                                </span>
                                {facetInfo && (
                                  <DialogTrigger>
                                    <Button
                                      className="mt-[1px] ml-1 text-ink-subtle hover:text-menu-active-color focus:outline-none"
                                      aria-label={`More info about ${value.text}`}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        icon={faCircleInfo}
                                        className="text-sm leading-none text-ink-muted"
                                      />
                                    </Button>
                                    <Popover
                                      className="w-64 overflow-hidden rounded-lg border 
                                          border-stroke-default bg-surface shadow-lg
                                          [&_.fill-white]:fill-surface [&_.stroke-gray-300]:stroke-stroke-default"
                                      includeArrow={true}
                                    >
                                      <Dialog className="outline-none p-3">
                                        {facetInfo.imageField?.value?.src && (
                                          <div className="overflow-hidden">
                                            <ImageView
                                              image={facetInfo.imageField}
                                            />
                                          </div>
                                        )}
                                        {facetInfo.description && (
                                          <p className="text-sm leading-snug mt-2 text-ink-primary">
                                            {facetInfo.description}
                                          </p>
                                        )}
                                      </Dialog>
                                    </Popover>
                                  </DialogTrigger>
                                )}
                              </div>
                              <span className="flex shrink-0 items-start gap-2">
                                {typeof value.count === "number" && (
                                  <span className="inline-block shrink-0 min-w-[1.333em] rounded bg-black/10 px-[0.25em] text-center mt-1 text-[0.76em] text-ink-secondary">
                                    {value.count}
                                  </span>
                                )}
                              </span>
                            </div>
                          </label>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              {!isSingleSelect && facet.value.length > maxVisibleItems && (
                <button
                  type="button"
                  onClick={() => toggleFacetExpansion(facet.name)}
                  className={`items-center w-fit ${facet.label === "Belt Type" ? "text-xs" : ""} hover:text-action focus:text-action focus:outline-hidden focus-visible:ring active:text-action-active visited:text-action-visited disabled:text-action-disabled disabled:cursor-default text-sm underline hover:no-underline ${expandedFacetNames.includes(facet.name) ? "text-action-link" : "text-action-link"}`}
                >
                  {expandedFacetNames.includes(facet.name) ? (
                    <>
                      Show less
                      {facet.label !== "Belt Type" && (
                        <FontAwesomeIcon
                          icon={faChevronUp}
                          className="ml-[2px] text-xs"
                        />
                      )}
                    </>
                  ) : (
                    <>
                      Show more
                      {facet.label !== "Belt Type" && (
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className="ml-[2px] text-xs"
                        />
                      )}
                    </>
                  )}
                </button>
              )}
            </div>
          </Fragment>
        );
      })}
    </>
  );
}
