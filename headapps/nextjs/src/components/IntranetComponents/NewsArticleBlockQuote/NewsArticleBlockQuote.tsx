import { JSX } from 'react';
import { Text, withDatasourceCheck, useSitecore } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { NewsArticleBlockQuoteProps } from './NewsArticleBlockQuote.types';

// CSS module styles
import styles from './NewsArticleBlockQuote.module.scss';
import { withJumplink } from 'lib/enhancers/withJumplink';

const cx = classNames.bind(styles);

const NewsArticleBlockQuote = (props: NewsArticleBlockQuoteProps): JSX.Element | null => {
  const { fields } = props;
  const hasQuoteCaption = fields.quoteCaption?.value;

  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  // Don't render if there's no quote text (except in editing mode)
  if (!fields.quoteText?.value && !isPageEditing) {
    return null;
  }

  return (
    <div
      className={cx('news-article-block-quote', 'component container', props.stylesSXA, {
        'news-article-block-quote--centered': !hasQuoteCaption,
      })}
    >
      <blockquote className={cx('news-article-block-quote__content')}>
        <Text field={fields.quoteText} tag="p" className={cx('news-article-block-quote__quote')} />
        {(hasQuoteCaption || isPageEditing) && (
          <Text
            field={fields.quoteCaption}
            tag="p"
            className={cx('news-article-block-quote__caption')}
          />
        )}
      </blockquote>
    </div>
  );
};

export default compose<NewsArticleBlockQuoteProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(NewsArticleBlockQuote);
