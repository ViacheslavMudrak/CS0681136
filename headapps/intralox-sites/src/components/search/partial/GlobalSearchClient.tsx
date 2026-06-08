"use client";

import { JSX, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSearchParams } from "next/navigation";
import SearchResultsWidget from "../widgets/SearchResults";
import { ISearchComponentFields, ISearchPageFields } from "../SearchComponent.type";
import { resolveSearchLocaleContext } from "../../shared/searchLocaleContext";
import GlobalSearchBox from "../widgets/GlobalSearchBox";
interface ISearchComponentClientProps {
  rfkId: string;
  fields?: ISearchComponentFields;
  pageFields?: ISearchPageFields;
  isScollPagination?: boolean;
}

const GlobalSearchClientBase = ({
  rfkId,
  fields,
  pageFields,
  isScollPagination = false,
}: ISearchComponentClientProps): JSX.Element => {
  const params = useParams();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const pageParam = Number.parseInt(searchParams.get("page") || "1", 10);
  const defaultPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const searchWidgetKey = `${query}-${defaultPage}`;
  const routeLocale =
    typeof params?.locale === "string" ? params.locale : undefined;
  const localeContext = resolveSearchLocaleContext(routeLocale);

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    const forceScrollToTop = () => {
      // Re-apply on the next frame to beat browser restoration timing.
      scrollToTop();
      window.requestAnimationFrame(() => {
        scrollToTop();
      });
    };

    const previousScrollRestoration = window.history.scrollRestoration;
    if (window.history.scrollRestoration !== "manual") {
      window.history.scrollRestoration = "manual";
    }

    const shouldScrollToTop = (persisted = false) => {
      const navigationEntry = performance
        .getEntriesByType("navigation")
        .at(0) as PerformanceNavigationTiming | undefined;
      const isBackForwardNavigation = navigationEntry?.type === "back_forward";

      if (persisted || isBackForwardNavigation) {
        forceScrollToTop();
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      shouldScrollToTop(event.persisted);
    };

    const handlePopState = () => {
      forceScrollToTop();
    };

    forceScrollToTop();
    shouldScrollToTop();
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  return (
    <>
      <GlobalSearchBox placeholder={fields?.PlaceholderText?.value} />
      <SearchResultsWidget
        key={searchWidgetKey}
        rfkId={rfkId}
        defaultKeyphrase={query}
        defaultPage={defaultPage}
        defaultItemsPerPage={fields?.MaxItemsDisplayed?.value || 18}
        localeContext={localeContext}
        fields={fields}
        pageFields={pageFields}
        isScollPagination={isScollPagination}
        isGlobalSearchContent={true}
        isDropdownFacets={true}
      />
    </>
  );
};

export const GlobalSearchClient = GlobalSearchClientBase;
