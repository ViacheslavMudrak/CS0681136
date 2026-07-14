import { JSX } from 'react';
import { Text, withDatasourceCheck, useSitecore } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import { useI18n } from 'next-localization';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { withJumplink } from 'lib/enhancers/withJumplink';
import {
  OrganizationalUpdatesHeaderProps,
  OrganizationalUpdatesHeaderStatics,
} from './OrganizationalUpdatesHeader.types';

// CSS module styles
import styles from './OrganizationalUpdatesHeader.module.scss';

const cx = classNames.bind(styles);

const OrganizationalUpdatesHeader = (props: OrganizationalUpdatesHeaderProps): JSX.Element => {
  const { fields } = props;
  const { page } = useSitecore();
  const { t } = useI18n();
  const isEditing = page?.mode?.isEditing || false;

  // Check if any field has content
  const hasContent = fields.to?.value || fields.cc?.value || fields.from?.value || isEditing;

  // Don't render if no content and not in editing mode
  if (!hasContent) {
    return <></>;
  }

  return (
    <div
      className={cx(
        'organizational-updates-header',
        'component container ou-header__global',
        props.stylesSXA
      )}
    >
      <div className={cx('organizational-updates-header__content')}>
        {(fields.to?.value || isEditing) && (
          <div className={cx('organizational-updates-header__row')}>
            <span className={cx('organizational-updates-header__label')}>
              {t('OrganizationalUpdatesHeaderTo') ||
                OrganizationalUpdatesHeaderStatics.OrganizationalUpdatesHeaderTo}
            </span>
            <Text
              field={fields.to}
              tag="span"
              className={cx('organizational-updates-header__value')}
            />
          </div>
        )}
        {(fields.cc?.value || isEditing) && (
          <div className={cx('organizational-updates-header__row')}>
            <span className={cx('organizational-updates-header__label')}>
              {t('OrganizationalUpdatesHeaderCc') ||
                OrganizationalUpdatesHeaderStatics.OrganizationalUpdatesHeaderCc}
            </span>
            <Text
              field={fields.cc}
              tag="span"
              className={cx('organizational-updates-header__value')}
            />
          </div>
        )}
        {(fields.from?.value || isEditing) && (
          <div className={cx('organizational-updates-header__row')}>
            <span className={cx('organizational-updates-header__label')}>
              {t('OrganizationalUpdatesHeaderFrom') ||
                OrganizationalUpdatesHeaderStatics.OrganizationalUpdatesHeaderFrom}
            </span>
            <Text
              field={fields.from}
              tag="span"
              className={cx('organizational-updates-header__value')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default compose<OrganizationalUpdatesHeaderProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(OrganizationalUpdatesHeader);
