"use client";
import {
  FilterAnd,
  WidgetDataType,
  useSearchResultsActions,
  useSearchResultsConfig,
  useSearchResultsSelectedFilters,
  useSearchResults,
  widget,
  FilterEqual,
} from "@sitecore-search/react";
import { useEffect, useMemo, useRef } from "react";

import { RichText } from "@sitecore-content-sdk/nextjs";
import Spinner from "components/search/widgets/Spinner";
import { IBeltFinderSearchResultProps } from "../BeltIdentifier.type";
import { ICheckedFacets } from "components/search/SearchComponent.type";
import {
  Accordion,
  AccordionItem,
} from "@laitram-l-l-c/intralox-ui-components";
import BeltPitchSelector from "./BeltPitchSelector";
import FacetCardGrid from "./FacetCardGrid";
import SearchResultStep4Cta from "./SearchResultStep4Cta";
import type { IFacet } from "./BeltIdentifierSearchResult.types";
import {
  BASE_PRODUCT_TYPE,
  BELT_SERIES_FACET_NAME,
  BELT_PITCH_METRIC_FACET_NAME,
  BELT_PITCH_US_FACET_NAME,
  BELT_TYPE_FACET_NAME,
  SEARCH_ENV_FILTER,
  TECHNOLOGY_FACET_NAME,
  applyMessageTemplate,
  buildSelectedFacetFilters,
  getFacetByName,
  getMatchedRouteCards,
  removePathSegment,
  toQueryToken,
  toRangeQueryValue,
  toSlug,
} from "./BeltIdentifierSearchResult.utils";
import { useBeltIdentifierFacetState } from "./useBeltIdentifierFacetState";

