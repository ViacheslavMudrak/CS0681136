import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { Link } from '@sitecore-content-sdk/nextjs';
import { JSX } from 'react';
import styles from './AccountMenu.module.scss';
import { AccountMenuProps } from './AccountMenu.types';
import { signIn, signOut, useSession } from 'next-auth/react';
import { GlobalHeaderStatics } from '../GlobalHeader.types';

const cx = classNames.bind(styles);

const AccountMenu = ({
  isOpen,
  onClose,
  globalHeaderAccountMenu,
}: AccountMenuProps): JSX.Element => {
  const { data: session } = useSession();
  const associateIdLabel =
    globalHeaderAccountMenu?.accountMenuAssociateIdLabel?.jsonValue?.value ??
    GlobalHeaderStatics.associateIdLabel;
  const accountMenuTitle =
    globalHeaderAccountMenu?.accountMenuTitle?.jsonValue?.value ??
    GlobalHeaderStatics.accountMenuHeader;
  const displayName = session?.user?.name || 'Firstname Lastname';
  const employeeId = session?.googleProfile?.userInfo?.employeeNumber || '1234567';

  return (
    <div
      className={cx('account-menu', 'utility-menu', 'flex-col absolute', {
        'utility-menu-open': isOpen,
      })}
    >
      <div className={cx('account-menu__menu-header', 'flex items-center justify-between')}>
        <div className="flex gap-2 items-center">
          <span>{accountMenuTitle}</span>
        </div>
        <div className={cx('account-menu__close-menu', '')} onClick={onClose}>
          <MaterialIcon name="Close" />
        </div>
      </div>

      <div className={cx('account-menu__menu-item-container', 'flex flex-col gap-4 mt-4')}>
        {/* ACCOUNT CONTENT */}
        <div className={cx('account-menu__account-content', 'flex flex-col gap-4')}>
          <div className={cx('account-menu__account-content-header', 'flex flex-col w-full')}>
            <span>{displayName}</span>
          </div>
          <div className={cx('account-menu__employee-id', 'flex flex-col w-full')}>
            <span>{associateIdLabel}</span>
            <span>{employeeId}</span>
          </div>
        </div>

        {/* ACCOUNT LINKS */}
        {globalHeaderAccountMenu?.children.results.length != 0 && (
          <div className={cx('account-menu__account-links', 'flex flex-col gap-4')}>
            {globalHeaderAccountMenu?.children.results.map((link, index) => (
              <Link
                field={link?.navigationLink?.jsonValue}
                key={index}
                className={cx('flex items-center gap-2')}
                onClick={onClose}
              >
                <MaterialIcon name={link?.navigationIcon?.jsonValue.value} />
                <span>{link?.navigationLink?.jsonValue.value?.text}</span>
              </Link>
            ))}
          </div>
        )}
        <div className={cx('account-menu__footer', 'flex flex-col gap-4')}>
          {session ? (
            <>
              <button
                className={cx('account-menu__logout', 'flex w-full')}
                onClick={() => {
                  /**
                   * Block silent SSO from auto-signing the user back in after
                   * an explicit logout. Cleared on the next manual sign-in.
                   */
                  sessionStorage.setItem('justLoggedOut', '1');
                  signOut({ callbackUrl: '/auth/signin?reauth=true' });
                }}
              >
                <span className={cx('account-menu__logout-icon')}>
                  <MaterialIcon name="logout" />
                </span>
                <span>Log out</span>
              </button>
              {process.env.NEXT_PUBLIC_ENV !== 'PROD' && process.env.NEXT_PUBLIC_ENV !== 'UAT' && (
                <button
                  className={cx('account-menu__logout', 'flex w-full')}
                  onClick={() => {
                    sessionStorage.setItem('justLoggedOut', '1');
                    /** First sign out of NextAuth session, then redirect to Google logout */
                    signOut({ redirect: false }).then(() => {
                      const googleLogoutUrl = new URL('https://accounts.google.com/Logout');
                      googleLogoutUrl.searchParams.set(
                        'continue',
                        `https://appengine.google.com/_ah/logout?continue=${encodeURIComponent(window.location.origin)}`
                      );
                      window.location.href = googleLogoutUrl.toString();
                    });
                  }}
                >
                  <span className={cx('account-menu__logout-icon')}>
                    <MaterialIcon name="logout" />
                  </span>
                  <span>Force Logout</span>
                </button>
              )}
            </>
          ) : (
            <button className={cx('account-menu__login', 'flex w-full')} onClick={() => signIn()}>
              Log in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountMenu;
