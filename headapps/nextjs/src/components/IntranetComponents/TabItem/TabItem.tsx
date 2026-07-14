import { JSX } from 'react';
import { Text, Placeholder, withDatasourceCheck, useSitecore } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { TabItemProps } from '../TabContainer/TabContainer.types';
import { PLACEHOLDER_CONSTANTS } from 'src/constants/placeholders';

// CSS module styles
import styles from './TabItem.module.scss';

const cx = classNames.bind(styles);

const TabItem = (props: TabItemProps): JSX.Element => {
  const { fields, rendering, params } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const id = params?.RenderingIdentifier;
  const dynamicPlaceholderId = params?.DynamicPlaceholderId;

  // Create the dynamic placeholder key for this tab's content
  const placeholderKey = `${PLACEHOLDER_CONSTANTS.TABITEM_CONTENT_BASEKEY}-${dynamicPlaceholderId}`;

  return (
    <div className={cx('tab-item', props.stylesSXA)} id={id || undefined}>
      {/* Tab Title - shown in editing mode for context */}
      {isPageEditing && (
        <div className={cx('tab-item__header')}>
          <Text field={fields.tabTitle} tag="h3" />
        </div>
      )}

      {/* Tab Content Placeholder */}
      <div className={cx('tab-item__content')}>
        <Placeholder name={placeholderKey} rendering={rendering} />
      </div>
    </div>
  );
};

function NoDatasourceComponent(): JSX.Element {
  return (
    <div className={cx('tab-item')}>
      <p>No datasource configured for this tab item.</p>
    </div>
  );
}

export default compose<TabItemProps>(
  withDatasourceCheck({
    editingErrorComponent: NoDatasourceComponent,
  }),
  withStyles()
)(TabItem);
