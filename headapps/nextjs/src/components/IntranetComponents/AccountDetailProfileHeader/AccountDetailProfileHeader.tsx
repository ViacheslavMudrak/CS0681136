import type { JSX } from 'react';
import classNames from 'classnames/bind';
import { Avatar, Skeleton } from '@mui/material';
import { useSession } from 'next-auth/react';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { withJumplink } from 'lib/enhancers/withJumplink';
import type { AccountDetailProfileHeaderProps } from './AccountDetailProfileHeader.types';

import styles from './AccountDetailProfileHeader.module.scss';

const cx = classNames.bind(styles);

const AccountDetailProfileHeader = (props: AccountDetailProfileHeaderProps): JSX.Element => {
  const { data: session, status } = useSession();
  const profile = session?.googleProfile;
  const loading = status === 'loading';

  let firstName = profile?.name?.givenName ?? '';
  let lastName = profile?.name?.familyName ?? '';
  if (!firstName && !lastName && profile?.name?.displayName) {
    const parts = profile.name.displayName.trim().split(/\s+/);
    firstName = parts[0] ?? '';
    lastName = parts.slice(1).join(' ');
  }
  const fullName = `${firstName} ${lastName}`.trim();

  const photoUrl = profile?.photos?.[0]?.url;
  const title = profile?.organizations?.[0]?.title;
  const department = profile?.organizations?.[0]?.department;

  return (
    <div
      className={cx(
        'account-detail-profile-header',
        'component container flex items-center gap-4',
        props.stylesSXA
      )}
    >
      <div className={cx('account-detail-profile-header__image', 'flex')}>
        {loading ? (
          <Skeleton variant="circular" width={96} height={96} />
        ) : (
          <Avatar
            className={cx('account-detail-profile-header__avatar', 'flex')}
            src={photoUrl}
            alt={fullName}
            imgProps={{ referrerPolicy: 'no-referrer' }}
            sx={{ width: 96, height: 96, bgcolor: 'var(--color-brand-blue-900)' }}
          >
            {firstName[0] ?? ''}
            {lastName[0] ?? ''}
          </Avatar>
        )}
      </div>
      <div className="flex flex-col md:gap-4 flex-[1_0_auto]">
        {loading ? (
          <>
            <Skeleton variant="text" width={200} height={32} />
            <Skeleton variant="text" width={300} height={20} />
          </>
        ) : (
          <>
            <span className={cx('account-detail-profile-header__name', 'flex')}>{fullName}</span>
            <span
              className={cx(
                'account-detail-profile-header__info',
                'flex flex-col md:flex-row md:gap-2'
              )}
            >
              {title && <span>{title}</span>}
              {title && department && (
                <span className={cx('account-detail-profile-header__bullet', 'flex')}></span>
              )}
              {department && (
                <span className={cx('account-detail-profile-header__department', 'flex')}>
                  {department}
                </span>
              )}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default compose<AccountDetailProfileHeaderProps>(
  withStyles(),
  withJumplink()
)(AccountDetailProfileHeader);
