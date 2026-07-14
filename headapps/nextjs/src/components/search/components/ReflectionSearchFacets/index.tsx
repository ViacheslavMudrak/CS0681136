// ReflectionSearchFacets component for filtering reflection listings

import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { useI18n } from 'next-localization';
import { useState, useEffect, useRef } from 'react';

import { SearchResultsAccordionFacets } from '@sitecore-search/ui';
import { useSearchResultsActions, useSearchResultsState } from '@sitecore-search/react';
import type { SearchResponseFacet } from '@sitecore-search/react';

import { DailyReflectionListingStatics } from '../../../IntranetComponents/DailyReflectionListing/DailyReflectionListing.types';
import styles from './styles.module.scss';

type ReflectionSearchFacetsProps = {
  facets: SearchResponseFacet[];
};

const ReflectionSearchFacets = ({ facets }: ReflectionSearchFacetsProps) => {
  const { t } = useI18n();
  const { onFacetClick } = useSearchResultsActions();
  const getSearchState = useSearchResultsState();
  const dictionaryStatics = {
    filterByDate:
      t('ReflectionSearchFacetsFilterByDate') || DailyReflectionListingStatics.FilterByDate,
    pickDateRange:
      t('ReflectionSearchFacetsPickDateRange') || DailyReflectionListingStatics.PickDateRange,
    from: t('ReflectionSearchFacetsFrom') || DailyReflectionListingStatics.From,
    to: t('ReflectionSearchFacetsTo') || DailyReflectionListingStatics.To,
    cancel: t('ReflectionSearchFacetsCancel') || DailyReflectionListingStatics.Cancel,
    ok: t('ReflectionSearchFacetsOk') || DailyReflectionListingStatics.Ok,
  };

  const [startDate, setStartDate] = useState<number | undefined>();
  const [endDate, setEndDate] = useState<number | undefined>();
  const [startDateRawValue, setStartDateRawValue] = useState('');
  const [endDateRawValue, setEndDateRawValue] = useState('');
  const [dateModal, setDateModal] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const startDateFacet = facets?.find((f) => f.name === 'reflections_published_date_start_date');
  const endDateFacet = facets?.find((f) => f.name === 'reflections_published_date_end_date');
  const tagFacet = facets?.find((f) => f.name === 'reflections_tags');
  const tagFacetIndex = tagFacet ? facets.findIndex((f) => f.name === tagFacet.name) : -1;
  const { selectedFacets = [] } = getSearchState();

  useEffect(() => {
    const dateFacet = selectedFacets?.find(
      (f) =>
        f.facetId === 'reflections_published_date_start_date' ||
        f.facetId === 'reflections_published_date_end_date'
    );
    if (!dateFacet) {
      setStartDateRawValue('');
      setStartDate(undefined);
      setEndDateRawValue('');
      setEndDate(undefined);
    }
  }, [selectedFacets]);

  useEffect(() => {
    if (!dateModal) return;
    const handler = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        setDateModal(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dateModal]);

  const handleApplyDateRange = () => {
    const minDate = startDate ? startDate : 20200101;
    const maxDate = endDate ? endDate : 20500101;

    onFacetClick({
      type: 'range',
      facetId: 'reflections_published_date_start_date',
      facetIndex: 0, // Does nothing, all values are needed though
      checked: true,
      min: minDate,
      max: maxDate,
    });
    setDateModal(false);
  };

  const handleClearDateRange = () => {
    setStartDateRawValue('');
    setStartDate(undefined);
    setEndDateRawValue('');
    setEndDate(undefined);
    setDateModal(false);
  };

  return (
    <div className={styles['reflection-search-facets']}>
      <SearchResultsAccordionFacets onFacetValueClick={onFacetClick}>
        {tagFacet && (
          <div className={styles['reflection-search-facets__tag-list']}>
            <div className="flex gap-4 flex-wrap">
              {tagFacet.value.map((facetValue, index) => {
                const isSelected = selectedFacets.some(
                  (facet) =>
                    'facetValueId' in facet &&
                    facet.facetId === tagFacet.name &&
                    facet.facetValueId === facetValue.id
                );

                return (
                  <button
                    key={facetValue.id}
                    type="button"
                    className={styles['reflection-search-facets__tag-button']}
                    data-selected={isSelected ? 'true' : 'false'}
                    onClick={() => {
                      if (tagFacetIndex < 0) return;
                      onFacetClick({
                        type: 'valueId',
                        facetId: tagFacet.name,
                        facetValueId: facetValue.id,
                        checked: !isSelected,
                        facetIndex: tagFacetIndex,
                        facetValueIndex: index,
                      });
                    }}
                  >
                    {facetValue.text}
                  </button>
                );
              })}
            </div>
            <div className={styles['reflection-search-facets__filter-date']}>
              <button
                className={styles['reflection-search-facets__filter-date-button']}
                onClick={() => setDateModal(true)}
                aria-haspopup="dialog"
                aria-expanded={dateModal}
              >
                <MaterialIcon name="DateRangeOutlined" />
                <span>{dictionaryStatics.filterByDate}</span>
              </button>
              <div
                ref={overlayRef}
                className={`${styles['reflection-search-facets__filter-date-overlay']} ${
                  dateModal ? styles['date-overlay-is-open'] : ''
                }`}
              >
                <span className={styles['reflection-search-facets__filter-date-text']}>
                  {dictionaryStatics.pickDateRange}
                </span>
                <span className={styles['reflection-search-facets__filter-date-text--bold']}>
                  {dictionaryStatics.from}
                </span>
                {startDateFacet && (
                  <input
                    type="date"
                    value={startDateRawValue}
                    name="reflections_filter_start_date"
                    onChange={(e) => {
                      setStartDateRawValue(e.target.value);
                      const date = e.target.value.replaceAll('-', '');
                      setStartDate(parseInt(date) || 0);
                    }}
                  />
                )}
                <span className={styles['reflection-search-facets__filter-date-text--bold']}>
                  {dictionaryStatics.to}
                </span>
                {endDateFacet && (
                  <input
                    type="date"
                    value={endDateRawValue}
                    name="reflections_filter_end_date"
                    onChange={(e) => {
                      setEndDateRawValue(e.target.value);
                      const date = e.target.value.replaceAll('-', '');
                      setEndDate(parseInt(date) || 0);
                    }}
                  />
                )}
                <div className={styles['reflection-search-facets__date-buttons']}>
                  <button onClick={handleClearDateRange}>{dictionaryStatics.cancel}</button>
                  <button onClick={handleApplyDateRange}>{dictionaryStatics.ok}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SearchResultsAccordionFacets>
    </div>
  );
};

export default ReflectionSearchFacets;
