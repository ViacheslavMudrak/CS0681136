import { JSX } from 'react';
import { Image, Text, withDatasourceCheck, useSitecore } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';

import { NewsArticleAuthorBioProps } from './NewsArticleAuthorBio.types';

// CSS module styles
import styles from './NewsArticleAuthorBio.module.scss';
import { withJumplink } from 'lib/enhancers/withJumplink';

const cx = classNames.bind(styles);

const NewsArticleAuthorBio = (props: NewsArticleAuthorBioProps): JSX.Element | null => {
  const { fields } = props;

  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  // Don't render if there's no author name (except in editing mode)
  if (!fields.authorName?.value && !isPageEditing) {
    return null;
  }

  const hasAuthorImage = fields.authorImage?.value?.src;

  return (
    <div className={cx('news-article-author-bio', 'component', props.stylesSXA)}>
      <div className={cx('news-article-author-bio__content', 'container')}>
        {(hasAuthorImage || isPageEditing) && (
          <div className={cx('news-article-author-bio__image')}>
            <Image field={fields.authorImage} />
          </div>
        )}
        <div
          className={cx('news-article-author-bio__info', {
            'news-article-author-bio__info--no-image': !hasAuthorImage && !isPageEditing,
          })}
        >
          <div className={cx('news-article-author-bio__header')}>
            <Text
              className={cx('news-article-author-bio__eyebrow')}
              field={fields.optionalEyebrow}
              tag="p"
            />
            <Text
              className={cx('news-article-author-bio__name')}
              field={fields.authorName}
              tag="h3"
            />
          </div>
        </div>
        <Text
          className={cx('news-article-author-bio__bio', {
            'news-article-author-bio__bio--no-image': !hasAuthorImage && !isPageEditing,
          })}
          field={fields.authorBio}
          tag="p"
        />
      </div>
    </div>
  );
};

// Export without datasource check for Storybook
export const NewsArticleAuthorBioComponent = NewsArticleAuthorBio;

export default compose<NewsArticleAuthorBioProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(NewsArticleAuthorBio);
