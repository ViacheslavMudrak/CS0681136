import { JSX } from 'react';
import { useSitecore, Text, Link, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { useI18n } from 'next-localization';
import { formatDate } from 'src/util/helpers/date-helper';
import { getReflectionPageFields } from 'src/util/helpers/reflection-page-helper';
// import Likes from 'components/likes/Likes';

import {
  ReflectionDetailHeaderProps,
  ReflectionDetailHeaderStatics,
} from './ReflectionDetailHeader.types';
import styles from './ReflectionDetailHeader.module.scss';

const cx = classNames.bind(styles);

const ReflectionDetailHeader = (props: ReflectionDetailHeaderProps): JSX.Element => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const { t } = useI18n();
  const isPageEditing = page.mode.isEditing;

  // Get page-level fields (publishDate) from the reflection detail page context
  const pageFields = getReflectionPageFields(page);

  // Format reflection date from page context publishDate field
  const publishDate = pageFields?.publishDate?.value;
  const formattedDate = publishDate ? formatDate(publishDate) : '';

  const shouldRenderGoogleSlide = Boolean(fields?.googleSlideFile?.value?.href) || isPageEditing;
  const shouldRenderPDF = Boolean(fields?.pdfFile?.value?.href) || isPageEditing;

  // Like functionality using Firestore
  // const currentPageId = page.layout?.sitecore?.route?.itemId as string;

  return (
    <div
      className={cx('reflection-detail-header', 'component container', props.stylesSXA)}
      id={rendering.params?.RenderingIdentifier}
    >
      {/* Header Section */}
      <div className={cx('reflection-detail-header__content')}>
        {/* Left side: Label and Date */}
        <div className={cx('reflection-detail-header__left')}>
          <Text field={fields?.label} tag="div" className={cx('reflection-detail-header__label')} />
          <div className={cx('reflection-detail-header__headline')}>{formattedDate}</div>
        </div>

        {/* Right side: Action buttons */}
        <div className={cx('reflection-detail-header__actions')}>
          {/* Google Slide button */}
          {shouldRenderGoogleSlide && (
            <Link
              field={fields?.googleSlideFile}
              className={cx('reflection-detail-header__action-button')}
            >
              <MaterialIcon name="Slideshow" />
              <span>
                {t('ReflectionDetailHeaderGoogleSlideText') ||
                  ReflectionDetailHeaderStatics.GoogleSlideText}
              </span>
            </Link>
          )}

          {/* PDF button */}
          {shouldRenderPDF && (
            <Link field={fields?.pdfFile} className={cx('reflection-detail-header__action-button')}>
              <MaterialIcon name="PictureAsPdf" />
              <span>
                {t('ReflectionDetailHeaderPDFText') || ReflectionDetailHeaderStatics.PDFText}
              </span>
            </Link>
          )}

          {/* Like icon and count */}
          {/* <Likes pageId={currentPageId} /> */}
        </div>
      </div>
    </div>
  );
};

function NoDatasourceComponent(): JSX.Element {
  const { t } = useI18n();

  return (
    <div className={cx('reflection-detail-header', 'component container')}>
      <div className={cx('reflection-detail-header__no-datasource')}>
        <p>
          {t(ReflectionDetailHeaderStatics.DictionaryKey_NoDatasource) ||
            ReflectionDetailHeaderStatics.NoDatasourceFallbackMessage}
        </p>
      </div>
    </div>
  );
}

export default compose<ReflectionDetailHeaderProps>(
  withStyles(),
  withDatasourceCheck({
    editingErrorComponent: NoDatasourceComponent,
  })
)(ReflectionDetailHeader);
