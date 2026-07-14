import {
  DirectoryEntryItem,
  DirectoryEntryListingStatics,
  DirectoryEntryListingProps,
} from 'components/IntranetComponents/DirectoryEntryListing/DirectoryEntryListing.types';
import {
  WidgetDataType,
  useSearchResults,
  useSearchResultsActions,
  widget,
  FilterEqual,
  FilterAnd,
  FilterAnyOf,
} from '@sitecore-search/react';
import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import Filters from 'components/search/components/Filter';
import SearchFacets from 'components/search/components/SearchFacets';
import SearchPagination from 'components/search/components/SearchPagination';
import { useFacetState } from 'components/search/hooks/useFacetState';
import { useUserFavorites } from 'lib/firebase/hooks/use-user-favorites';
import { useGlobalHeaderStore } from 'lib/zustand/globalheaderstore';
import { useSession } from 'next-auth/react';
import { useI18n } from 'next-localization';
import { useRouter } from 'next/router';
import { JSX, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import React from 'react';
import { MediaQueryConstants } from 'src/util/const/material';
import { isMediaUrl } from 'src/util/helpers/string-helpers';

import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { debounce } from '@sitecore-search/common';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import type { SearchResultsInitialState } from '@sitecore-search/react';
import useMediaQuery from '@mui/material/useMediaQuery';

import styles from './styles.module.scss';

const cx = classNames.bind(styles);

type InitialState = SearchResultsInitialState<
  'itemsPerPage' | 'keyphrase' | 'page' | 'sortType' | 'selectedFacets'
>;

// Props interface for the inner widget component
interface DirectoryEntryListingWidgetProps extends DirectoryEntryListingProps {
  folderPath?: string[];
}

const getEntryDisplayName = (entry: DirectoryEntryItem): string => entry.title || entry.name || '';

export const DirectoryEntryListingSearchResultsComponent = (
  props: DirectoryEntryListingWidgetProps
): JSX.Element => {
  const { fields, params } = props;
  const folderPath = fields?.data?.datasource?.directoryEntries?.targetItems?.map((item) => {
    return item?.path;
  });

  // Extract ability flags from rendering params (1 = enabled, 0 or undefined = disabled)
  const showSearch = params?.abilitytoSearch === '1';
  const showFavorites = params?.abilitytoFavorite === '1';
  const showFilters = params?.abilitytoFilter === '1';

  const { t } = useI18n();

  // Extract field values with dictionary fallbacks
  const searchPlaceholderText =
    fields?.data?.datasource?.searchPlaceholderText?.value ||
    t('DirectoryEntryListingSearchPlaceholder') ||
    DirectoryEntryListingStatics.searchPlaceholderText;
  const listingTitle =
    fields?.data?.datasource?.listingTitle?.value ||
    t('DirectoryEntryListingTitle') ||
    DirectoryEntryListingStatics.listingTitle;
  const filtersLabel =
    t('DirectoryEntryListingFiltersLabel') || DirectoryEntryListingStatics.filtersLabel;
  const loadingText =
    t('DirectoryEntryListingLoadingText') || DirectoryEntryListingStatics.loadingText;
  const noMatchesTitle =
    t('DirectoryEntryListingNoMatchesTitle') || DirectoryEntryListingStatics.noMatchesTitle;
  const noMatchesDescription =
    t('DirectoryEntryListingNoMatchesDescription') ||
    DirectoryEntryListingStatics.noMatchesDescription;
  const addedToFavorites =
    t('DirectoryEntryListingAddedToFavorites') || DirectoryEntryListingStatics.addedToFavorites;
  const directoryEntryListAriaLabel =
    t('DirectoryEntryListingAriaLabel') || DirectoryEntryListingStatics.directoryEntryListAriaLabel;

  const router = useRouter();
  const initialQuery = (router.query.q as string) || '';

  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const isMobile = useMediaQuery(MediaQueryConstants.Mobile);

  const [inputValue, setInputValue] = useState(initialQuery);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showAddedFavorites, setShowAddedFavorites] = useState(false);

  const { page: sitecorePage } = useSitecore();
  const { openFavoritesMenu } = useGlobalHeaderStore();
  const defaultFavorites =
    sitecorePage?.layout?.sitecore?.context?.userDefaultSettings?.targetItem?.defaultFavorites;

  const isAutoFilterEnabled = props?.fields?.data?.datasource?.autoFilterEnabled?.value === '1';
  const siteAreaTags = props?.fields?.data?.page?.areaTags?.targetItems?.map((item) => {
    return item?.name;
  });
  const topicTags = props?.fields?.data?.datasource?.topicTags?.targetItems?.map((item) => {
    return item?.name;
  });
  const manualSelectedFolderPaths =
    props?.fields?.data?.datasource?.manualDirectoryEntries?.targetItems?.map((item) => {
      return item?.path;
    });

  // Favorites integration
  const {
    favorites: userFavorites,
    createUserFavorite,
    deleteUserFavorite,
    setFavoriteFlag,
    saveSitecoreDefaultsToFirebase,
  } = useUserFavorites();

  // Build a URL → favorite ID map for O(1) lookup of favorited entries
  const favoritedUrlMap = useMemo(() => {
    const map = new Map<string, string>();
    if (userFavorites?.favorites) {
      for (const fav of userFavorites.favorites) {
        if (fav.url && fav.id) {
          map.set(fav.url, fav.id);
        }
      }
    }
    return map;
  }, [userFavorites?.favorites]);

  const { onFacetClick } = useSearchResultsActions();

  const {
    widgetRef,
    actions: { onKeyphraseChange, onItemClick },
    state: { page, itemsPerPage, keyphrase, selectedFacets },
    queryResult: {
      isFetching,
      isLoading,
      data: { total_item: totalItems = 0, facet: facets = [], content: entries = [] } = {},
    },
  } = useSearchResults<DirectoryEntryItem, InitialState>({
    query: (query) => {
      // Filter by result_type "Directory Entry" (confirmed in CEC)
      const resultTypeFilter = new FilterEqual('result_type', 'Directory Entry');

      // Server-side filtering by folder using ancestors field
      // The ancestors array contains all parent folder paths for each entry
      // This allows efficient filtering to show only entries within the selected folder
      const hasValidFolderPaths = folderPath && folderPath?.length > 0;
      const hasValidManualSelectedFolderPaths =
        manualSelectedFolderPaths && manualSelectedFolderPaths?.length > 0;
      if (isAutoFilterEnabled || hasValidFolderPaths || hasValidManualSelectedFolderPaths) {
        const filter = [];
        filter.push(resultTypeFilter);
        if (hasValidFolderPaths || hasValidManualSelectedFolderPaths) {
          const combinedFolderPaths = hasValidFolderPaths
            ? hasValidManualSelectedFolderPaths
              ? folderPath.concat(manualSelectedFolderPaths)
              : folderPath
            : manualSelectedFolderPaths;
          const ancestorsFilter = new FilterAnyOf('ancestors', combinedFolderPaths);
          filter.push(ancestorsFilter);
        }
        if (isAutoFilterEnabled && siteAreaTags && siteAreaTags.length > 0) {
          const areaTagsFilter = new FilterAnyOf('all_tags', siteAreaTags);
          filter.push(areaTagsFilter);
        }
        if (topicTags && topicTags.length > 0) {
          const topicTagsFilter = new FilterAnyOf('all_tags', topicTags);
          filter.push(topicTagsFilter);
        }
        query.getRequest().setSearchFilter(new FilterAnd(filter));
      } else {
        query.getRequest().setSearchFilter(resultTypeFilter);
      }
    },
    state: {
      sortType: 'directory_listing_sort',
      page: 1,
      itemsPerPage: 24,
      keyphrase: initialQuery,
      selectedFacets: [], // Restored from query string after facets load
    },
  });

  // Restore and sync selected facets to/from the URL query string (e.g. ?f.ministries=texas)
  useFacetState({
    keyphrase: keyphrase || '',
    selectedFacets,
    facets,
    isLoading,
    isFetching,
    onFacetClick,
  });

  // Apply the q query param to the search input and trigger keyphrase search
  useEffect(() => {
    if (initialQuery) {
      setInputValue(initialQuery);
      onKeyphraseChange({ keyphrase: initialQuery });
    }
  }, [initialQuery, onKeyphraseChange]);

  // Server-side filtering is now handled by FilterAnyOf in the query
  // No need for client-side filtering
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const pageScrollRef = useRef<HTMLDivElement>(null);

  // Keep latest references to avoid stale closures inside the debounced fn
  const onKeyphraseChangeRef = useRef(onKeyphraseChange);
  onKeyphraseChangeRef.current = onKeyphraseChange;
  const routerRef = useRef(router);
  routerRef.current = router;

  // Create a single stable debounced function that never gets recreated
  const debouncedSearch = useRef(
    debounce((value: string) => {
      onKeyphraseChangeRef.current({ keyphrase: value });

      // Sync the URL query string with the current search term
      const url = new URL(window.location.href);
      if (value) {
        url.searchParams.set('q', value);
      } else {
        url.searchParams.delete('q');
      }
      routerRef.current.replace(url.pathname + url.search, undefined, { shallow: true });
    }, 500)
  ).current;

  const keyphraseChangeFn = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleClearSearch = useCallback(() => {
    setInputValue('');
    onKeyphraseChangeRef.current({ keyphrase: '' });
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    routerRef.current.replace(url.pathname + url.search, undefined, { shallow: true });
  }, []);

  // Helper function to handle file download
  const handleDownload = async (url: string) => {
    window.open(url, '_blank');
  };

  useEffect(() => {
    if (!isMobile) {
      document.body.classList.remove('no-scroll');
      return;
    }

    document.body.classList.toggle('no-scroll', mobileFiltersOpen);

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isMobile, mobileFiltersOpen]);

  const showFavoritesToast = () => {
    setShowAddedFavorites(true);
  };

  const closeAddedFavorites = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setShowAddedFavorites(false);
  };

  const handleToggleFavorite = async (entry: DirectoryEntryItem) => {
    const entryUrl = entry.url || '#';
    const existingFavoriteId = favoritedUrlMap.get(entryUrl);

    if (existingFavoriteId) {
      await deleteUserFavorite(existingFavoriteId);
    } else {
      if (
        !userFavorites?.isFavoritesModified &&
        defaultFavorites &&
        defaultFavorites.targetItems &&
        defaultFavorites.targetItems.length > 0
      ) {
        await saveSitecoreDefaultsToFirebase(defaultFavorites);
      }
      await createUserFavorite({
        name: getEntryDisplayName(entry),
        url: entryUrl,
        icon: 'ListAlt',
        type: 'directory-entry',
      });
      if (!userFavorites?.isFavoritesModified && !defaultFavorites?.targetItems?.length) {
        await setFavoriteFlag(true);
      }
      openFavoritesMenu();
      showFavoritesToast();
    }
  };

  return (
    <>
      <div
        ref={widgetRef}
        className={cx(
          'directory-entry-listing',
          'component container flex flex-col gap-8',
          props.stylesSXA
        )}
      >
        {/* Header Section */}
        <div ref={pageScrollRef} className={cx('directory-entry-listing__header')}>
          <h1 className={cx('directory-entry-listing__title')}>{listingTitle}</h1>
          {showSearch && (
            <div className={cx('directory-entry-listing__search', 'flex')}>
              <input
                type="search"
                placeholder={searchPlaceholderText}
                value={inputValue}
                onChange={keyphraseChangeFn}
              />
              <MaterialIcon name="Search" />
            </div>
          )}
        </div>

        {/* Results Summary + Active Filters */}
        {keyphrase && (
          <div className={cx('directory-entry-listing__results-summary')}>
            <span>
              {totalItems} Search Results for <strong>&quot;{keyphrase}&quot;</strong>
            </span>
            <button
              onClick={handleClearSearch}
              className={cx('directory-entry-listing__clear-search')}
            >
              Clear
            </button>
          </div>
        )}
        {showFilters && (
          <div>
            <Filters currentKeyphrase={keyphrase} showTermSummary={false} />
          </div>
        )}

        {/* Mobile Filter Toggle - only show if filters are enabled */}
        {showFilters && isMobile && (
          <div
            className={cx(
              'directory-entry-listing__filter-by-text',
              'flex items-center gap-2 cursor-pointer'
            )}
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
          >
            <MaterialIcon name="FilterList" />
            <span>{filtersLabel}</span>
          </div>
        )}

        {/* Main Content */}
        <div
          className={cx('directory-entry-listing__content-container', 'flex flex-col md:flex-row')}
        >
          {/* Sidebar with Filters - only show if filters are enabled */}
          {showFilters && (
            <aside
              className={cx(
                'directory-entry-listing__sidebar',
                isMobile && mobileFiltersOpen ? 'is-open' : ''
              )}
            >
              {isMobile && mobileFiltersOpen && (
                <div
                  className={cx(
                    'directory-entry-listing__mobile-filter-menu-header',
                    'flex gap-4 justify-between'
                  )}
                >
                  <div className="flex gap-2 items-center">
                    <MaterialIcon name="FilterList" />
                    <span>{filtersLabel}</span>
                  </div>
                  <div
                    className={cx('directory-entry-listing__mobile-filter-menu-close', '')}
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <MaterialIcon name="Close" />
                  </div>
                </div>
              )}
              <SearchFacets facets={facets} />
            </aside>
          )}

          {/* Main Content Area - full width when filters are disabled */}
          <main
            className={cx(
              'directory-entry-listing__main',
              'flex flex-col gap-6',
              showFilters ? 'flex-[0_0_100%] md:flex-[0_0_80%]' : 'flex-[0_0_100%]'
            )}
          >
            {isLoading || isFetching ? (
              <div className={cx('directory-entry-listing__loading')}>{loadingText}</div>
            ) : (
              <>
                {entries.length > 0 ? (
                  <>
                    <ul
                      className={cx('directory-entry-listing__link-list', 'flex flex-col gap-4')}
                      aria-label={directoryEntryListAriaLabel}
                    >
                      {entries.map((entry, index) => (
                        <li
                          key={entry.id}
                          className={cx(
                            'directory-entry-listing__link-content',
                            'flex justify-between items-center'
                          )}
                        >
                          <div className="flex flex-col gap-2">
                            {entry.url ? (
                              <a
                                href={entry.url}
                                onClick={(_e) => {
                                  _e.preventDefault();
                                  onItemClick({
                                    id: entry.id,
                                    index,
                                    sourceId: entry.source_id,
                                  });
                                  // Navigate to the entry URL
                                  if (entry.url) {
                                    window.location.href = entry.url;
                                  }
                                }}
                              >
                                {getEntryDisplayName(entry)}
                              </a>
                            ) : (
                              <span
                                className={cx('directory-entry-listing__link-content--empty-link')}
                              >
                                {getEntryDisplayName(entry)}
                              </span>
                            )}
                            {entry.description && <p>{entry.description}</p>}
                            {entry.job_title && (
                              <span className={cx('directory-entry-listing__job-title')}>
                                {entry.job_title}
                              </span>
                            )}
                            {entry.department && (
                              <span className={cx('directory-entry-listing__department')}>
                                {entry.department}
                              </span>
                            )}
                          </div>
                          <div className={cx('directory-entry-listing__link-icons', 'flex gap-2')}>
                            {entry.url && isMediaUrl(entry.url) && (
                              <button
                                onClick={() => {
                                  if (entry.url) {
                                    handleDownload(entry.url);
                                  }
                                }}
                                aria-label={`Download ${getEntryDisplayName(entry)}`}
                              >
                                <MaterialIcon name="FileDownloadOutlined" />
                              </button>
                            )}
                            {entry.url && !isMediaUrl(entry.url) && (
                              <button
                                onClick={() => {
                                  if (entry.url) {
                                    const fullUrl = entry.url.startsWith('http')
                                      ? entry.url
                                      : `${window.location.origin}${entry.url}`;
                                    navigator.clipboard.writeText(fullUrl);
                                  }
                                }}
                                aria-label={`Copy link for ${getEntryDisplayName(entry)}`}
                              >
                                <MaterialIcon name="LinkOutlined" />
                              </button>
                            )}
                            {showFavorites && isLoggedIn && entry.url && (
                              <button
                                onClick={() => handleToggleFavorite(entry)}
                                aria-label={
                                  favoritedUrlMap.has(entry.url || '#')
                                    ? `Remove ${getEntryDisplayName(entry)} from favorites`
                                    : `Add ${getEntryDisplayName(entry)} to favorites`
                                }
                              >
                                <MaterialIcon
                                  name={
                                    favoritedUrlMap.has(entry.url || '#')
                                      ? 'Favorite'
                                      : 'FavoriteBorderOutlined'
                                  }
                                />
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className={cx('directory-entry-listing__pagination-container')}>
                        <SearchPagination
                          currentPage={page}
                          totalPages={totalPages}
                          scrollTargetRef={pageScrollRef}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className={cx('directory-entry-listing__empty-state')}>
                    <h3>{noMatchesTitle}</h3>
                    <p>{noMatchesDescription}</p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Favorites Toast Notification */}
      <Snackbar
        open={showAddedFavorites}
        autoHideDuration={3000}
        onClose={closeAddedFavorites}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeAddedFavorites} severity="success" variant="filled">
          {addedToFavorites}
        </Alert>
      </Snackbar>
    </>
  );
};

const DirectoryEntryListingSearchResultsWidget = widget(
  DirectoryEntryListingSearchResultsComponent,
  WidgetDataType.SEARCH_RESULTS,
  'content'
);

export default DirectoryEntryListingSearchResultsWidget;
