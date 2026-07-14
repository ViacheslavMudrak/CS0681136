import type { ActionProp, ItemClickedAction } from '@sitecore-search/core';
import Skeleton from '@mui/material/Skeleton';
import classNames from 'classnames/bind';

import styles from './styles.module.scss';
import { formatDate } from 'src/util/helpers/date-helper';
import { ContentEntityModel } from 'components/search/models/content-entity';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { MediaQueryConstants } from 'src/util/const/material';
import { useMediaQuery } from '@mui/material';
import { useI18n } from 'next-localization';
import { getFirstSiteAreaTag } from '../helpers/result-card-helpers';

const cx = classNames.bind(styles);

type GlobalResultCardProps = {
  article: ContentEntityModel | null;
  onItemClick: ActionProp<ItemClickedAction>;
  index: number;
  isLoading: boolean;
};

const GlobalResultCard = ({ article, onItemClick, index, isLoading }: GlobalResultCardProps) => {
  const isMobile = useMediaQuery(MediaQueryConstants.Mobile, { noSsr: true });
  const { t } = useI18n();
  const publishedLabel = t('GlobalResultCardPublishedLabel') || 'Published: ';
  const modifiedLabel = t('GlobalResultCardModifiedLabel') || 'Modified: ';

  if (isLoading || !article) {
    return (
      <div className={cx('news-article-row-card', 'news-article-row-card--loading')}>
        <div className={cx('news-article-row-card__content')}>
          <Skeleton variant="text" width="30%" height={16} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="60%" height={16} />
        </div>
        <Skeleton variant="rectangular" width={120} height={80} sx={{ borderRadius: '4px' }} />
      </div>
    );
  }

  const resultType = article.result_type;
  const dateToShow = article.published_date || article.updated_date;
  const datePrefix = article.published_date ? publishedLabel : modifiedLabel;
  // formatDate already handles the default empty date, so formattedDate will be null if it's the default
  const formattedDate = dateToShow ? formatDate(dateToShow) : null;
  const displayTitle = article.title || article.name || '';
  const thumbnailUrl = article.thumbnail;

  const resultTypeClassMap: Record<string, string> = {
    'News Article': 'news',
    'Directory Entry': 'directory',
    'Site Page': 'site',
    Reflection: 'reflection',
  };

  const resultTypeIconMap: Record<string, string> = {
    'News Article': 'NewspaperOutlined',
    'Directory Entry': 'FolderOutlined',
    'Site Page': 'DescriptionOutlined',
    Reflection: 'AutoStoriesOutlined',
  };

  const resultTypeKey = resultType ?? '';
  const resultTypeModifier = resultTypeClassMap[resultTypeKey] ?? '';
  const resultTypeIcon = resultTypeIconMap[resultTypeKey] ?? 'ArticleOutlined';

  return (
    <a
      href={article.url || '#'}
      target="_blank"
      onClick={() => {
        onItemClick({
          id: article.id,
          index,
          sourceId: article.source_id,
        });
      }}
      className={cx('news-article-row-card')}
    >
      <div className={cx('news-article-row-card__content', 'flex gap-4 flex-col')}>
        <div className={cx('news-article-row-card__meta', 'flex items-center')}>
          <span
            className={cx(
              'news-article-row-card__result-type',
              'flex gap-2 items-center',
              resultTypeModifier && `news-article-row-card__result-type--${resultTypeModifier}`
            )}
          >
            <MaterialIcon name={resultTypeIcon} />
            <span>{resultType}</span>
          </span>
          {getFirstSiteAreaTag(article) && (
            <>
              <span className={cx('news-article-row-card__separator')}>|</span>
              <span className={styles['news-article-row-card__date']}>
                {getFirstSiteAreaTag(article)}
              </span>
            </>
          )}
          {formattedDate && (
            <>
              <span className={cx('news-article-row-card__separator')}>|</span>
              <span className={cx('news-article-row-card__date')}>
                {datePrefix}
                {formattedDate}
              </span>
            </>
          )}
        </div>
        <div className="flex gap-6 justify-between">
          <div className="flex flex-col gap-2 pr-0 md:pr-4">
            <h3 className={cx('news-article-row-card__title')}>{displayTitle}</h3>
            {article.excerpt && (
              <p className={cx('news-article-row-card__excerpt')}>{article.excerpt}</p>
            )}
          </div>
          {isMobile && thumbnailUrl && (
            <div className={cx('news-article-row-card__thumbnail-wrapper')}>
              <img
                src={thumbnailUrl}
                alt={displayTitle}
                className={cx('news-article-row-card__thumbnail')}
              />
            </div>
          )}
        </div>
      </div>
      {!thumbnailUrl && (
        <div className={cx('news-article-row-card__no-image-arrow')}>
          <MaterialIcon name="East" />
        </div>
      )}
      {!isMobile && thumbnailUrl && (
        <div className={cx('news-article-row-card__thumbnail-wrapper')}>
          <img
            src={thumbnailUrl}
            alt={displayTitle}
            className={cx('news-article-row-card__thumbnail')}
          />
        </div>
      )}
    </a>
  );
};

export default GlobalResultCard;
