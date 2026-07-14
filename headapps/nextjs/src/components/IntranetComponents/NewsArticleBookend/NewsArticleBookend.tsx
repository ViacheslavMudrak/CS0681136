import {
  NewsArticleBookendProps,
  NewsArticleBookendStatics,
  PageFields,
} from './NewsArticleBookend.types';
import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
// import Likes from 'components/likes/Likes';
import compose from 'lib/enhancers/compose';
import { withJumplink } from 'lib/enhancers/withJumplink';
import withStyles from 'lib/enhancers/withStyles';
import { useI18n } from 'next-localization';
import Link from 'next/link';
import { JSX, useState } from 'react';
import { formatDate } from 'src/util/helpers/date-helper';

import { useSitecore } from '@sitecore-content-sdk/nextjs';

import styles from './NewsArticleBookend.module.scss';

const cx = classNames.bind(styles);

const NewsArticleBookend = (props: NewsArticleBookendProps): JSX.Element => {
  const { fields } = props;
  const { page } = useSitecore();
  const { t } = useI18n();

  const newsLandingPageUrl = page.layout.sitecore.context.landingPageSettings?.newsLandingPage?.url;
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (page.mode.isEditing) return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  // const currentPageId = page.layout?.sitecore?.route?.itemId as string;

  return (
    <div className={cx('news-article-bookend', 'component container', props.stylesSXA)}>
      {(() => {
        const displayDate =
          fields.data?.contextItem?.lastUpdatedDateOverride?.value ||
          fields.data?.contextItem?.lastUpdated?.value;

        if (!displayDate) return null;

        return (
          <p className={cx('news-article-bookend__last-updated')}>
            {t('NewsArticleBookendLastUpdatedText') || NewsArticleBookendStatics.lastUpdatedText}
            {formatDate(displayDate)}
          </p>
        );
      })()}

      <div className={cx('news-article-bookend__tags-and-actions-wrapper')}>
        {(() => {
          // Get latest V2 tags
          const pageFields = page.layout.sitecore.route?.fields as PageFields | undefined;

          const areaTags = pageFields?.areaTags || [];
          const topicTags = pageFields?.topicTags || [];
          const contentTags = pageFields?.contentTags || [];
          const allTags = [...areaTags, ...topicTags, ...contentTags];

          if (allTags.length === 0) return null;

          return (
            <div className={cx('news-article-bookend__tags-container')}>
              {allTags.map((tag, index) => {
                const tagTitle = tag?.fields?.title?.value || tag?.displayName || tag?.name;
                const tagUrl =
                  newsLandingPageUrl && tagTitle
                    ? `${newsLandingPageUrl}?q=${encodeURIComponent(tagTitle)}`
                    : newsLandingPageUrl || '#';

                return (
                  <Link
                    key={tag.id || index}
                    href={tagUrl}
                    className={cx('news-article-bookend__tag')}
                  >
                    <span>{tagTitle}</span>
                  </Link>
                );
              })}
            </div>
          );
        })()}

        <div className={cx('news-article-bookend__actions', 'justify-end')}>
          {/* <Likes pageId={currentPageId} /> */}
          <button
            className={cx('news-article-bookend__copy-link-button')}
            aria-label="Copy Link"
            onClick={handleCopy}
          >
            <MaterialIcon name="Link" className={cx('news-article-bookend__icon')} />
            <span>
              {copied
                ? t('NewsArticleBookendCopiedLinkText') || NewsArticleBookendStatics.copiedLinkText
                : t('NewsArticleBookendCopyLinkText') || NewsArticleBookendStatics.copyLinkText}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const Default = compose<NewsArticleBookendProps>(
  withStyles(),
  withJumplink()
)(NewsArticleBookend);

export default Default;
