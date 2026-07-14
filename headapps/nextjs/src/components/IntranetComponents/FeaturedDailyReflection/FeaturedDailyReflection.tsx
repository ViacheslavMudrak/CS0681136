import classNames from 'classnames/bind';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { withJumplink } from 'lib/enhancers/withJumplink';
import { useSwrWithAuth } from 'lib/swr/use-swr-hook';
import { JSX } from 'react';
import { formatDate } from 'src/util/helpers/date-helper';

import { Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import Skeleton from '@mui/material/Skeleton';

import styles from './FeaturedDailyReflection.module.scss';
import {
  FeaturedDailyReflectionProps,
  QueryData,
  FeaturedReflectionsDictionary,
} from './FeaturedDailyReflection.types';
import { useI18n } from 'next-localization';

const cx = classNames.bind(styles);

const FeaturedDailyReflection = (props: FeaturedDailyReflectionProps): JSX.Element => {
  const { fields, rendering } = props;
  const { t } = useI18n();
  const readFullArticle = t('ReadFullArticle') || FeaturedReflectionsDictionary.ReadFullArticle;

  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing;
  const homePageId = page.layout.sitecore.context.homePageId;
  const contextSiteLanguage = page.layout.sitecore.context.language || 'en';

  /**
   * Fetch the visibility-filtered reflection from the authenticated API.
   * The server filters by session.googleGroups and only returns reflections
   * the current user is allowed to see — gated content never reaches the
   * browser. Skip the call entirely in editing mode (authors author).
   */
  const hasFetchableKey = !isEditing && Boolean(homePageId);

  const swrKey = hasFetchableKey
    ? `/api/component-data-fetching/featured-daily-reflection?homePageId=${homePageId}&language=${contextSiteLanguage}`
    : null;

  const { data, isLoading, sessionStatus } = useSwrWithAuth<QueryData>({
    key: swrKey,
    allowAnonymous: true,
  });

  const loading = hasFetchableKey && (isLoading || sessionStatus === 'loading' || !data);
  const latestReflection = data?.reflections?.results?.[0] ?? null;

  const formattedDate =
    formatDate(latestReflection?.publishDate?.jsonValue?.value)?.toUpperCase() ?? '';

  const cleanBodyText = latestReflection?.body?.jsonValue?.value
    ? latestReflection.body.jsonValue.value
        .replace(/^[""“”]+/, '')
        .replace(/[""”]+$/, '')
        .trim()
    : '';

  return (
    <div
      className={cx('featured-daily-reflection', 'component container grid gap-6', props.stylesSXA)}
      id={rendering.params?.RenderingIdentifier}
    >
      <div
        className={cx(
          'featured-daily-reflection__left-column',
          'flex flex-col gap-4 justify-center'
        )}
      >
        <Text tag="h2" field={fields.headline} editable={true} />
        <Text tag="p" field={fields.subheadline} editable={true} />
      </div>
      {!isEditing && loading && (
        <div className={cx('featured-daily-reflection__right-column', 'flex flex-col gap-8')}>
          <Skeleton variant="text" width="40%" height={20} className="self-end" />
          <Skeleton variant="text" width="100%" height={32} />
          <Skeleton variant="rectangular" width="100%" height={120} />
          <Skeleton variant="text" width="50%" height={20} />
          <Skeleton variant="rectangular" width={180} height={40} />
        </div>
      )}
      {!loading && latestReflection && (
        <div className={cx('featured-daily-reflection__right-column', 'flex flex-col gap-8')}>
          <span className={cx('featured-daily-reflection__card-date', 'block text-right')}>
            {formattedDate}
          </span>
          <h3>
            <a href={latestReflection.url.path}>{latestReflection.title?.jsonValue?.value}</a>
          </h3>
          <div className={cx('featured-daily-reflection__quote-text', 'flex')}>
            <q>
              <span>{cleanBodyText}</span>
            </q>
          </div>
          <span className={cx('featured-daily-reflection__card-author')}>
            {latestReflection.author?.jsonValue?.value?.toUpperCase()}
          </span>
          <a
            href={latestReflection.url.path}
            className={cx('featured-daily-reflection__cta', 'asc-btn asc-btn--outline text-center')}
          >
            {`${readFullArticle}`}
          </a>
        </div>
      )}
    </div>
  );
};

export default compose<FeaturedDailyReflectionProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(FeaturedDailyReflection);
