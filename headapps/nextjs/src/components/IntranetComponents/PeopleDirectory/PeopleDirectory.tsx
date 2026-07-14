import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import compose from 'lib/enhancers/compose';
import { withJumplink } from 'lib/enhancers/withJumplink';
import withStyles from 'lib/enhancers/withStyles';
import { useI18n } from 'next-localization';
import { JSX, useState, useEffect, useRef } from 'react';
import React from 'react';
import { usePeopleDirectory } from 'src/lib/google/hooks/use-people-directory';
import { MediaQueryConstants } from 'src/util/const/material';

import { Text, withDatasourceCheck, useSitecore } from '@sitecore-content-sdk/nextjs';
import Avatar from '@mui/material/Avatar';
import Pagination from '@mui/material/Pagination';
import Skeleton from '@mui/material/Skeleton';
import useMediaQuery from '@mui/material/useMediaQuery';

import styles from './PeopleDirectory.module.scss';
import { PeopleDirectoryProps, PeopleDirectoryDictionary } from './PeopleDirectory.types';

const cx = classNames.bind(styles);

const PeopleDirectory = (props: PeopleDirectoryProps): JSX.Element => {
  const { fields } = props;
  const { page: sitecorePage } = useSitecore();
  const isPageEditing = sitecorePage.mode.isEditing;
  const { t } = useI18n();
  let companyCode = '';
  if (fields?.companyCode && fields.companyCode.length > 0) {
    companyCode = fields.companyCode.map((item) => item?.fields?.value?.value).join(',');
  }
  const placeholderText = fields?.placeholder?.value;
  const isMobile = useMediaQuery(MediaQueryConstants.Mobile);

  const {
    paginatedUsers,
    filteredCount,
    locations,
    departments,
    loading,
    error,
    inputValue,
    setSearchInput,
    searchQuery,
    selectedLocations,
    toggleLocation,
    clearLocations,
    selectedDepartments,
    toggleDepartment,
    clearDepartments,
    activePreset,
    clearPreset,
    clearFilters,
    page,
    setPage,
    totalPages,
  } = usePeopleDirectory({ companyCode, enabled: !!companyCode && !isPageEditing });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [locationFilterOpen, setLocationFilterOpen] = useState(false);
  const [departmentFilterOpen, setDepartmentFilterOpen] = useState(false);

  const locationDropdownRef = useRef<HTMLDivElement | null>(null);
  const departmentDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = mobileFiltersOpen ? 'hidden' : '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFiltersOpen, isMobile]);

  /**
   * Close the desktop Department / Location dropdowns when the user clicks
   * outside their wrapper. Mobile uses a full-screen drawer with its own close
   * affordance, so this only attaches on desktop.
   */
  useEffect(() => {
    if (isMobile) return;
    if (!locationFilterOpen && !departmentFilterOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (locationFilterOpen && !locationDropdownRef.current?.contains(target)) {
        setLocationFilterOpen(false);
      }
      if (departmentFilterOpen && !departmentDropdownRef.current?.contains(target)) {
        setDepartmentFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isMobile, locationFilterOpen, departmentFilterOpen]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Loading skeleton
  const renderSkeleton = () => (
    <div className={cx('people-directory__person-container', 'flex flex-wrap gap-4 pb-6')}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={cx(
            'people-directory__person',
            'flex bg-white gap-6 md:gap-2 flex-[1_1_22%] items-center'
          )}
        >
          <div className={cx('people-directory__image')}>
            <Skeleton variant="circular" width={154} height={154} />
          </div>
          <div className={cx('people-directory__person-content', 'flex flex-col gap-2')}>
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="90%" height={16} />
            <Skeleton variant="text" width="70%" height={16} />
            <Skeleton variant="text" width="75%" height={16} />
          </div>
        </div>
      ))}
    </div>
  );

  /**
   * Shared checkbox-list filter dropdown used for both Location and Department.
   * On desktop, visibility is driven by the per-filter `desktopOpen` flag; on
   * mobile, both filters live inside the single mobile drawer.
   */
  const renderCheckboxFilter = (config: {
    title: string;
    desktopOpen: boolean;
    options: string[];
    selected: string[];
    onToggle: (value: string) => void;
    onClear: () => void;
    onClose: () => void;
  }) => (
    <div
      className={cx(
        'people-directory__filter-pill-menu',
        'flex flex-col gap-4',
        isMobile ? (mobileFiltersOpen ? 'is-open' : '') : config.desktopOpen ? 'is-open' : ''
      )}
    >
      <span className={cx('people-directory__filter-menu-heading', 'block')}>{config.title}</span>
      <div className={cx('people-directory__checkbox-container', 'flex flex-col gap-4 mb-4')}>
        {config.options.map((option) => (
          <label key={option} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="cursor-pointer"
              checked={config.selected.includes(option)}
              onChange={() => config.onToggle(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <div
        className={cx(
          'people-directory__filter-menu-buttons',
          'flex gap-6 items-center justify-end'
        )}
      >
        <button
          className={cx('people-directory__clear', 'asc-btn', 'cursor-pointer')}
          onClick={config.onClear}
        >
          {t('PeopleDirectoryClearAll') || PeopleDirectoryDictionary.ClearAll}
        </button>
        <button
          className={cx(
            'people-directory__apply-filter',
            'asc-btn asc-btn--primary',
            'cursor-pointer'
          )}
          onClick={() => {
            config.onClose();
            setMobileFiltersOpen(false);
          }}
        >
          {t('PeopleDirectoryApplyFilter') || PeopleDirectoryDictionary.ApplyFilter}
        </button>
      </div>
    </div>
  );

  const locationLabel = t('PeopleDirectoryLocation') || PeopleDirectoryDictionary.Location;
  const departmentLabel = t('PeopleDirectoryDepartment') || PeopleDirectoryDictionary.Department;

  const renderLocationFilter = () =>
    renderCheckboxFilter({
      title: locationLabel,
      desktopOpen: locationFilterOpen,
      options: locations,
      selected: selectedLocations,
      onToggle: toggleLocation,
      onClear: clearLocations,
      onClose: () => setLocationFilterOpen(false),
    });

  const renderDepartmentFilter = () =>
    renderCheckboxFilter({
      title: departmentLabel,
      desktopOpen: departmentFilterOpen,
      options: departments,
      selected: selectedDepartments,
      onToggle: toggleDepartment,
      onClear: clearDepartments,
      onClose: () => setDepartmentFilterOpen(false),
    });

  return (
    <div className={cx('people-directory', 'component', props.stylesSXA)}>
      <div className={cx('people-directory__blue-bg', 'bg-brand-blue-500 absolute')}></div>
      <div className={cx('people-directory__container', 'container', 'flex flex-col gap-8')}>
        <div className={cx('people-directory__header', 'flex flex-col gap-4')}>
          <div
            className={cx(
              'people-directory__header-with-button',
              'flex justify-between items-center'
            )}
          >
            <Text field={fields.headline} tag="h2" />
            {isMobile && (
              <span
                className={cx(
                  'people-directory__filter-by-text',
                  'flex items-center gap-2 cursor-pointer'
                )}
                onClick={() => setMobileFiltersOpen((prev) => !prev)}
              >
                <MaterialIcon name="FilterList" />
                {t('PeopleDirectoryFilter') || PeopleDirectoryDictionary.Filter}
              </span>
            )}
          </div>

          {/* Search Bar */}
          <div className={cx('people-directory__search')}>
            <input
              type="search"
              placeholder={placeholderText}
              value={inputValue}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <MaterialIcon name="Search" />
          </div>

          {/* Common Filter CTAs + Location Filter */}
          <div
            className={cx(
              'people-directory__filters',
              'flex flex-col md:flex-row items-start gap-4 mb-0 md:mb-4 md:relative'
            )}
          >
            {!isMobile && (
              <span className={cx('people-directory__filter-by-text', 'mt-2')}>
                {t('PeopleDirectoryFilterBy') || PeopleDirectoryDictionary.FilterBy}
              </span>
            )}

            {/* Desktop Department + Location Filters */}
            <div className={cx('people-directory__filter-pill', 'flex gap-4')}>
              {!isMobile && (
                <>
                  <div className="relative" ref={departmentDropdownRef}>
                    <div
                      className={cx(
                        'people-directory__filter-pill-trigger',
                        'flex items-center gap-2 cursor-pointer',
                        departmentFilterOpen && 'is-open'
                      )}
                      onClick={() => setDepartmentFilterOpen((prev) => !prev)}
                    >
                      {departmentLabel}
                      <MaterialIcon name={departmentFilterOpen ? 'ExpandLess' : 'ExpandMore'} />
                    </div>
                    {renderDepartmentFilter()}
                  </div>
                  <div className="relative" ref={locationDropdownRef}>
                    <div
                      className={cx(
                        'people-directory__filter-pill-trigger',
                        'flex items-center gap-2 cursor-pointer',
                        locationFilterOpen && 'is-open'
                      )}
                      onClick={() => setLocationFilterOpen((prev) => !prev)}
                    >
                      {locationLabel}
                      <MaterialIcon name={locationFilterOpen ? 'ExpandLess' : 'ExpandMore'} />
                    </div>
                    {renderLocationFilter()}
                  </div>
                </>
              )}

              {/* Mobile Filters */}
              {isMobile && (
                <div
                  className={cx(
                    'people-directory__filter-pill',
                    mobileFiltersOpen ? 'is-open' : ''
                  )}
                >
                  <div
                    className={cx(
                      'people-directory__mobile-filter-menu-header',
                      'flex gap-4 justify-between'
                    )}
                  >
                    <div className="flex gap-2 items-center">
                      <MaterialIcon name="FilterList" />
                      <span>{t('PeopleDirectoryFilter') || PeopleDirectoryDictionary.Filter}</span>
                    </div>
                    <div
                      className={cx('people-directory__mobile-filter-menu-close')}
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      <MaterialIcon name="Close" />
                    </div>
                  </div>

                  {renderDepartmentFilter()}
                  {renderLocationFilter()}
                </div>
              )}
            </div>

            {/* Selected filter tags */}
            <div className={cx('people-directory__selected-filters', 'flex gap-4 flex-wrap')}>
              {selectedDepartments.map((department) => (
                <div
                  key={`dept-${department}`}
                  className={cx('people-directory__selected-filter-tag', 'flex gap-2 items-center')}
                >
                  {department}
                  <span onClick={() => toggleDepartment(department)}>
                    <MaterialIcon name="Close" />
                  </span>
                </div>
              ))}
              {selectedLocations.map((location) => (
                <div
                  key={`loc-${location}`}
                  className={cx('people-directory__selected-filter-tag', 'flex gap-2 items-center')}
                >
                  {location}
                  <span onClick={() => toggleLocation(location)}>
                    <MaterialIcon name="Close" />
                  </span>
                </div>
              ))}
              {activePreset && (
                <div
                  className={cx('people-directory__selected-filter-tag', 'flex gap-2 items-center')}
                >
                  {activePreset.value}
                  <span onClick={clearPreset}>
                    <MaterialIcon name="Close" />
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className={cx('people-directory__filter-results', 'flex flex-col gap-4')}>
            <div className={cx('people-directory__filter-results-content', 'flex gap-2 items-end')}>
              <span>{filteredCount}</span>
              <span>{t('PeopleDirectoryResults') || PeopleDirectoryDictionary.Results}</span>
              {searchQuery && (
                <>
                  <span>{t('PeopleDirectoryFor') || PeopleDirectoryDictionary.For}</span>
                  <span className={cx('people-directory__filter-results-term')}>
                    &ldquo;{searchQuery}&rdquo;
                  </span>
                  <span
                    onClick={clearFilters}
                    className={cx('people-directory__clear-text', 'cursor-pointer')}
                  >
                    {t('PeopleDirectoryClear') || PeopleDirectoryDictionary.Clear}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading && renderSkeleton()}

        {error && (
          <div className={cx('people-directory__error')}>
            <p>{t('PeopleDirectoryErrorMessage') || PeopleDirectoryDictionary.ErrorMessage}</p>
          </div>
        )}

        {!loading && !error && paginatedUsers.length === 0 && (
          <div className={cx('people-directory__empty')}>
            <h3>
              {t('PeopleDirectoryNoMatchesTitle') || PeopleDirectoryDictionary.NoMatchesTitle}
            </h3>
            <p>
              {t('PeopleDirectoryNoMatchesMessage') || PeopleDirectoryDictionary.NoMatchesMessage}
            </p>
          </div>
        )}

        {!loading && !error && paginatedUsers.length > 0 && (
          <>
            <div className={cx('people-directory__person-container', 'flex flex-wrap gap-4 pb-6')}>
              {paginatedUsers.map((person) => (
                <div
                  key={person.id}
                  className={cx(
                    'people-directory__person',
                    'flex bg-white gap-6 md:gap-2 flex-[1_1_22%] items-center'
                  )}
                >
                  <Avatar
                    className={cx('people-directory__image')}
                    src={`/api/google/admin/directory/users/photo/${encodeURIComponent(person.primaryEmail)}`}
                    alt={`${person.name.givenName || ''} ${person.name.familyName || ''}`}
                    sx={{ width: 96, height: 96 }}
                  >
                    {person.name.givenName?.[0] || ''}
                    {person.name.familyName?.[0] || ''}
                  </Avatar>
                  <div className={cx('people-directory__person-content', 'flex flex-col gap-2')}>
                    <div className={cx('test')}>
                      <h3>
                        {person.name.givenName} {person.name.familyName}
                      </h3>
                      <h4>{person.jobTitle}</h4>
                    </div>
                    <div
                      className={cx(
                        'people-directory__email',
                        'flex justify-start md:justify-center items-center gap-2'
                      )}
                    >
                      <MaterialIcon name="Email" />
                      <a
                        className={cx('people-directory__email-url')}
                        href={`mailto:${person.primaryEmail}`}
                      >
                        {person.primaryEmail}
                      </a>
                    </div>
                    {person.phone && (
                      <div
                        className={cx(
                          'people-directory__phone',
                          'flex justify-start md:justify-center gap-2'
                        )}
                      >
                        <MaterialIcon name="Call" />
                        <a href={`tel:${person.phone}`}>{person.phone}</a>
                      </div>
                    )}
                    {person.location && (
                      <div
                        className={cx(
                          'people-directory__location',
                          'flex justify-start md:justify-center gap-2'
                        )}
                      >
                        <MaterialIcon name="FmdGood" />
                        <span>{person.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={cx('people-directory__pagination', 'flex justify-center')}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  shape="rounded"
                  size="large"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default compose<PeopleDirectoryProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(PeopleDirectory);
