import {
  NewsArticleHeaderProps,
  NewsArticleHeaderStatics,
  NewsArticleHeaderVariant,
} from './NewsArticleHeader.types';
import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
// import Likes from 'components/likes/Likes';
import { useI18n } from 'next-localization';
import { JSX, useState, useEffect } from 'react';
import readingTime from 'reading-time';
import { formatDate } from 'src/util/helpers/date-helper';
import { getNewsPageFields } from 'src/util/helpers/news-page-helper';

import { Image, Text, withDatasourceCheck, useSitecore } from '@sitecore-content-sdk/nextjs';

import styles from './NewsArticleHeader.module.scss';

const cx = classNames.bind(styles);

const NewsArticleHeader = (
  props: NewsArticleHeaderProps & { variant?: NewsArticleHeaderVariant }
): JSX.Element => {
  const { fields, rendering, variant = 'fullwidth' } = props;
  const { page } = useSitecore();
  const { t } = useI18n();
  const showDescription = rendering.params?.showDescription === '1';
  const isCondensed = variant === 'condensed';

  // Get page-level fields (title, pageIntroduction, publishDate, thumbnail)
  const pageFields = getNewsPageFields(page);

  // Use datasource fields if available, otherwise fall back to page fields
  const articleTitle = pageFields?.title;
  const shortDescription = pageFields?.pageIntroduction;
  const publishDate = pageFields?.publishDate?.value;

  /**
   * Header image resolution: data-source Article Image takes priority; if it's
   * empty, fall back to the page-level Thumbnail. In editing mode, always render
   * the Article Image field so authors keep its in-place edit chrome / placeholder.
   */
  const articleImageSrc = fields.articleImage?.value?.src;
  const thumbnailField = pageFields?.thumbnail;
  const headerImage =
    !page.mode.isEditing && !articleImageSrc && thumbnailField?.value?.src
      ? thumbnailField
      : fields.articleImage;

  //This is for the copy link, but might either be changed or removed later
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (page.mode.isEditing) return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const [readTime, setReadTime] = useState('');

  useEffect(() => {
    const mainArticle = document.querySelector('main article');
    const text = mainArticle?.textContent ?? '';
    const { minutes } = readingTime(text, { wordsPerMinute: 250 });
    setReadTime(`${Math.ceil(minutes)}`);
  }, []);

  // const currentPageId = page.layout?.sitecore?.route?.itemId as string;

  return (
    <div
      className={cx(
        'news-article-header',
        isCondensed && 'news-article-header--condensed',
        'component container',
        props.stylesSXA
      )}
      id={rendering.params?.RenderingIdentifier}
    >
      <div className={cx('news-article-header__content', 'flex flex-col gap-8')}>
        <Text field={articleTitle} tag="h1" />

        {showDescription && <Text field={shortDescription} tag="p" />}

        <div className={cx('news-article-header__details', 'flex flex-col gap-2')}>
          <div className={cx('news-article-header__date-time', 'flex gap-2 uppercase')}>
            <span className="text-eyebrow tracking-[0.25px]">{formatDate(publishDate)}</span>
            <span className={cx('news-article-header__read-time')}>
              {readTime}{' '}
              {t('NewsArticleHeaderMinReadText') ||
                NewsArticleHeaderStatics.NewsArticleHeaderMinReadText}
            </span>
          </div>

          <div
            className={cx(
              'news-article-header__social',
              // default: your current responsive layout
              'flex flex-col md:flex-row md:justify-between gap-4',
              // condensed: on DESKTOP force a vertical stack (author on top, likes below)
              isCondensed && 'lg:flex-col lg:items-start lg:gap-2 lg:justify-start'
            )}
          >
            {fields.authorName?.value && (
              <span>
                {t('NewsArticleHeaderByText') || NewsArticleHeaderStatics.NewsArticleHeaderByText}{' '}
                <Text field={fields.authorName} tag="span" />
              </span>
            )}

            <div
              className={cx(
                'news-article-header__interactions',
                'flex items-center gap-4',
                // default: right aligned
                'justify-end',
                // condensed desktop: left aligned, stacked under author
                isCondensed && 'lg:justify-start '
              )}
            >
              {/* <Likes pageId={currentPageId} /> */}
              <span className="flex gap-2 cursor-pointer select-none" onClick={handleCopy}>
                <MaterialIcon name="link" />{' '}
                {copied
                  ? t('NewsArticleHeaderCopiedText') ||
                    NewsArticleHeaderStatics.NewsArticleHeaderCopiedText
                  : t('NewsArticleHeaderCopyLinkText') ||
                    NewsArticleHeaderStatics.NewsArticleHeaderCopyLinkText}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className={cx('news-article-header__image', '')}>
        <Image field={headerImage} />
      </div>
    </div>
  );
};

export const FullWidth = compose<NewsArticleHeaderProps>(
  withDatasourceCheck(),
  withStyles()
)((props: NewsArticleHeaderProps) => <NewsArticleHeader {...props} variant="fullwidth" />);

export const Condensed = compose<NewsArticleHeaderProps>(
  withDatasourceCheck(),
  withStyles()
)((props: NewsArticleHeaderProps) => <NewsArticleHeader {...props} variant="condensed" />);

export default FullWidth;
