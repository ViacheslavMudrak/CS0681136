import {
  DailyReflectionListingProps,
  DailyReflectionListingStatics,
} from './DailyReflectionListing.types';
import classNames from 'classnames/bind';
import { useKeyphraseUrlSync } from 'components/search/hooks/useKeyphraseUrlSync';
import ReflectionGridCard from 'components/search/result-cards/ReflectionGridCard';
import PreviewSearchBarWidget from 'components/search/widgets/PreviewSearchBar';
import ReflectionListingSearchResultsWidget from 'components/search/widgets/ReflectionListingSearchResults';
import compose from 'lib/enhancers/compose';
import { withJumplink } from 'lib/enhancers/withJumplink';
import withStyles from 'lib/enhancers/withStyles';
import { useI18n } from 'next-localization';
import { JSX, useCallback } from 'react';

import { Text, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import type { ActionProp, ItemClickedAction } from '@sitecore-search/core';

import styles from './DailyReflectionListing.module.scss';

const cx = classNames.bind(styles);

const DailyReflectionListing = (props: DailyReflectionListingProps): JSX.Element => {
  const { fields } = props;
  const { t } = useI18n();

  const placeholderText =
    t('DailyReflectionListingSearchBoxPlaceholderText') ||
    DailyReflectionListingStatics.PlaceholderText;

  // Initialize from URL query parameter
  const { keyphrase: widgetKeyphrase, setKeyphrase: setWidgetKeyphrase } = useKeyphraseUrlSync({
    queryParamName: 'q',
  });

  const handleClearKeyphrase = () => {
    setWidgetKeyphrase('');
  };

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
      <ReflectionGridCard
        key={item?.id || `skeleton-${index}`}
        reflection={item as Parameters<typeof ReflectionGridCard>[0]['reflection']}
        index={index}
        onItemClick={onItemClick}
        isLoading={isLoading}
      />
    ),
    []
  );

  return (
    <div
      className={cx(
        'daily-reflection-listing',
        'component container flex flex-col gap-10',
        props.stylesSXA
      )}
    >
      <div
        className={cx(
          'daily-reflection-listing__header',
          'flex flex-col md:flex-row md:justify-between gap-4 items-start md:items-center'
        )}
      >
        <div
          className={cx(
            'daily-reflection-listing__headline',
            'flex flex-col eyebrow eyebrow-font-size'
          )}
        >
          <Text tag="span" field={fields.label} />
          <Text tag="h2" field={fields.headline} />
        </div>
        <div className={cx('daily-reflection-listing__search', '')}>
          <PreviewSearchBarWidget
            rfkId="reflection-listing-ps"
            keyphrase={widgetKeyphrase}
            defaultItemsPerPage={10}
            inputClassName={cx('daily-reflection-listing__search-input')}
            placeholder={placeholderText}
            submitRedirectionHandler={(query) => {
              setWidgetKeyphrase(query);
            }}
            displaySuggestions={false}
            displayPreviewSearchResults={false}
            displayCloseButton={true}
          />
        </div>
      </div>

      <ReflectionListingSearchResultsWidget
        rfkId="reflection-listing"
        keyphrase={widgetKeyphrase}
        defaultSortType="publish_date_descending"
        renderResultCard={renderResultCard}
        showSortOrder={false}
        clearKeyphrase={handleClearKeyphrase}
      />
    </div>
  );
};

export default compose<DailyReflectionListingProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(DailyReflectionListing);
