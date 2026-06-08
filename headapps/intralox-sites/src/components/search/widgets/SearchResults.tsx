"use client";
import {
  WidgetDataType,
  useSearchResultsActions,
  useSearchResults,
  widget,
  FilterEqual,
} from "@sitecore-search/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ISearchResultArticle,
  ISearchResultProps,
} from "../SearchComponent.type";
import { Facets } from "./Facets";
import { PopupFacet } from "./PopupFacet/PopupFacet";
import { SearchContent } from "./SearchContent";
import SearchPagination from "../widgets/SearchPagination";
import { NextImage, RichText } from "@sitecore-content-sdk/nextjs";
import Spinner from "../widgets/Spinner";
import { SearchCardType } from "src/utils/enum";
import { cx, Popover } from "@laitram-l-l-c/intralox-ui-components";
import { DropdownFacets } from "./DropdownFacets";
import Filter from "./Filter";
import { Button, Dialog, DialogTrigger } from "react-aria-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { GlobalSearchContent } from "./GlobalSearchContent";
import { cn } from "lib/utils";
import { BeltFacets } from "./BeltFacets";
const SEARCH_ENV_FILTER = process.env.NEXT_PUBLIC_SEARCH_ENV?.trim();
const getArticleKey = (article: ISearchResultArticle) =>
  article.id || article.url;

const areArticlesEqual = (
  previousArticles: ISearchResultArticle[],
  nextArticles: ISearchResultArticle[],
) => {
  if (previousArticles.length !== nextArticles.length) {
    return false;
  }

  return previousArticles.every(
    (article, index) =>
      getArticleKey(article) === getArticleKey(nextArticles[index]),
  );
};

