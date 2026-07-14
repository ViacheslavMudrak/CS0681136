import { JSX, useMemo } from 'react';
import { withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { withJumplink } from 'lib/enhancers/withJumplink';
import {
  AccountDetailProps,
  type AccountDetailDatasourceFields,
  type AccountDetailRawDatasourceFieldEntry,
} from './AccountDetail.types';
import AccountTabNavigation from 'components/IntranetComponents/AccountTabNavigation/AccountTabNavigation';

// CSS module styles
import styles from './AccountDetail.module.scss';

const cx = classNames.bind(styles);

/**
 * Transforms the batched `fields(ownFields: true)` array returned by the
 * rendering's ComponentQuery into the keyed shape that downstream
 * components consume. Entries with a null `jsonValue` are dropped so each
 * label still falls through to its component-level static default.
 */
const buildSettingsFields = (
  rawFields: AccountDetailRawDatasourceFieldEntry[]
): AccountDetailDatasourceFields => {
  const map: Record<string, { jsonValue: unknown }> = {};
  for (const entry of rawFields) {
    if (entry?.name && entry.jsonValue) {
      map[entry.name] = { jsonValue: entry.jsonValue };
    }
  }
  return map as unknown as AccountDetailDatasourceFields;
};

const AccountDetail = (props: AccountDetailProps): JSX.Element => {
  const rawFields = props.fields?.data?.datasource?.fields;
  const settingsFields = useMemo(
    () => (rawFields ? buildSettingsFields(rawFields) : null),
    [rawFields]
  );

  return (
    <div className={cx('account-detail', 'component', props.stylesSXA)}>
      {settingsFields && (
        <AccountTabNavigation
          rendering={props.rendering}
          params={props.params}
          stylesSXA=""
          fields={{
            profileTabLabel: settingsFields.profileTabLabel,
            collaborationTabLabel: settingsFields.collaborationTabLabel,
            settingsTabLabel: settingsFields.settingsTabLabel,
            myNewsPreferenceSettings: settingsFields,
            myProfileSettings: settingsFields,
          }}
        />
      )}
    </div>
  );
};

export default compose<AccountDetailProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(AccountDetail);
