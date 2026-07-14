import { withDatasourceCheck, Item, Text, Image, useSitecore } from '@sitecore-content-sdk/nextjs';
import Skeleton from '@mui/material/Skeleton';
import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import compose from 'lib/enhancers/compose';
import { withJumplink } from 'lib/enhancers/withJumplink';
import withStyles from 'lib/enhancers/withStyles';
import { useSwrWithAuth } from 'lib/swr/use-swr-hook';
import { JSX, useMemo } from 'react';
import { formatDate } from 'src/util/helpers/date-helper';

import styles from './MarketNews.module.scss';
import { MarketNewsProps, QueryData } from './MarketNews.types';

const cx = classNames.bind(styles);

const MarketNews = (props: MarketNewsProps): JSX.Element => {
  const { fields } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing;
  // Hide component if required fields are missing to prevent ghost elements (but not in edit mode)
  const hasRequiredFields =
    fields.title?.value &&
    fields.seeAllNewsLink?.value &&
    fields.featuredNewsTag?.length > 0 &&
    fields.nonFeaturedNewsTags?.length > 0 &&
    fields.mobileCTA?.value;

  const defaultThumbnailImage = page.layout.sitecore.context.defaultImages?.marketNewsThumbnail;
  const newsLandingPageUrl = page.layout.sitecore.context.landingPageSettings?.newsLandingPage?.url;
  const homePageId = page.layout.sitecore.context.homePageId;
  const contextSiteLanguage = page.layout.sitecore.context.language || 'en';

  const featuredTagIds = useMemo(
    () =>
      ((fields.featuredNewsTag as Item[]) || [])
        .map((tag) => tag.id)
        .filter((id): id is string => Boolean(id)),
    [fields.featuredNewsTag]
  );
  const nonFeaturedTagIds = useMemo(
    () =>
      ((fields.nonFeaturedNewsTags as Item[]) || [])
        .map((tag) => tag.id)
        .filter((id): id is string => Boolean(id)),
    [fields.nonFeaturedNewsTags]
  );

  /**
   * Fetch visibility-filtered market news from the authenticated API. The
   * server filters by session.googleGroups so gated articles never reach the
   * browser.
   */
  const hasFetchableKey =
    !isEditing &&
    Boolean(homePageId) &&
    (featuredTagIds.length > 0 || nonFeaturedTagIds.length > 0);

  const swrKey = hasFetchableKey
    ? `/api/component-data-fetching/market-news?homePageId=${homePageId}&language=${contextSiteLanguage}&featuredTagIds=${featuredTagIds.join(',')}&nonFeaturedTagIds=${nonFeaturedTagIds.join(',')}`
    : null;

  const { data, isLoading, sessionStatus } = useSwrWithAuth<QueryData>({
    key: swrKey,
    allowAnonymous: true,
  });

  const loading = hasFetchableKey && (isLoading || sessionStatus === 'loading' || !data);

  if (!hasRequiredFields && !isEditing) {
    return <></>;
  }

  const featuredNewsArticles = (data?.featured?.results ?? []).slice(0, 1);
  const nonFeaturedNewsArticles = (data?.nonFeatured?.results ?? []).slice(0, 4);

  const hideNonFeaturedArticleThumbnail =
    props.rendering.params?.hideThumbnailsForNonFeaturedArticles == '1';
  const allArticlesHaveThumbnails = nonFeaturedNewsArticles.every(
    (article) =>
      article.thumbnail?.jsonValue?.value?.src &&
      article.thumbnail.jsonValue.value.src.trim() !== ''
  );
  const showNonfeaturedThumbnail = allArticlesHaveThumbnails && !hideNonFeaturedArticleThumbnail;

  return (
    <div className={cx('market-news', 'component', props.stylesSXA)}>
      <div className={cx('container')}>
        <div className={cx('market-news__header')}>
          <Text tag="h2" field={fields?.title} className={cx('market-news__title')} />
          {fields?.seeAllNewsLink?.value && (
            <a
              href={newsLandingPageUrl}
              className={cx('market-news__see-all-link', 'desktop-only')}
            >
              {fields?.seeAllNewsLink?.value}
              <MaterialIcon name="East" />
            </a>
          )}
        </div>

        {loading && !isEditing && (
          <div className={cx('market-news__content')}>
            <div className={cx('market-news__featured')}>
              <Skeleton variant="rectangular" width="100%" height={280} />
              <div className={cx('market-news__featured-info')}>
                <Skeleton variant="text" width="30%" height={16} />
                <Skeleton variant="text" width="80%" height={32} />
              </div>
            </div>
            <div className={cx('market-news__articles')}>
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className={cx('market-news__article-card')}>
                  <Skeleton variant="rectangular" width="100%" height={120} />
                  <Skeleton variant="text" width="90%" height={24} />
                  <Skeleton variant="text" width="40%" height={16} />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && (
          <div className={cx('market-news__content')}>
            {featuredNewsArticles.length > 0 && (
              <a href={featuredNewsArticles[0].url?.path} className={cx('market-news__featured')}>
                <div className={cx('market-news__featured-image-wrapper')}>
                  <div className={cx('market-news__featured-image')}>
                    <Image
                      field={
                        featuredNewsArticles[0].thumbnail.jsonValue?.value?.src
                          ? featuredNewsArticles[0].thumbnail.jsonValue
                          : defaultThumbnailImage
                      }
                    />
                  </div>
                  <div className={cx('market-news__featured-icon')}>
                    <MaterialIcon name="NorthEast" />
                  </div>
                </div>
                <div className={cx('market-news__featured-info')}>
                  <p className={cx('market-news__featured-date')}>
                    {formatDate(featuredNewsArticles[0].publishDate.value)}
                  </p>
                  <Text
                    tag="h3"
                    field={featuredNewsArticles[0].title}
                    className={cx('market-news__featured-headline')}
                  />
                </div>
              </a>
            )}

            <div className={cx('market-news__articles')}>
              {nonFeaturedNewsArticles.length > 0 &&
                nonFeaturedNewsArticles.map((article, index) => (
                  <a
                    key={index}
                    href={article?.url?.path}
                    className={cx('market-news__article-card', {
                      'market-news__article-card--no-thumbnail': !allArticlesHaveThumbnails,
                    })}
                  >
                    {showNonfeaturedThumbnail && article.thumbnail.jsonValue && (
                      <div className={cx('market-news__article-thumbnail')}>
                        <Image field={article.thumbnail.jsonValue} />
                      </div>
                    )}
                    <div className={cx('market-news__article-info')}>
                      <Text
                        tag="h4"
                        field={article.title}
                        className={cx('market-news__article-headline')}
                      />
                      <p className={cx('market-news__article-date')}>
                        {formatDate(article.publishDate.value)}
                      </p>
                    </div>
                  </a>
                ))}
            </div>
          </div>
        )}

        {fields?.mobileCTA?.value && (
          <a href={newsLandingPageUrl} className={cx('market-news__see-all-link', 'mobile-only')}>
            {fields?.mobileCTA?.value}
            <MaterialIcon name="East" />
          </a>
        )}
      </div>
    </div>
  );
};

export default compose<MarketNewsProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(MarketNews);
