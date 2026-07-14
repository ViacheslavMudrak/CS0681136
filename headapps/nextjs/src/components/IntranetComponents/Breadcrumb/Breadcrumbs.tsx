import { JSX } from 'react';
import classNames from 'classnames/bind';

import { BreadcrumbProps } from './Breadcrumb.types';
import styles from './Breadcrumb.module.scss';
import { Breadcrumbs, Link, Typography, useMediaQuery } from '@mui/material';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { MediaQueryConstants } from 'src/util/const/material';

const cx = classNames.bind(styles);

const Breadcrumb = (props: BreadcrumbProps): JSX.Element => {
  const { fields } = props;
  const allBreadcrumbs = fields.data.currentItem?.breadcrumbItems ?? [];

  const crumbsInOrder = [...allBreadcrumbs]
    .filter((crumb) => !crumb.hideInBreadcrumbs?.jsonValue?.value)
    .reverse();

  const isMobile = useMediaQuery(MediaQueryConstants.Mobile);

  return (
    <div className={`${cx('breadcrumb', 'component flex container', props.stylesSXA)} breadcrumb`}>
      <Breadcrumbs
        component="nav"
        maxItems={isMobile ? 2 : 3}
        itemsBeforeCollapse={0}
        itemsAfterCollapse={isMobile ? 1 : 2}
        aria-label="breadcrumb"
        separator={<MaterialIcon name="ChevronRight" className={cx('breadcrumb__chevron')} />}
      >
        {crumbsInOrder.map((breadcrumb, index) => (
          <Link key={index} underline="hover" href={breadcrumb.url.path}>
            {breadcrumb.navTitle.jsonValue.value || breadcrumb.title.jsonValue.value}
          </Link>
        ))}
        <Typography>
          {fields.data.currentItem.navTitle.jsonValue.value ||
            fields.data.currentItem.title.jsonValue.value}
        </Typography>
      </Breadcrumbs>
    </div>
  );
};

export default Breadcrumb;
