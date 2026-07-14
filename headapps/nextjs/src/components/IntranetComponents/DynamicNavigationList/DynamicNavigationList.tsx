import {
  DynamicNavigationListProps,
  DynamicNavigationListStatics,
  Response_GQL,
  SubItemLink,
} from './DynamicNavigationList.types';
import {
  ComponentRendering,
  GetComponentServerProps,
  LayoutServiceData,
  Text,
  useSitecore,
  withDatasourceCheck,
} from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import { CustomLink } from 'components/common/CustomLink';
import compose from 'lib/enhancers/compose';
import { withJumplink } from 'lib/enhancers/withJumplink';
import withStyles from 'lib/enhancers/withStyles';
import { useI18n } from 'next-localization';
import { JSX } from 'react';
import React, { useState, useMemo, useCallback } from 'react';
import scConfig from 'sitecore.config';
import { CustomLinkItem, IconItem } from 'ts/custom-link';

import { createGraphQLClientFactory } from '@sitecore-content-sdk/nextjs/client';

import { DynamicNavigationList_GQL } from './DynamicNavigationList.graphql';
import styles from './DynamicNavigationList.module.scss';

const cx = classNames.bind(styles);

const DynamicNavigationList = (props: DynamicNavigationListProps): JSX.Element => {
  const { fields, rendering, stylesSXA } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const { t } = useI18n();
  const noSearchResultsMessage =
    t('NoSearchResultMessage') || DynamicNavigationListStatics.noSearchResultsMessage;
  const showAllLabel = t('ShowAllLabel') || DynamicNavigationListStatics.showAllLabel;
  const clearLink = t('ClearLink') || DynamicNavigationListStatics.clearLink;
  const searchBoxPlaceholderText =
    t('SearchBoxPlaceholderText') || DynamicNavigationListStatics.searchBoxPlaceholderText;
  const [searchQuery, setSearchQuery] = useState('');

  // Memoize subItemLinks to stabilize the reference
  const subItemLinks = useMemo(() => {
    let result: CustomLinkItem[] = [];
    if (props?.subItemLinks && props?.subItemLinks?.length > 0) {
      let filteredSubItemLinks = [];
      const currentItemPath = page?.layout?.sitecore?.context?.itemPath || '';
      const pageLevel = fields?.pageLevel?.value?.toLocaleLowerCase();

      if (pageLevel === 'all descendants') {
        filteredSubItemLinks = props?.subItemLinks;
      } else if (pageLevel === 'children and grandchildren') {
        const basePath = currentItemPath.replace(/\/$/, '');
        const baseSegments = basePath.split('/').filter(Boolean);

        filteredSubItemLinks = props?.subItemLinks.filter((link: SubItemLink) => {
          const linkPath = link.url.path.replace(/\/$/, '');
          const linkSegments = linkPath.split('/').filter(Boolean);

          const depthDifference = linkSegments.length - baseSegments.length;

          return linkPath.startsWith(basePath) && depthDifference > 0 && depthDifference <= 2;
        });
      } else {
        const basePath = currentItemPath.replace(/\/$/, '');
        const baseSegments = basePath.split('/').filter(Boolean);

        filteredSubItemLinks = props?.subItemLinks.filter((link: SubItemLink) => {
          const linkPath = link.url.path.replace(/\/$/, '');
          const linkSegments = linkPath.split('/').filter(Boolean);

          const depthDifference = linkSegments.length - baseSegments.length;

          return linkPath.startsWith(basePath) && depthDifference === 1;
        });
      }

      result = filteredSubItemLinks?.map((link: SubItemLink) => {
        const customLink: CustomLinkItem = {
          fields: {
            generalLink: {
              value: {
                href: link?.url?.path,
                text: link?.navigationTitle?.value
                  ? link?.navigationTitle?.value
                  : link?.title?.value
                    ? link?.title?.value
                    : link?.name,
                linktype: 'internal',
              },
            },
            directoryEntry: [],
            linkIcon: {} as IconItem,
          },
        };
        return customLink;
      });
    }
    return result;
  }, [props?.subItemLinks, page?.layout?.sitecore?.context?.itemPath, fields?.pageLevel?.value]);

  // Helper to get link text
  const getLinkText = useCallback((link: CustomLinkItem): string => {
    // Try directory entry first
    const dirEntry = Array.isArray(link.fields?.directoryEntry)
      ? link.fields.directoryEntry[0]
      : link.fields?.directoryEntry;
    if (dirEntry?.fields?.entryLink?.value?.text) {
      return dirEntry.fields.entryLink.value.text;
    }
    // Fall back to general link
    return link.fields?.generalLink?.value?.text || '';
  }, []);

  // Memoize the combined link list
  const allLinks = useMemo(() => {
    const validExtraLinks = fields?.extraLinks.filter((link) => getLinkText(link) !== '');
    return subItemLinks && subItemLinks.length > 0
      ? [...validExtraLinks, ...subItemLinks]
      : validExtraLinks;
  }, [fields?.extraLinks, subItemLinks, getLinkText]);

  // Pre-compute link texts to avoid repeated calls during filter/sort
  const linkTexts = useMemo(() => {
    const textMap = new Map<CustomLinkItem, string>();
    allLinks?.forEach((link) => {
      const linkText = getLinkText(link);
      if (linkText && linkText !== '') {
        textMap.set(link, getLinkText(link));
      }
    });
    return textMap;
  }, [allLinks, getLinkText]);

  // Combined memoization: filter, sort, and columnize in one pass
  const columnizedLinks = useMemo(() => {
    // Step 1: Filter by search query
    let filtered = allLinks;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = allLinks?.filter((link) => {
        const linkText = linkTexts.get(link) || '';
        return linkText.toLowerCase().includes(query);
      });
    }

    // Step 2: Sort alphabetically
    const sorted = [...filtered].sort((a, b) => {
      const textA = (linkTexts.get(a) || '').toLowerCase();
      const textB = (linkTexts.get(b) || '').toLowerCase();
      return textA.localeCompare(textB);
    });

    // Step 3: Columnize into 3 columns
    if (!sorted.length) return [[], [], []];

    const totalLinks = sorted.length;
    const linksPerColumn = Math.floor(totalLinks / 3);
    const extraLinksCount = totalLinks % 3;
    const column1Index = extraLinksCount > 0 ? linksPerColumn + 1 : linksPerColumn;
    const column2Index =
      extraLinksCount > 1 ? column1Index + linksPerColumn + 1 : column1Index + linksPerColumn;

    const column1: CustomLinkItem[] = [];
    const column2: CustomLinkItem[] = [];
    const column3: CustomLinkItem[] = [];

    sorted.forEach((link, index) => {
      if (index < column1Index) {
        column1.push(link);
      } else if (index < column2Index) {
        column2.push(link);
      } else {
        column3.push(link);
      }
    });

    return [column1, column2, column3];
  }, [allLinks, searchQuery, linkTexts]);

  // Memoize total displayed links count
  const totalDisplayedLinks = useMemo(
    () => columnizedLinks.reduce((sum, column) => sum + column.length, 0),
    [columnizedLinks]
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const hasLinks = subItemLinks?.length > 0 || fields?.extraLinks?.length > 0;

  if (!hasLinks && !isPageEditing) {
    return <></>;
  }

  return (
    <div
      className={cx('dynamic-navigation-list', 'component', stylesSXA)}
      id={rendering.params?.RenderingIdentifier}
    >
      <div className={cx('container')}>
        {/* Title and Search Bar Row */}
        <div className={cx('header-row')}>
          <div className={cx('header')}>
            <Text tag="h2" field={fields?.sectionTitle} className={cx('title')} />
          </div>

          <div className={cx('search-container')}>
            <form onSubmit={handleSearch} className={cx('search-form')}>
              <input
                type="text"
                placeholder={searchBoxPlaceholderText}
                value={searchQuery}
                onChange={handleSearchChange}
                className={cx('search-input')}
                aria-label={searchBoxPlaceholderText}
              />
              <button type="submit" className={cx('search-button')} aria-label="Search">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Results Count */}
        <div className={cx('results-info')}>
          {searchQuery ? (
            <p>
              {totalDisplayedLinks} result{totalDisplayedLinks !== 1 ? 's' : ''} for{' '}
              <b>&quot;{searchQuery}&quot;</b>{' '}
              <button onClick={handleClearSearch} className={cx('clear-link')}>
                {clearLink}
              </button>
            </p>
          ) : (
            <p>{`${showAllLabel} ${totalDisplayedLinks}`}</p>
          )}
        </div>

        {/* Links Grid */}
        {totalDisplayedLinks > 0 ? (
          <div className={cx('links-grid')}>
            {columnizedLinks.map((column, colIndex) => (
              <div key={colIndex} className={cx('links-column')}>
                {column.map((link, linkIndex) => (
                  <div key={linkIndex} className={cx('link-item')}>
                    <CustomLink
                      item={link}
                      className={cx('link-wrapper')}
                      linkClassName={cx('link')}
                      isPageEditing={isPageEditing}
                      showIcon={false}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className={cx('no-results')}>
            <p> {noSearchResultsMessage.replace('$searchKey', searchQuery)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const getComponentServerProps: GetComponentServerProps = async (
  rendering: ComponentRendering,
  layoutData: LayoutServiceData
) => {
  const graphQLClientFactory = createGraphQLClientFactory({ api: scConfig.api });
  const graphQLClient = graphQLClientFactory();

  const contextSiteLanguage = layoutData.sitecore.context.language || 'en';
  let query = DynamicNavigationList_GQL;
  const currentItemId = layoutData.sitecore.route?.itemId || '';
  if (rendering) {
    query = query.replaceAll('__ANCESTOR_ID__', currentItemId);
    query = query.replaceAll('__LANGUAGE__', contextSiteLanguage);
  }
  let allSubItemLinks: SubItemLink[] = [];
  let cursor: string | null = null;
  do {
    const response: Response_GQL = await graphQLClient.request<Response_GQL>(query, {
      after: cursor,
    });

    allSubItemLinks = [...allSubItemLinks, ...response.subItemLinks.results];
    cursor = response.subItemLinks.pageInfo.hasNext
      ? response.subItemLinks.pageInfo.endCursor
      : null;
  } while (cursor);
  allSubItemLinks = allSubItemLinks.filter(
    (link: SubItemLink) => link?.url?.path !== layoutData?.sitecore?.context?.itemPath
  );
  return { subItemLinks: allSubItemLinks };
};

export default compose<DynamicNavigationListProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(DynamicNavigationList);
