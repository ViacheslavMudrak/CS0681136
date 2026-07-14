import { RelatedNewsListingProps, QueryData } from './RelatedNewsListing.types';
import {
  withDatasourceCheck,
  Item,
  Text,
  Image,
  Link,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import Skeleton from '@mui/material/Skeleton';
import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { withJumplink } from 'lib/enhancers/withJumplink';
import { useSwrWithAuth } from 'lib/swr/use-swr-hook';
import { useMemo } from 'react';
import { formatDate } from 'src/util/helpers/date-helper';

import styles from './RelatedNewsListing.module.scss';
import { PageFields } from 'components/IntranetComponents/NewsArticleBookend/NewsArticleBookend.types';

const cx = classNames.bind(styles);

const RelatedNewsListing = (props: RelatedNewsListingProps) => {
  const { page } = useSitecore();
  const { rendering } = props;
  const isPageEditing = page.mode.isEditing;
  const homePageId = page.layout.sitecore.context.homePageId;
  const contextSiteLanguage = page.layout.sitecore.context.language || 'en';

  const usePageTags = rendering.params?.populateWithPageTags === '1';

  /**
   * Resolve the tag IDs the API needs to query. Combine rendering tags
   * (always) with page tags (when populateWithPageTags is set) to mirror the
   * legacy getComponentServerProps logic.
   */
  const tagIds = useMemo(() => {
    const renderingTags = (rendering.fields?.tags as Item[]) || [];
    const pageTags = usePageTags
      ? (() => {
          const pageFields = page.layout.sitecore.route?.fields as PageFields | undefined;
          const areaTags = (pageFields?.areaTags as Item[]) || [];
          const topicTags = (pageFields?.topicTags as Item[]) || [];
          const contentTags = (pageFields?.contentTags as Item[]) || [];
          return [...areaTags, ...topicTags, ...contentTags];
        })()
      : [];
    return [...renderingTags, ...pageTags].map((tag) => tag.id).filter(Boolean);
  }, [rendering.fields?.tags, usePageTags, page.layout.sitecore.route?.fields]);

  /**
   * Fetch the visibility-filtered related news from the authenticated API.
   * The server filters by session.googleGroups so gated articles never reach
   * the browser.
   */
  const hasFetchableKey = Boolean(homePageId) && tagIds.length > 0;

  const swrKey = hasFetchableKey
    ? `/api/component-data-fetching/related-news-listing?homePageId=${homePageId}&language=${contextSiteLanguage}&tagIds=${tagIds.join(',')}`
    : null;

  const { data, isLoading, sessionStatus } = useSwrWithAuth<QueryData>({
    key: swrKey,
    allowAnonymous: true,
  });

  const loading = hasFetchableKey && (isLoading || sessionStatus === 'loading' || !data);

  const hasSeeAllLink = Boolean(props.fields?.seeAllNewsLink?.value?.href);

  const buildTopicsUrl = () => {
    const baseUrl = props.fields?.seeAllNewsLink?.value?.href;

    const renderingTags = (props.rendering.fields?.tags as Item[]) || [];

    const pageTags = usePageTags
      ? (() => {
          const pageFields = page.layout.sitecore.route?.fields as PageFields | undefined;
          const areaTags = pageFields?.areaTags || [];
          const topicTags = pageFields?.topicTags || [];
          const contentTags = pageFields?.contentTags || [];
          return [...areaTags, ...topicTags, ...contentTags];
        })()
      : [];

    const tags = [...renderingTags, ...pageTags];

    if (!baseUrl || !tags || !Array.isArray(tags)) {
      return baseUrl;
    }

    const tagValues = tags.map((tag: Item) => tag.fields?.value || tag.name).filter(Boolean);

    if (tagValues.length === 0) {
      return baseUrl;
    }

    const topicsParam = `topics=${tagValues.join(',')}`;
    return `${baseUrl}?${topicsParam}`;
  };

  const visibleSearchResults = data?.search?.results ?? [];
  const results = visibleSearchResults.slice(0, 4);
  const showThumbnails = results.every((newsItem) => newsItem.thumbnail?.jsonValue?.value?.src);

  const itemsWithImages = visibleSearchResults.filter(
    (newsItem) => newsItem.thumbnail?.jsonValue?.value?.src
  );

  const imageCount = itemsWithImages.length;
  const imageClass = imageCount === 0 ? 'gap-4' : 'gap-14';
  const computedLink = !hasSeeAllLink || isPageEditing ? undefined : buildTopicsUrl();

  if (loading && !isPageEditing) {
    return (
      <section
        className={cx('related-news-listing', 'component p-6 container', props.stylesSXA)}
        id={rendering.params?.RenderingIdentifier}
      >
        <div className="mb-6 flex items-center justify-between">
          <Skeleton variant="text" width={240} height={32} />
        </div>
        <div
          className={cx('related-news-listing__card-container', 'flex flex-col md:flex-row gap-4')}
        >
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className={cx('related-news-listing__card', 'flex flex-col gap-4 flex-[1_1_25%]')}
            >
              <Skeleton variant="rectangular" width="100%" height={190} />
              <Skeleton variant="text" width="100%" height={24} />
              <Skeleton variant="text" width="40%" height={16} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (results.length === 0 && !isPageEditing) {
    return null;
  }

  return (
    <section className={cx('related-news-listing', 'component p-6 container', props.stylesSXA)}>
      <div className="mb-6 flex items-center justify-between">
        <div className={cx('related-news-listing__header', 'flex items-center gap-2')}>
          <MaterialIcon name="Campaign" />
          <Text className={cx('uppercase')} field={props.fields.listingTitle} tag="h2" editable />
        </div>
        {(hasSeeAllLink || isPageEditing) && (
          <div className={cx('related-news-listing__header-link', 'hidden md:flex items-center')}>
            <Link
              field={props.fields?.seeAllNewsLink}
              className="uppercase underline hover:no-underline flex items-center gap-1"
              href={computedLink}
            >
              {props.fields?.seeAllNewsLink?.value?.text}
              <MaterialIcon name="East" />
            </Link>
          </div>
        )}
      </div>
      <div
        className={cx(
          'related-news-listing__card-container',
          imageClass,
          'flex flex-col md:flex-row md:gap-4'
        )}
      >
        {results.map((newsItem, index) => {
          const totalItems = results?.length ?? 0;
          const fixedHeightClass =
            totalItems === 1
              ? 'h-[400px]'
              : totalItems === 2
                ? 'h-[400px]'
                : totalItems === 3
                  ? 'h-[260px]'
                  : 'h-[190px]';
          const dynamicWidth = totalItems === 1 ? 'flex-[1_0_50%] max-w[50%]' : 'flex-[1_1_25%]';

          return (
            <div
              key={index}
              className={cx('related-news-listing__card', 'flex flex-col', dynamicWidth)}
            >
              <a
                className={cx(
                  'related-news-listing__card-image',
                  showThumbnails ? fixedHeightClass : '',
                  'w-full overflow-hidden rounded-xl'
                )}
                href={newsItem.url.path}
              >
                {showThumbnails && (
                  <Image
                    field={newsItem.thumbnail.jsonValue}
                    className={'object-cover h-full w-full object-top'}
                  />
                )}
              </a>
              <div>
                <a className="block w-full hover:underline" href={newsItem.url.path}>
                  {newsItem.title.value}
                </a>
              </div>
              <span
                className={cx(
                  'related-news-listing__card__publish-date',
                  'text-eyebrow',
                  'tracking-[0.25px]'
                )}
              >
                {formatDate(newsItem.publishDate.value)}
              </span>
            </div>
          );
        })}
        {(hasSeeAllLink || isPageEditing) && (
          <div className={cx('related-news-listing__header-link', 'flex md:hidden items-center')}>
            <Link
              field={props.fields?.seeAllNewsLink}
              className="uppercase underline hover:no-underline flex items-center gap-1"
              href={computedLink}
            >
              {props.fields?.seeAllNewsLink?.value?.text}
              <MaterialIcon name="East" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export const Default = compose<RelatedNewsListingProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(RelatedNewsListing);

export default Default;
