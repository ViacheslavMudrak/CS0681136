import { JSX } from 'react';
import {
  RichText,
  Text,
  withDatasourceCheck,
  useSitecore,
  Field,
} from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { withJumplink } from 'lib/enhancers/withJumplink';
import { ReflectionDetailBannerProps } from './ReflectionDetailBanner.types';

import styles from './ReflectionDetailBanner.module.scss';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';

const cx = classNames.bind(styles);

interface PageFields {
  title?: Field<string>;
  quote?: Field<string>;
  author?: Field<string>;
  bodyText?: Field<string>;
  description?: Field<string>;
}

const ReflectionDetailBanner = (props: ReflectionDetailBannerProps): JSX.Element | null => {
  const { fields } = props;
  const datasource = fields?.data?.datasource;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  if (!datasource && !isEditing) return null;

  // Page fields from route context
  const pageFields = (page.layout?.sitecore?.route?.fields || {}) as PageFields;

  // Card data from datasource
  const thoughtIcon = datasource?.reflectionThoughtIcon?.jsonValue?.fields?.value?.value;
  const callToActionIcon = datasource?.reflectionCallToActionIcon?.jsonValue?.fields?.value?.value;
  const prayerIcon = datasource?.reflectionPrayerIcon?.jsonValue?.fields?.value?.value;

  // Check if cards have content
  const hasThoughtContent = datasource?.reflectionThoughtDescription?.jsonValue?.value;
  const hasCallToActionContent = datasource?.reflectionCallToActionDescription?.jsonValue?.value;
  const hasPrayerContent = datasource?.reflectionPrayerDescription?.jsonValue?.value;

  return (
    <div className={cx('reflection-detail-banner', 'component', props.stylesSXA)}>
      <div className={cx('reflection-detail-banner__container', 'container flex flex-col gap-8')}>
        <div
          className={cx(
            'reflection-detail-banner__quote',
            { 'editing-mode': isEditing },
            'flex flex-col gap-6'
          )}
        >
          <Text tag="h2" field={pageFields.title} />
          <div className={cx('reflection-detail-banner__quote-text')}>
            <Text tag="span" field={pageFields.quote} />
          </div>
          <Text tag="h3" field={pageFields.author} />
        </div>

        <div className={cx('reflection-detail-banner__description', 'flex flex-col gap-4')}>
          <RichText className="rich-text" field={pageFields.bodyText || pageFields.description} />
        </div>

        <div className={cx('reflection-detail-banner__card-container', 'grid gap-10')}>
          {/* Card 1: Thought/Discussion  */}
          {(isEditing || hasThoughtContent) && (
            <div className={cx('reflection-detail-banner__card', 'flex flex-col gap-2')}>
              <div
                className={cx('reflection-detail-banner__card-header', 'flex gap-2 items-center')}
              >
                {thoughtIcon && (
                  <div
                    className={cx(
                      'reflection-detail-banner__card-icon',
                      'flex justify-center items-center'
                    )}
                  >
                    <MaterialIcon name={thoughtIcon} />
                  </div>
                )}
                <Text tag="h3" field={datasource?.reflectionThoughtLabel?.jsonValue} />
              </div>
              <RichText
                className="rich-text"
                field={datasource?.reflectionThoughtDescription?.jsonValue}
              />
            </div>
          )}

          {/* Card 2: Call to Action */}
          {(isEditing || hasCallToActionContent) && (
            <div className={cx('reflection-detail-banner__card', 'flex flex-col gap-2')}>
              <div
                className={cx('reflection-detail-banner__card-header', 'flex gap-2 items-center')}
              >
                {callToActionIcon && (
                  <div
                    className={cx(
                      'reflection-detail-banner__card-icon',
                      'flex justify-center items-center'
                    )}
                  >
                    <MaterialIcon name={callToActionIcon} />
                  </div>
                )}
                <Text tag="h3" field={datasource?.reflectionCallToActionLabel?.jsonValue} />
              </div>
              <RichText
                className="rich-text"
                field={datasource?.reflectionCallToActionDescription?.jsonValue}
              />
            </div>
          )}

          {/* Card 3: Prayer */}
          {(isEditing || hasPrayerContent) && (
            <div className={cx('reflection-detail-banner__card', 'flex flex-col gap-2')}>
              <div
                className={cx('reflection-detail-banner__card-header', 'flex gap-2 items-center')}
              >
                {prayerIcon && (
                  <div
                    className={cx(
                      'reflection-detail-banner__card-icon',
                      'flex justify-center items-center'
                    )}
                  >
                    <MaterialIcon name={prayerIcon} />
                  </div>
                )}
                <Text tag="h3" field={datasource?.reflectionPrayerLabel?.jsonValue} />
              </div>
              <RichText
                className="rich-text"
                field={datasource?.reflectionPrayerDescription?.jsonValue}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default compose<ReflectionDetailBannerProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(ReflectionDetailBanner);
