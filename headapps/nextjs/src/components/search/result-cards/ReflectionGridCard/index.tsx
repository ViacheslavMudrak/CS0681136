// This component displays reflection items in a grid card format for search results

import { ContentEntityModel } from 'components/search/models/content-entity';
import { formatDate } from 'src/util/helpers/date-helper';

import { ArticleCard } from '@sitecore-search/ui';
import Skeleton from '@mui/material/Skeleton';
import type { ActionProp, ItemClickedAction } from '@sitecore-search/core';

import styles from './styles.module.scss';

type ReflectionGridCardProps = {
  reflection: ContentEntityModel | null;
  onItemClick: ActionProp<ItemClickedAction>;
  index: number;
  isLoading?: boolean;
};

const getReflectionAuthor = (reflection: ContentEntityModel): string | null => {
  if (reflection.author) {
    return reflection.author;
  }
  return null;
};

const ReflectionGridCard = ({
  reflection,
  onItemClick,
  index,
  isLoading,
}: ReflectionGridCardProps) => {
  if (isLoading || !reflection) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Skeleton
          variant="rectangular"
          width={282}
          height={158}
          sx={{ aspectRatio: '16 / 9', borderRadius: '4px' }}
        />
        <Skeleton variant="text" width="100%" height={28} sx={{ mt: 2, mb: 1 }} />
        <Skeleton variant="text" width="40%" height={20} />
      </div>
    );
  }

  return (
    <a
      href={reflection.url || '#'}
      onClick={() => {
        // onItemClick is for tracking/analytics purposes
        onItemClick({
          id: reflection.id,
          index,
          sourceId: reflection.source_id,
        });
      }}
      className={styles['reflection-card__link']}
    >
      <ArticleCard.Root key={reflection.id} className={styles['reflection-card']}>
        <ArticleCard.Content className={styles['reflection-card__body']}>
          {reflection.published_date && (
            <ArticleCard.Subtitle className={styles['reflection-card__date']}>
              {formatDate(reflection.published_date)}
            </ArticleCard.Subtitle>
          )}
          <ArticleCard.Title className={styles['reflection-card__title']}>
            {reflection.title}
          </ArticleCard.Title>
          {reflection.quote && (
            <ArticleCard.Content className={styles['reflection-card__description']}>
              {reflection.quote}
            </ArticleCard.Content>
          )}
          <span aria-hidden="true" className={styles['reflection-card__divider']}></span>
          {getReflectionAuthor(reflection) && (
            <ArticleCard.Subtitle className={styles['reflection-card__author']}>
              {getReflectionAuthor(reflection)}
            </ArticleCard.Subtitle>
          )}
        </ArticleCard.Content>
      </ArticleCard.Root>
    </a>
  );
};

export default ReflectionGridCard;
