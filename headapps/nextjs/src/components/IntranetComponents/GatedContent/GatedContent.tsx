import { JSX } from 'react';
import { Link, Text, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { withJumplink } from 'lib/enhancers/withJumplink';
import { GatedContentProps } from './GatedContent.types';

// CSS module styles
import styles from './GatedContent.module.scss';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';

const cx = classNames.bind(styles);

const GatedContent = (props: GatedContentProps): JSX.Element => {
  const { fields } = props;

  return (
    <div className={cx('gated-content', 'component container', props.stylesSXA)}>
      <div className={cx('gated-content__content', 'flex flex-col gap-4')}>
        <MaterialIcon name="LockOutlined" aria-label="Restricted content" />
        <Text
          tag="p"
          className={cx('gated-content__eyebrow', 'eyebrow eyebrow-font-size')}
          field={fields.eyebrow}
        />

        <Text tag="h1" className={cx('gated-content__headline')} field={fields.componentHeadline} />

        <Text tag="p" className={cx('gated-content__subtext')} field={fields.subtext} />
        <div className={cx('gated-content__links', 'flex flex-col items-center gap-4')}>
          <Link
            field={fields.requestLink}
            className={cx('asc-btn asc-btn--primary', 'w-fit')}
            aria-label="Request access to this content"
          />
          <div className={cx('gated-content__divider')} aria-hidden="true">
            <Text tag="span" field={fields.dividerText} />
          </div>

          <Link field={fields.ctaLink} className={cx('asc-btn asc-btn--outline-white', 'w-fit')} />
        </div>
      </div>
    </div>
  );
};

export default compose<GatedContentProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(GatedContent);