const BeltIdentifierSearchResultComponent = ({
  defaultPage,
  defaultKeyphrase,
  defaultItemsPerPage,
  localeContext,
  fields,
  cardType,
  routeFields,
}: IBeltFinderSearchResultProps) => {
  const FACET_MAX_VALUE = 100;
  const selectedFacets = useSearchResultsSelectedFilters() as ICheckedFacets[];
  const selectedFacetsRef = useRef<ICheckedFacets[]>(selectedFacets);
  const { onFacetClick } = useSearchResultsActions();
  const searchConfig = useSearchResultsConfig();

  useEffect(() => {
    selectedFacetsRef.current = selectedFacets;
  }, [selectedFacets]);

  const {
    widgetRef,
    queryResult: {
      isLoading,
      isFetching,
      data: { total_item: totalItems = 0, facet: facets = [] } = {},
    },
  } = useSearchResults({
    query: (query) => {
      const baseFilters: FilterEqual[] = [
        new FilterEqual("product_type", BASE_PRODUCT_TYPE),
      ];
      if (SEARCH_ENV_FILTER) {
        baseFilters.unshift(new FilterEqual("environment", SEARCH_ENV_FILTER));
      }
      const selectedFacetFilters = buildSelectedFacetFilters(
        selectedFacetsRef.current,
      );
      const allFilters = [...baseFilters, ...selectedFacetFilters];
      const mergedFilter =
        allFilters.length === 1 ? allFilters[0] : new FilterAnd(allFilters);
      query
        .getRequest()
        .setSearchFilter(mergedFilter)
        .setSearchFacetAll(true)
        .setSearchFacetMax(FACET_MAX_VALUE);

      if (localeContext?.language && localeContext?.country) {
        const context = query.getContext();
        context.setLocaleLanguage(localeContext.language);
        context.setLocaleCountry(localeContext.country);
      }
      return query;
    },
    state: {
      page: defaultPage,
      itemsPerPage: defaultItemsPerPage,
      keyphrase: defaultKeyphrase,
    },
  });

  const allFacets = facets as IFacet[];
  const {
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
  } = useBeltIdentifierFacetState({
    selectedFacets,
    facets: allFacets,
    searchConfig,
    onFacetClick,
  });
  const pageBasePath =
    typeof window === "undefined"
      ? ""
      : removePathSegment(window.location.pathname, "identify-a-belt");
  const pageUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}${pageBasePath}`;
  const technologyUrlSegment = toSlug(selectedTechnologyValue?.text);
  const step1ItemLink = technologyUrlSegment
    ? `${pageUrl}/${technologyUrlSegment}`
    : pageUrl;
  const step2QueryParams = new URLSearchParams();
  const selectedBeltTypeToken = toQueryToken(selectedBeltTypeValue?.text);
  if (selectedBeltTypeToken) {
    step2QueryParams.set(
      BELT_TYPE_FACET_NAME,
      `${BELT_TYPE_FACET_NAME}_${selectedBeltTypeToken}`,
    );
  }
  const step2ItemLink = step2QueryParams.toString()
    ? `${step1ItemLink}?${step2QueryParams.toString()}`
    : step1ItemLink;
  const step4QueryParams = new URLSearchParams(step2QueryParams);
  const selectedBeltPitchRangeValue = toRangeQueryValue(
    selectedBeltPitchValue?.text,
  );
  if (selectedBeltPitchRangeValue) {
    step4QueryParams.set(
      selectedBeltPitchFacetName,
      selectedBeltPitchRangeValue,
    );
  }
  const step4ItemLink = step4QueryParams.toString()
    ? `${step1ItemLink}?${step4QueryParams.toString()}`
    : step1ItemLink;
  const beltSeriesCount =
    getFacetByName(allFacets, BELT_SERIES_FACET_NAME)?.value?.length || 0;
  const step1Message = applyMessageTemplate(
    fields?.Step1Message?.value,
    beltSeriesCount,
    step1ItemLink,
  );
  const step2Message = applyMessageTemplate(
    fields?.Step2Message?.value,
    beltSeriesCount,
    step2ItemLink,
  );

  const technologyCards = useMemo(() => {
    const routeTechnologyCards = getMatchedRouteCards(
      routeFields?.Technologies,
      technologyFacetValues,
    );

    if (routeTechnologyCards.length) {
      return routeTechnologyCards;
    }

    return technologyFacetValues.map((facetValue) => ({
      id: facetValue.id,
      valueId: facetValue.id,
      Title: { value: facetValue.text },
      Description: { value: "" },
      Image: undefined,
    }));
  }, [routeFields, technologyFacetValues]);

  const routeBeltTypes = useMemo(
    () =>
      (routeFields?.Types || []).map((typeItem) => ({
        fields: {
          Title: typeItem?.fields?.Name,
          Description: typeItem?.fields?.BeltTypeHelpText,
          Image: typeItem?.fields?.Image,
        },
      })),
    [routeFields?.Types],
  );

  const beltTypeCards = useMemo(() => {
    const routeBeltTypeCards = getMatchedRouteCards(
      routeBeltTypes,
      beltTypeFacetValues,
    );

    if (routeBeltTypeCards.length) {
      return routeBeltTypeCards;
    }

    return beltTypeFacetValues.map((facetValue) => ({
      id: facetValue.id,
      valueId: facetValue.id,
      Title: { value: facetValue.text },
      Description: { value: "" },
      Image: undefined,
    }));
  }, [routeBeltTypes, beltTypeFacetValues]);

  const isStep2Enabled = Boolean(selectedTechnologyValueId);
  const isStep3Enabled = Boolean(
    selectedTechnologyValueId && selectedBeltTypeValueId,
  );
  const isStep4Enabled = Boolean(
    selectedTechnologyValueId &&
    selectedBeltTypeValueId &&
    (selectedBeltPitchUsValueId || selectedBeltPitchMetricValueId),
  );
  const showStep1Message = Boolean(
    selectedTechnologyValueId && !selectedBeltTypeValueId,
  );
  const showStep2Message = !isStep4Enabled;
  const accordionAutoExpandedKeys = useMemo(() => {
    const keys = ["step1"];
    if (isStep2Enabled) {
      keys.push("step2");
    }
    if (isStep3Enabled) {
      keys.push("step3");
    }
    if (isStep4Enabled) {
      keys.push("step4");
    }
    return keys;
  }, [isStep2Enabled, isStep3Enabled, isStep4Enabled]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Spinner loading />
      </div>
    );
  }
  return (
    <div ref={widgetRef}>
      <div className="flex relative max-w-full text-black dark:text-gray-100">
        {/* {isFetching && (
          <div className="w-full h-full fixed top-0 left-0 bottom-0 right-0 z-30 bg-white dark:bg-gray-800 opacity-50">
            <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] flex flex-col justify-center items-center z-40">
              <Spinner loading />
            </div>
          </div>
        )} */}
        {totalItems > 0 && (
          <div className="w-full">
            <Accordion
              key={accordionAutoExpandedKeys.join("|")}
              defaultExpandedKeys={accordionAutoExpandedKeys}
              allowsMultipleExpanded
            >
              <AccordionItem
                id="step1"
                title={fields?.Step1Title?.value}
                className="[&_>_div]:pb-8 [&_h4_svg]:ml-4 [&_h4_svg]:size-4 [&_h4_svg]:shrink-0 
                [&_button]:hover:bg-transparent [&_h4]:pointer-events-none"
              >
                <FacetCardGrid
                  cards={technologyCards}
                  selectedValueId={selectedTechnologyValueId}
                  dimUnselectedWhenSelected
                  onSelect={(valueId) => {
                    selectSingleFacetValue(TECHNOLOGY_FACET_NAME, valueId);
                    clearFacetSelection(BELT_TYPE_FACET_NAME);
                    clearFacetSelection(BELT_PITCH_US_FACET_NAME);
                    clearFacetSelection(BELT_PITCH_METRIC_FACET_NAME);
                    setActiveBeltPitchUnit("us");
                  }}
                  message={step1Message}
                  showMessage={showStep1Message}
                />
              </AccordionItem>
              <AccordionItem
                id="step2"
                title={fields?.Step2Title?.value}
                className={`[&_>_div]:pb-8 [&_button]:hover:bg-transparent [&_h4_svg]:ml-4 [&_h4_svg]:size-4 [&_h4_svg]:shrink-0 
                  [&_svg]:ml-4 [&_svg]:size-4 [&_svg]:shrink-0 [&_h4]:pointer-events-none ${!isStep2Enabled ? "opacity-50 [&_button]:pointer-events-none [&_button]:cursor-not-allowed" : ""}`}
                buttonProps={{
                  isDisabled: !isStep2Enabled,
                }}
              >
                {isStep2Enabled && (
                  <FacetCardGrid
                    cards={beltTypeCards}
                    selectedValueId={selectedBeltTypeValueId}
                    dimUnselectedWhenSelected
                    onSelect={(valueId) => {
                      selectSingleFacetValue(BELT_TYPE_FACET_NAME, valueId);
                      clearFacetSelection(BELT_PITCH_US_FACET_NAME);
                      clearFacetSelection(BELT_PITCH_METRIC_FACET_NAME);
                    }}
                    message={step2Message}
                    showMessage={showStep2Message}
                    requireImage
                    hideDescription={true}
                  />
                )}
              </AccordionItem>
              <AccordionItem
                id="step3"
                title={fields?.Step3Title?.value}
                className={`[&_h4]:pointer-events-none [&_>_div]:pb-8 [&_h4_svg]:ml-4 [&_h4_svg]:size-4 [&_h4_svg]:shrink-0 ${!isStep3Enabled ? "opacity-50 [&_button]:pointer-events-none [&_button]:cursor-not-allowed" : ""}`}
                buttonProps={{
                  isDisabled: !isStep3Enabled,
                }}
              >
                {isStep3Enabled && <RichText field={fields?.Step3Message} />}
                {isStep3Enabled && (
                  <BeltPitchSelector
                    activeBeltPitchUnit={activeBeltPitchUnit}
                    selectedBeltPitchValueId={selectedBeltPitchValueId}
                    beltPitchUsValues={beltPitchUsValues}
                    beltPitchMetricValues={beltPitchMetricValues}
                    onUnitChange={(unit) => {
                      setActiveBeltPitchUnit(unit);
                      if (unit === "us") {
                        clearFacetSelection(BELT_PITCH_METRIC_FACET_NAME);
                      } else {
                        clearFacetSelection(BELT_PITCH_US_FACET_NAME);
                      }
                    }}
                    onPitchSelect={selectSingleFacetValue}
                  />
                )}
              </AccordionItem>
              <AccordionItem
                id="step4"
                title={fields?.Step4Title?.value}
                className={`[&_h4]:pointer-events-none [&_>_div]:pb-8 [&_h4_svg]:ml-4 [&_h4_svg]:size-4 [&_h4_svg]:shrink-0 ${!isStep4Enabled ? "opacity-50 [&_button]:pointer-events-none [&_button]:cursor-not-allowed" : ""}`}
                buttonProps={{
                  isDisabled: !isStep4Enabled,
                }}
              >
                {isStep4Enabled && (
                  <SearchResultStep4Cta
                    step4MessageTemplate={fields?.Step4Message?.value}
                    seriesCount={beltSeriesCount}
                    step4ItemLink={step4ItemLink}
                    buttonText={fields?.ButtonText?.value}
                  />
                )}
              </AccordionItem>
            </Accordion>
          </div>
        )}
        {totalItems <= 0 && !isFetching && (
          <div className="w-full flex justify-center flex-col items-center gap-4">
            <h1>No results found</h1>
          </div>
        )}
      </div>
    </div>
  );
};

const BeltFinderSearchResultWidget = widget(
  BeltIdentifierSearchResultComponent,
  WidgetDataType.SEARCH_RESULTS,
  "product",
);
export default BeltFinderSearchResultWidget;