const SearchResultsComponent = ({
  defaultPage,
  defaultKeyphrase,
  defaultItemsPerPage,
  localeContext,
  fields,
  pageFields,
  cardType,
  isScollPagination = false,
  isDropdownFacets = false,
  isGlobalSearchContent = false,
  entityType = "content",
  gridType = "grid",
}: ISearchResultProps) => {
  const {
    widgetRef,
    actions: { onItemClick },
    state: { page, itemsPerPage, keyphrase },
    queryResult: {
      isLoading,
      isFetching,
      data: {
        total_item: totalItems = 0,
        sort: { choices: sortChoices = [] } = {},
        facet: facets = [],
        content: articles = [],
      } = {},
    },
  } = useSearchResults({
    query: (query) => {
      if (SEARCH_ENV_FILTER) {
        query
          .getRequest()
          .setSearchFilter(new FilterEqual("environment", SEARCH_ENV_FILTER));
      }

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
  const { onPageNumberChange } = useSearchResultsActions();
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const isLoadingNextPageRef = useRef(false);
  const [loadedArticles, setLoadedArticles] = useState<ISearchResultArticle[]>(
    [],
  );
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPage = page || 1;
  const hasMorePages = currentPage < totalPages;
  const shouldUseScrollPagination =
    isScollPagination && cardType !== SearchCardType.STANDALONE;
  const isBeltSeriesPage = cardType === SearchCardType.BELT_SERIES_PAGE;
  const enableFacets = fields?.EnableFacets?.value === true;
  const hasFacetOptions = Array.isArray(facets) && facets.length > 0;
  const currentArticles = useMemo(
    () => (articles as ISearchResultArticle[]) || [],
    [articles],
  );

  useEffect(() => {
    if (!shouldUseScrollPagination) {
      return;
    }

    if (currentPage <= 1) {
      setLoadedArticles((previousArticles) =>
        areArticlesEqual(previousArticles, currentArticles)
          ? previousArticles
          : currentArticles,
      );
      return;
    }

    setLoadedArticles((previousArticles) => {
      if (!currentArticles.length) {
        return previousArticles;
      }

      const articleKeys = new Set(previousArticles.map(getArticleKey));
      const nextArticles = [...previousArticles];

      currentArticles.forEach((article) => {
        const articleKey = getArticleKey(article);
        if (!articleKeys.has(articleKey)) {
          articleKeys.add(articleKey);
          nextArticles.push(article);
        }
      });

      return areArticlesEqual(previousArticles, nextArticles)
        ? previousArticles
        : nextArticles;
    });
  }, [currentArticles, currentPage, shouldUseScrollPagination]);

  useEffect(() => {
    if (!isFetching) {
      isLoadingNextPageRef.current = false;
    }
  }, [isFetching]);

  useEffect(() => {
    if (
      !shouldUseScrollPagination ||
      !loadMoreTriggerRef.current ||
      !hasMorePages
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          !entry?.isIntersecting ||
          isLoadingNextPageRef.current ||
          isFetching
        ) {
          return;
        }

        isLoadingNextPageRef.current = true;
        onPageNumberChange({ page: currentPage + 1 });
      },
      { rootMargin: "0px 0px 320px 0px" },
    );

    observer.observe(loadMoreTriggerRef.current);

    return () => observer.disconnect();
  }, [
    currentPage,
    hasMorePages,
    isFetching,
    onPageNumberChange,
    shouldUseScrollPagination,
  ]);

  const articlesToRender = shouldUseScrollPagination
    ? currentPage <= 1
      ? currentArticles
      : loadedArticles
    : currentArticles;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Spinner loading />
      </div>
    );
  }

  const showResultsLayout =
    totalItems > 0 || (isBeltSeriesPage && enableFacets && hasFacetOptions);

  return (
    <div ref={widgetRef}>
      <div className="flex relative max-w-full text-ink-primary dark:text-ink-inverse">
        {isFetching && (
          <div className="w-full h-full fixed top-0 left-0 bottom-0 right-0 z-30 bg-surface dark:bg-surface-inverse opacity-50">
            <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] flex flex-col justify-center items-center z-40">
              <Spinner loading />
            </div>
          </div>
        )}
        {showResultsLayout && (
          <div
            className={cx(
              "w-full",
              (isDropdownFacets || isBeltSeriesPage) && "flex flex-col pb-4",
              !isDropdownFacets &&
                !isBeltSeriesPage &&
                "my-6 grid gap-6 md:grid-cols-3 lg:grid-cols-4",
            )}
          >
            {isDropdownFacets && enableFacets && !isGlobalSearchContent && (
              <DropdownFacets facets={facets} />
            )}
            {!isDropdownFacets && !isBeltSeriesPage && enableFacets && (
              <>
                <div className="hidden md:grid gap-2.5 self-start justify-items-start rounded-xl bg-neutral-200 p-3">
                  {/* <Facets facets={facets} /> */}
                  <BeltFacets facets={facets} pageFields={pageFields} />
                </div>
                <div className="self-start md:hidden flex">
                  <DialogTrigger>
                    <Button className="text-sm leading-tight px-3 py-3 min-w-28 rounded-full transition-colors duration-150 flex flex-row justify-center items-center gap-1 hover:cursor-pointer focus:outline-hidden focus-visible:ring disabled:pointer-events-none bg-surface text-action border border-stroke-default">
                      <FontAwesomeIcon icon={faFilter} className="-ml-[2px]" />
                      Filter
                    </Button>
                    <Popover className="max-w-64 w-full overflow-y-auto rounded-lg border border-stroke-default bg-surface shadow-lg">
                      <Dialog className="outline-none ">
                        <div className="flex flex-col gap-2.5 p-3 ">
                          <BeltFacets facets={facets} pageFields={pageFields} />
                        </div>
                      </Dialog>
                    </Popover>
                  </DialogTrigger>
                </div>
              </>
            )}
            {isBeltSeriesPage && enableFacets && hasFacetOptions && (
              <PopupFacet facets={facets} />
            )}
            <div
              className={cx(
                !isDropdownFacets &&
                  !isBeltSeriesPage &&
                  "md:col-span-2 lg:col-span-3",
                (isDropdownFacets || isBeltSeriesPage) && "w-full",
              )}
            >
              {!isDropdownFacets && !isBeltSeriesPage && <Filter />}
              {totalItems > 0 ? (
                isGlobalSearchContent ? (
                  <div className="flex flex-col gap-2.5">
                    <GlobalSearchContent
                      articles={articlesToRender}
                      onItemClick={onItemClick}
                      searchText={keyphrase || defaultKeyphrase}
                    />
                  </div>
                ) : (
                  <SearchContent
                    articles={articlesToRender}
                    onItemClick={onItemClick}
                    defaultImage={fields?.DefaultImage?.value?.src}
                    cardType={cardType}
                    isDropdownFacets={isDropdownFacets}
                    gridType={gridType}
                  />
                )
              ) : null}
              {fields?.EnablePagination?.value && totalPages > 1 && (
                <>
                  {!isGlobalSearchContent && (
                    <hr
                      className={cn(
                        "border-stroke-default border-solid border-0 border-t my-12 mt-0",
                        gridType === SearchCardType.LIST_VIEW && "mb-6",
                      )}
                    />
                  )}

                  <div className="w-full text-base">
                    <SearchPagination
                      currentPage={page || 1}
                      totalPages={totalPages}
                      cardType={cardType || ""}
                      gridType={gridType}
                    />
                  </div>
                </>
              )}
              {shouldUseScrollPagination && hasMorePages && (
                <div
                  ref={loadMoreTriggerRef}
                  aria-hidden="true"
                  className="h-px w-full"
                />
              )}
            </div>
          </div>
        )}
        {totalItems <= 0 && !isFetching && (
          <div className="w-full mt-8 flex justify-center flex-col items-center gap-2">
            <NextImage field={fields?.NoResultFoundImage} />
            <RichText
              className="text-2xl text-ink-primary font-bold"
              tag="h3"
              field={fields?.NoResultFoundTitle}
            />
            <RichText
              className="text-ink-secondary text-base"
              field={fields?.NoResultFoundDescription}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const ContentSearchResultsWidget = widget(
  SearchResultsComponent,
  WidgetDataType.SEARCH_RESULTS,
  "content",
);

const ProductSearchResultsWidget = widget(
  SearchResultsComponent,
  WidgetDataType.SEARCH_RESULTS,
  "product",
);

const SearchResultsWidget = (props: ISearchResultProps) => {
  const ActiveSearchResultsWidget =
    props.entityType === "product"
      ? ProductSearchResultsWidget
      : ContentSearchResultsWidget;

  return <ActiveSearchResultsWidget {...props} />;
};

export default SearchResultsWidget;
