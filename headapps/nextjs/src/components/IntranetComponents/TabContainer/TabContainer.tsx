import { JSX, useState, useRef, useEffect } from 'react';
import {
  Text,
  Placeholder,
  useSitecore,
  withPlaceholder,
  Field,
} from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { TabContainerProps } from './TabContainer.types';
import { PLACEHOLDER_CONSTANTS } from 'src/constants/placeholders';

// CSS module styles
import styles from './TabContainer.module.scss';
import { withJumplink } from 'lib/enhancers/withJumplink';

const cx = classNames.bind(styles);

// Wildcard placeholder key for withPlaceholder HOC
const wildcardPlaceholderKey = `${PLACEHOLDER_CONSTANTS.TABCONTAINER_BASEKEY}-{*}`;

const TabContainer = (props: TabContainerProps): JSX.Element => {
  const { rendering, params } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const tabsWrapperRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Get title from fields
  const titleField = props.fields?.containerTitle;

  // Dynamic placeholder key for editing mode
  const dynamicPlaceholderKey = `${PLACEHOLDER_CONSTANTS.TABCONTAINER_BASEKEY}-${params?.DynamicPlaceholderId}`;

  // Get tabs from placeholder data (for normal mode)
  const tabsFromPlaceholder = rendering?.placeholders?.[wildcardPlaceholderKey] || [];

  // Get valid tabs (those with fields)
  const validTabs = tabsFromPlaceholder.filter((tab) => tab && tab.fields && tab.fields.tabTitle);

  const handleTabClick = (index: number) => {
    if (index === activeTabIndex) return;

    // Determine slide direction
    setSlideDirection(index > activeTabIndex ? 'left' : 'right');

    // Set new active tab after a brief delay to trigger animation
    setTimeout(() => {
      setActiveTabIndex(index);
      setSlideDirection(null);
    }, 50);
  };

  // Scroll selected tab into view on mobile
  useEffect(() => {
    if (tabRefs.current[activeTabIndex] && tabsWrapperRef.current) {
      const selectedTab = tabRefs.current[activeTabIndex];
      const wrapper = tabsWrapperRef.current;

      // Always scroll the selected tab to the left edge of the container
      const tabLeft = selectedTab.offsetLeft;

      wrapper.scrollTo({
        left: tabLeft,
        behavior: 'smooth',
      });
    }
  }, [activeTabIndex]);

  const shouldRenderTitle = Boolean((titleField as Field<string>)?.value) || isPageEditing;

  // In editing mode, use Placeholder component for Experience Editor functionality
  if (isPageEditing) {
    return (
      <div
        className={cx('tab-container', 'component container', props.stylesSXA)}
        id={rendering?.params?.RenderingIdentifier}
      >
        {shouldRenderTitle && (
          <Text tag="h2" className={cx('tab-container__headline')} field={titleField} />
        )}
        <Placeholder name={dynamicPlaceholderKey} rendering={rendering} />
      </div>
    );
  }

  // Normal mode - render tabs with navigation
  return (
    <div
      className={cx('tab-container', 'component container', props.stylesSXA)}
      id={rendering?.params?.RenderingIdentifier}
    >
      {/* Container Title */}
      {shouldRenderTitle && (
        <Text tag="h2" className={cx('tab-container__headline')} field={titleField} />
      )}

      {/* Tabs Navigation */}
      {validTabs.length > 0 && (
        <div className={cx('tab-container__tabs')}>
          <div className={cx('tab-container__tabs-wrapper')} ref={tabsWrapperRef}>
            {validTabs.map((tab, index: number) => (
              <button
                key={tab.uid || `tab-${index}`}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                className={cx('tab-container__tab', {
                  'tab-container__tab--active': index === activeTabIndex,
                })}
                onClick={() => handleTabClick(index)}
                type="button"
              >
                <Text field={tab.fields?.tabTitle as Field<string>} tag="span" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content Area */}
      <div
        className={cx('tab-container__content', {
          'tab-container__content--slide-left': slideDirection === 'left',
          'tab-container__content--slide-right': slideDirection === 'right',
        })}
      >
        {validTabs.map((tab, index: number) => {
          // Only render the active tab panel
          if (activeTabIndex === index) {
            return (
              <div
                key={tab.uid || `panel-${index}`}
                className={cx('tab-container__panel', 'tab-container__panel--active')}
                role="tabpanel"
              >
                <Placeholder
                  name={`${PLACEHOLDER_CONSTANTS.TABITEM_CONTENT_BASEKEY}-${tab.params?.DynamicPlaceholderId}`}
                  rendering={tab}
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default compose(
  withStyles()<TabContainerProps>,
  withJumplink()<TabContainerProps>,
  withPlaceholder
)(TabContainer);
