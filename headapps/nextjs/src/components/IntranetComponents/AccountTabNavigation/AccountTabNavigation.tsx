import { JSX, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AccountTabNavigationStatics } from './AccountTabNavigation.types';
import { withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { AccountTabNavigationProps } from './AccountTabNavigation.types';
import MyNewsPreferenceSettings from '../MyNewsPreferenceSettings/MyNewsPreferenceSettings';
import ProfileTab from '../ProfileTab/ProfileTab';

// CSS module styles
import styles from './AccountTabNavigation.module.scss';

const cx = classNames.bind(styles);

type TabKey = 'profile' | 'collaboration' | 'settings';

type TabItem = {
  key: TabKey;
  label: string;
  id: string;
};

const HASH_TAB_MAP: Record<string, TabKey> = {
  '#profile': 'profile',
  '#settings': 'settings',
};

const QUERY_TAB_KEYS: TabKey[] = ['profile', 'collaboration', 'settings'];

const AccountTabNavigation = (props: AccountTabNavigationProps): JSX.Element => {
  const { fields, rendering, isPersonalView = true } = props;

  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const router = useRouter();

  // Open the correct tab when the page is loaded with a bare query string
  // (e.g. /account?collaboration) or a hash (e.g. /account#settings).
  // Query string takes precedence over hash.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryTab = QUERY_TAB_KEYS.find((key) => params.has(key));
    const tabKey = queryTab || HASH_TAB_MAP[window.location.hash];
    if (tabKey && (tabKey !== 'settings' || isPersonalView)) {
      setActiveTab(tabKey);
    }
  }, [router.asPath, isPersonalView]);

  const profileTabLabel =
    fields.profileTabLabel?.jsonValue?.value || AccountTabNavigationStatics.profileTab;

  const settingsTabLabel =
    fields.settingsTabLabel?.jsonValue?.value || AccountTabNavigationStatics.settingsTab;

  const tabs: TabItem[] = [
    { key: 'profile', label: profileTabLabel, id: 'accountProfile' },
    ...(isPersonalView
      ? [{ key: 'settings' as TabKey, label: settingsTabLabel, id: 'accountSettings' }]
      : []),
  ];

  return (
    <div
      className={cx('account-tab-navigation', 'component overflow-hidden', props.stylesSXA)}
      id={rendering.params?.RenderingIdentifier}
    >
      <div className={cx('account-tab-navigation__tabs', 'container flex gap-4')}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            id={tab.id}
            type="button"
            className={cx(
              'account-tab-navigation__tab',
              activeTab === tab.key && 'account-tab-navigation__tab--active'
            )}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={cx('account-tab-navigation__tab-content-wrapper')}>
        <div className={cx('account-tab-navigation__tab-content-container', 'flex container')}>
          {activeTab === 'profile' && (
            <div className={cx('account-tab-navigation__tab-content')}>
              <ProfileTab
                rendering={props.rendering}
                params={props.params}
                stylesSXA=""
                fields={fields.myProfileSettings}
              />
            </div>
          )}

          {activeTab === 'settings' && isPersonalView && fields.myNewsPreferenceSettings && (
            <div className={cx('account-tab-navigation__tab-content')}>
              <MyNewsPreferenceSettings
                rendering={props.rendering}
                params={props.params}
                stylesSXA=""
                fields={fields.myNewsPreferenceSettings}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default compose<AccountTabNavigationProps>(
  withDatasourceCheck(),
  withStyles()
)(AccountTabNavigation);
