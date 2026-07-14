import { JSX, useMemo } from 'react';
import { withDatasourceCheck, Item, Text, Link, useSitecore } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { withJumplink } from 'lib/enhancers/withJumplink';
import { useSwrWithAuth } from 'lib/swr/use-swr-hook';
import {
  RelatedReflectionsProps,
  QueryData,
  RelatedReflectionsStatics,
} from './RelatedReflections.types';
import styles from './RelatedReflections.module.scss';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { useMediaQuery } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { MediaQueryConstants } from 'src/util/const/material';
import { useI18n } from 'next-localization';
import { formatDate } from 'src/util/helpers/date-helper';
import { ReflectionDetailPage_GraphQL } from 'src/models/graphql/reflection-detail';
import { normalizeGuid } from 'src/util/helpers/guid-helper';

const cx = classNames.bind(styles);

const RelatedReflections = (props: RelatedReflectionsProps): JSX.Element => {
  const { rendering, fields } = props;
  const { page } = useSitecore();
  const { t } = useI18n();
  const isMobile = useMediaQuery(MediaQueryConstants.Mobile);

  const hasLink = Boolean(fields.link?.value?.href || fields.link?.value?.path);
  const currentPageId = normalizeGuid(page.layout?.sitecore?.route?.itemId);
  const isPageEditing = page.mode.isEditing;
  const homePageId = page.layout.sitecore.context.homePageId;
  const contextSiteLanguage = page.layout.sitecore.context.language || 'en';

  const tagIds = useMemo(
    () =>
      ((rendering.fields?.reflectionsTags as Item[]) || [])
        .map((tag) => tag.id)
        .filter((id): id is string => Boolean(id)),
    [rendering.fields?.reflectionsTags]
  );

  /**
   * Fetch the visibility-filtered related reflections from the authenticated
   * API. The server filters by session.googleGroups so gated reflections
   * never reach the browser.
   */
  const hasFetchableKey = !isPageEditing && Boolean(homePageId) && tagIds.length > 0;

  const swrKey = hasFetchableKey
    ? `/api/component-data-fetching/related-reflections?homePageId=${homePageId}&language=${contextSiteLanguage}&tagIds=${tagIds.join(',')}`
    : null;

  const { data, isLoading, sessionStatus } = useSwrWithAuth<QueryData>({
    key: swrKey,
    allowAnonymous: true,
  });

  const loading = hasFetchableKey && (isLoading || sessionStatus === 'loading' || !data);

  const results = useMemo(() => {
    const raw = data?.search?.results ?? [];
    const withoutSelf = raw.filter(
      (reflection: ReflectionDetailPage_GraphQL) => normalizeGuid(reflection.id) !== currentPageId
    );
    return withoutSelf.slice(0, 4);
  }, [data?.search?.results, currentPageId]);

  const authoringNote =
    t('RelatedReflectionsEditModeMessage') || RelatedReflectionsStatics.editingEmptyNote;

  if (isPageEditing) {
    return (
      <div className={cx('related-reflections', 'component container p-6', props.stylesSXA)}>
        <p className="text-sm italic text-gray-600">{authoringNote}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={cx(
          'related-reflections',
          'component container flex flex-col gap-6',
          props.stylesSXA
        )}
        id={rendering.params?.RenderingIdentifier}
      >
        <Skeleton variant="text" width={200} height={32} />
        <div className={cx('related-reflections__cards', 'grid gap-6')}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={cx('related-reflections__card', 'flex flex-col gap-4')}>
              <Skeleton variant="text" width="40%" height={16} />
              <Skeleton variant="text" width="80%" height={24} />
              <Skeleton variant="rectangular" width="100%" height={60} />
              <Skeleton variant="text" width="30%" height={16} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return <></>;
  }

  return (
    <div
      className={cx(
        'related-reflections',
        'component container flex flex-col gap-6',
        props.stylesSXA
      )}
      id={rendering.params?.RenderingIdentifier}
    >
      <div className={cx('related-reflections__header', 'flex justify-between items-center')}>
        <div className={cx('related-reflections__title', 'flex gap-2')}>
          <MaterialIcon name="WbTwilightOutlined" />
          <Text tag="h2" field={fields.title} editable />
        </div>
        {!isMobile && hasLink && (
          <Link editable field={fields.link} className={cx('related-reflections__see-all-link')}>
            <span>{fields.link?.value?.text}</span>
            <MaterialIcon name="East" />
          </Link>
        )}
      </div>
      <div className={cx('related-reflections__cards', 'grid gap-6')}>
        {results.map((item, index) => (
          <a
            key={`reflection-${index}`}
            className={cx('related-reflections__card', 'flex flex-col gap-4')}
            href={item.url.path}
          >
            <span className={cx('related-reflections__card-date')}>
              {formatDate(item?.publishDate?.value)}
            </span>
            <Text className={cx('related-reflections__card-title')} tag="span" field={item.title} />

            {item.quote?.value && (
              <Text
                className={cx('related-reflections__card-reflection', 'flex h-full')}
                tag="p"
                field={item.quote}
              />
            )}

            {item.author?.value && (
              <Text
                className={cx('related-reflections__card-author')}
                tag="span"
                field={item.author}
              />
            )}
          </a>
        ))}
      </div>
      {isMobile && hasLink && (
        <Link
          field={fields.link}
          className={cx(
            'related-reflections__see-all-link',
            'flex justify-end items-center',
            'mobile-link'
          )}
        >
          <span>{fields.link?.value?.text}</span>
          <MaterialIcon name="East" />
        </Link>
      )}
    </div>
  );
};

export default compose<RelatedReflectionsProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(RelatedReflections);
