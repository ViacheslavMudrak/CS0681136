import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { useSwrWithAuth } from 'lib/swr/use-swr-hook';
import { useI18n } from 'next-localization';
import { JSX, useState } from 'react';

import { Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import Skeleton from '@mui/material/Skeleton';

import styles from './DailyReflection.module.scss';
import { DailyReflectionProps, DailyReflectionStatics, QueryData } from './DailyReflection.types';

const cx = classNames.bind(styles);

const DailyReflection = (props: DailyReflectionProps): JSX.Element => {
  const { fields, rendering } = props;
  const { t } = useI18n();
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing;
  const homePageId = page.layout.sitecore.context.homePageId;
  const contextSiteLanguage = page.layout.sitecore.context.language || 'en';
  const landingPageSettings = page?.layout?.sitecore?.context?.landingPageSettings;
  const reflectionLandingPageUrl =
    landingPageSettings && landingPageSettings.reflectionLandingPage
      ? landingPageSettings.reflectionLandingPage?.url
      : '/reflections';

  const viewAllLinkLabel = t('ViewAllLinkLabel') || DailyReflectionStatics.ViewAllLinklabel;
  const showViewAllLInk = rendering.params?.showViewAllLink == '1';

  /**
   * Fetch the visibility-filtered reflection from the authenticated API.
   * The server filters by session.googleGroups and returns only reflections
   * the current user is allowed to see — gated content never reaches the
   * browser.
   */
  const hasFetchableKey = !isEditing && Boolean(homePageId);

  // String key (not function) so useSwrWithAuth appends #userId= automatically,
  // giving each user an isolated SWR cache entry for their filtered reflection set.
  const swrKey = hasFetchableKey
    ? `/api/component-data-fetching/daily-reflection?homePageId=${homePageId}&language=${contextSiteLanguage}`
    : null;

  const { data, isLoading, sessionStatus } = useSwrWithAuth<QueryData>({
    key: swrKey,
    allowAnonymous: true,
  });

  const loading = hasFetchableKey && (isLoading || sessionStatus === 'loading' || !data);
  const latestReflection = data?.reflections?.results?.[0] ?? null;

  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (reflectionText: string) => {
    if (!reflectionText) return;

    navigator.clipboard.writeText(reflectionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={cx('daily-reflection', 'component container', props.stylesSXA)}
      id={rendering.params?.RenderingIdentifier}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex justify-between items-center">
        <div className={cx('daily-reflection__header', 'flex gap-2 items-center')}>
          {fields.headline && (
            <MaterialIcon name="WbTwilightOutlined" className={cx('daily-reflection__icon')} />
          )}
          <Text field={fields.headline} tag="span" />
        </div>
        {showViewAllLInk && (
          <div className={cx('daily-reflection__view-link', 'flex gap-2')}>
            <a href={reflectionLandingPageUrl}>
              <span className="sr-only">{viewAllLinkLabel}</span>
              <MaterialIcon name="East" />
            </a>
          </div>
        )}
      </div>
      {!isEditing && loading && (
        <div className={cx('daily-reflection__content', 'flex flex-col gap-4')}>
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="rectangular" width="100%" height={80} />
          <Skeleton variant="text" width="40%" height={20} />
        </div>
      )}
      {!loading && latestReflection && (
        <div className={cx('daily-reflection__content', 'flex flex-col gap-4')}>
          <a href={latestReflection?.url?.path}>{latestReflection?.title?.value}</a>
          <div
            className={cx('daily-reflection__copy-text-container')}
            onMouseEnter={() => setHovered(true)}
          >
            <span
              className={cx('daily-reflection__copy-label', { visible: hovered || copied })}
              onClick={() => handleCopy(latestReflection?.quote?.value)}
              onMouseLeave={() => setHovered(false)}
            >
              {copied ? 'Copied!' : 'Copy Text'}
            </span>
            <span className={cx('daily-reflection__quote-container')}>
              <span>
                <span
                  className={cx('daily-reflection__quote-text')}
                  dangerouslySetInnerHTML={{ __html: latestReflection?.quote?.value || '' }}
                />
              </span>
              <span className={cx('daily-reflection__quote-close')}></span>
            </span>
          </div>
          <Text
            className={cx('daily-reflection__author')}
            field={latestReflection?.author}
            tag="span"
          />
        </div>
      )}
    </div>
  );
};

export default compose<DailyReflectionProps>(withDatasourceCheck(), withStyles())(DailyReflection);
