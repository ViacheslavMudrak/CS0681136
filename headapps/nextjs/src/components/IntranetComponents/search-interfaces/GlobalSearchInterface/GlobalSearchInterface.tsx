import { JSX, useCallback, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import type { ActionProp, ItemClickedAction } from '@sitecore-search/core';

import {
  GlobalSearchInterfaceProps,
  GlobalSearchInterfaceStatics,
} from './GlobalSearchInterface.types';

// CSS module styles
import styles from './GlobalSearchInterface.module.scss';
import SearchResultListingWidget from 'components/search/widgets/SearchResultListing';
import { Text } from '@sitecore-content-sdk/nextjs';
import { Placeholder } from '@sitecore-content-sdk/nextjs';
import GlobalResultCard from 'components/search/result-cards/GlobalResultCard';
import { useKeyphraseUrlSync } from 'components/search/hooks/useKeyphraseUrlSync';
import GlobalSearchBarWidget from 'components/search/widgets/GlobalSearchBar';
import { useI18n } from 'next-localization';

const cx = classNames.bind(styles);

const GlobalSearchInterface = (props: GlobalSearchInterfaceProps): JSX.Element => {
  const { fields, rendering } = props;
  const { t } = useI18n();
  const phKey = `global-announcements-${props?.params?.DynamicPlaceholderId}`;

  const searchPlaceholderText =
    t('GlobalSearchPlaceholderText') || GlobalSearchInterfaceStatics.searchPlaceholderText;
  const noMatchesHeading =
    t('GlobalSearchNoMatchesHeading') || GlobalSearchInterfaceStatics.noMatchesHeading;
  const noMatchesSubtext =
    t('GlobalSearchNoMatchesSubtext') || GlobalSearchInterfaceStatics.noMatchesSubtext;

  const showRecentSuggestions = rendering.params?.displayRecentSearches === '1';
  const showTrendingSuggestions = rendering.params?.displayTrendingSearches === '1';

  // Manage widget keyphrase state synchronized with URL query parameter
  const { keyphrase: widgetKeyphrase, setKeyphrase: setWidgetKeyphrase } = useKeyphraseUrlSync({
    queryParamName: 'q',
  });

  // Store results data from SearchResultListingWidget
  const headerRef = useRef<HTMLDivElement>(null);

  const [resultsData, setResultsData] = useState<{ totalItems: number; keyphrase: string } | null>(
    null
  );

  const handleResultsChange = useCallback((data: { totalItems: number; keyphrase: string }) => {
    setResultsData(data);
  }, []);

  const renderResultCard = useCallback(
    ({
      item,
      index,
      onItemClick,
      isLoading,
    }: {
      item: { id: string; [key: string]: unknown } | null;
      index: number;
      onItemClick: ActionProp<ItemClickedAction>;
      isLoading: boolean;
    }) => (
      <GlobalResultCard
        key={item?.id || `skeleton-${index}`}
        article={item as Parameters<typeof GlobalResultCard>[0]['article']}
        index={index}
        onItemClick={onItemClick}
        isLoading={isLoading}
      />
    ),
    []
  );

  return (
    <div
      className={cx('global-search-interface', 'component', props.stylesSXA)}
      id={rendering.params?.RenderingIdentifier}
    >
      <div ref={headerRef} className={cx('global-search-interface__header')}>
        <div className={cx('global-search-interface__container', 'container flex flex-col gap-6')}>
          <Text
            tag="h1"
            className={cx('global-search-interface__title')}
            field={fields.listingTitle}
          />
          <div className={cx('global-search-interface__search-container')}>
            <GlobalSearchBarWidget
              keyphrase={widgetKeyphrase}
              defaultItemsPerPage={5}
              rfkId={'global_search_ps'}
              placeholder={searchPlaceholderText}
              itemRedirectionHandler={(_article) => {
                window.location.href = _article.url || '';
              }}
              submitRedirectionHandler={(query) => {
                setWidgetKeyphrase(query);
              }}
              showRecentSuggestions={showRecentSuggestions}
              showTrendingSuggestions={showTrendingSuggestions}
            />
            {resultsData && (
              <div className={cx('global-search-interface__results-summary')}>
                {resultsData.totalItems > 0 ? (
                  <span>
                    Showing {resultsData.totalItems}{' '}
                    {resultsData.totalItems === 1 ? 'result' : 'results'}{' '}
                    {resultsData.keyphrase && (
                      <>
                        for{' '}
                        <span className={cx('global-search-interface__results-summary__keyphrase')}>
                          &quot;{resultsData.keyphrase}&quot;
                        </span>
                      </>
                    )}
                  </span>
                ) : (
                  <span>No results for &quot;{resultsData.keyphrase}&quot;</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={cx('global-search-interface__container', 'container')}>
        <Placeholder name={phKey} rendering={rendering} />
        <SearchResultListingWidget
          rfkId="global-search"
          keyphrase={widgetKeyphrase}
          defaultSortType="relevance_score_descending"
          renderResultCard={renderResultCard}
          layoutMode="row"
          showSortOrder={true}
          emptyStateTitle={noMatchesHeading}
          emptyStateBody={noMatchesSubtext}
          onResultsChange={handleResultsChange}
          showTermSummary={false}
          filterPosition="listing"
          displayFacetValueCount={true}
          scrollTargetRef={headerRef}
        />
      </div>
    </div>
  );
};

export default GlobalSearchInterface;
