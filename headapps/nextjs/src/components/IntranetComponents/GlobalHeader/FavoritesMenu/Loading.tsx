import classNames from 'classnames/bind';
import { Fragment, JSX } from 'react';

import Skeleton from '@mui/material/Skeleton';

import styles from './FavoritesMenu.module.scss';

const cx = classNames.bind(styles);

type LoadingProps = {
  isVisible?: boolean;
};

const Loading = ({ isVisible }: LoadingProps): JSX.Element | null => {
  return isVisible ? (
    <div className={cx('global-header__skeleton-folder', 'flex flex-col gap-2')}>
      {Array.from({ length: 3 }, (_, folderIndex) => (
        <Fragment key={folderIndex}>
          <div className={cx('global-header__skeleton-folder-header', 'flex items-center gap-2')}>
            <Skeleton variant="circular" width={30} height={30} />
            <Skeleton variant="text" width={180} height={30} />
          </div>
          <div className={cx('global-header__skeleton-folder-links', 'flex flex-col gap-2')}>
            {Array.from({ length: 3 }, (_, linkIndex) => (
              <div
                key={linkIndex}
                className={cx('global-header__skeleton-folder-link', 'flex items-center gap-2')}
              >
                <Skeleton variant="rectangular" width={20} height={20} />
                <Skeleton variant="text" width={180} height={18} />
              </div>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  ) : null;
};

export default Loading;
