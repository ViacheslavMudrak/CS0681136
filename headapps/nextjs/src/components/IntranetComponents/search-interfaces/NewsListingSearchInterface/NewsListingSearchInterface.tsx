import { JSX, useCallback, useRef } from 'react';
import classNames from 'classnames/bind';
import type { ActionProp, ItemClickedAction } from '@sitecore-search/core';

import { NewsListingSearchInterfaceProps } from './NewsListingSearchInterface.types';

// CSS module styles
import styles from './NewsListingSearchInterface.module.scss';
import SearchResultListingWidget from 'components/search/widgets/SearchResultListing';
import NewsArticleCard from 'components/search/result-cards/NewsArticleGridCard';
import PreviewSearchBarWidget from 'components/search/widgets/PreviewSearchBar';
import { Placeholder } from '@sitecore-content-sdk/nextjs';
import { useKeyphraseUrlSync } from 'components/search/hooks/useKeyphraseUrlSync';

const cx = classNames.bind(styles);

const NewsListingSearchInterface = (props: NewsListingSearchInterfaceProps): JSX.Element => {
  const { fields, rendering } = props;
  const phKey = `news-listing-announcements-${props?.params?.DynamicPlaceholderId}`;

  // Manage keyphrase state synchronized with URL query parameter
  const { keyphrase: widgetKeyphrase, setKeyphrase } = useKeyphraseUrlSync({
    queryParamName: 'q',
  });

  const headerRef = useRef<HTMLDivElement>(null);

  // Handler for when search is submitted
  const handleSubmit = useCallback(
    (query: string) => {
      setKeyphrase(query);
    },
    [setKeyphrase]
  );

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
      <NewsArticleCard
        key={item?.id || `skeleton-${index}`}
        article={item as Parameters<typeof NewsArticleCard>[0]['article']}
        index={index}
        onItemClick={onItemClick}
        isLoading={isLoading}
      />
    ),
    []
  );

  return (
    <div
      className={cx('news-listing-search-interface', 'component', 'container', props.stylesSXA)}
      id={rendering.params?.RenderingIdentifier}
    >
      <div ref={headerRef} className={cx('news-listing-search-interface__header')}>
        <h1 className={cx('news-listing-search-interface__title')}>
          {fields.newsListingTitle.value}
        </h1>
        <div className={cx('news-listing-search-interface__search-container')}>
          <PreviewSearchBarWidget
            rfkId="news_listing_ps"
            defaultItemsPerPage={3}
            inputClassName={cx('news-listing-search-interface__search-input')}
            placeholder={fields.searchPlaceholderText.value}
            submitRedirectionHandler={handleSubmit}
            keyphrase={widgetKeyphrase}
            displaySuggestions={false}
            displayPreviewSearchResults={false}
            displayCloseButton={true}
          />
        </div>
      </div>
      <Placeholder name={phKey} rendering={rendering} />
      <SearchResultListingWidget
        rfkId="news-listing"
        keyphrase={widgetKeyphrase}
        defaultSortType="news_listing_sort"
        renderResultCard={renderResultCard}
        showSortOrder={false}
        scrollTargetRef={headerRef}
      />
    </div>
  );
};

export default NewsListingSearchInterface;
