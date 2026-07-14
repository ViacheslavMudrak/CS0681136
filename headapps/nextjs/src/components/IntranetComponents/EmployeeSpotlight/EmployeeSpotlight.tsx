import { JSX } from 'react';
import { Image, Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { EmployeeSpotlightProps } from './EmployeeSpotlight.types';

// CSS module styles
import styles from './EmployeeSpotlight.module.scss';
import { withJumplink } from 'lib/enhancers/withJumplink';

const cx = classNames.bind(styles);

const EmployeeSpotlight = (props: EmployeeSpotlightProps): JSX.Element => {
  const { fields } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing;

  // Hide component if image is not set (only required field) to prevent ghost elements (but not in edit mode)
  if (!fields.spotlightImage?.value?.src && !isEditing) {
    return <></>;
  }

  return (
    <div className={cx('employee-spotlight', 'component container', props.stylesSXA)}>
      <div
        className={cx('employee-spotlight__container', 'flex flex-col md:flex-row md:items-center')}
      >
        <div className={cx('employee-spotlight__image', 'flex flex-[1_1_40%]')}>
          <Image field={fields.spotlightImage} />
        </div>
        <div className="flex flex-col flex-[1_1_60%]">
          <Text field={fields.headline} tag="h3" />
          <Text
            className={cx('employee-spotlight__tag', 'uppercase block')}
            field={fields.spotlight1Tag}
            tag="span"
          />
          <Text
            className={cx('employee-spotlight__value', 'block')}
            field={fields.spotlight1Value}
            tag="span"
          />
          <Text
            className={cx('employee-spotlight__tag', 'uppercase block')}
            field={fields.spotlight2Tag}
            tag="span"
          />
          <Text
            className={cx('employee-spotlight__value', ' block')}
            field={fields.spotlight2Value}
            tag="span"
          />
          <Text
            className={cx('employee-spotlight__tag', 'uppercase block')}
            field={fields.spotlight3Tag}
            tag="span"
          />
          <Text
            className={cx('employee-spotlight__value', 'block')}
            field={fields.spotlight3Value}
            tag="span"
          />
        </div>
      </div>
    </div>
  );
};

export default compose<EmployeeSpotlightProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(EmployeeSpotlight);
