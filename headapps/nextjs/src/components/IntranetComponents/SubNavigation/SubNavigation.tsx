import { JSX, useEffect, useState, useRef } from 'react';
import {
  ComponentRendering,
  GetComponentServerProps,
  LayoutServiceData,
  Link,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { createGraphQLClientFactory } from '@sitecore-content-sdk/nextjs/client';
import classNames from 'classnames/bind';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import scConfig from 'sitecore.config';
import styles from './SubNavigation.module.scss';
import {
  SubNavigationProps,
  SubNavigationGraphQLResponse,
  SubNavItem,
  VisibleByEmail,
} from './SubNavigation.types';
import { SubNavigation_GQL } from './SubNavigation.graphql';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { useMediaQuery } from '@mui/material';
import { MediaQueryConstants } from 'src/util/const/material';
import { useRouter } from 'next/router';
import { NavItem } from 'ts/nav-item';
import { useScrollNavigation } from 'src/lib/contexts/ScrollNavigationContext';
import { useSession } from 'next-auth/react';

const cx = classNames.bind(styles);

function getHeaderHeight(): number {
  if (typeof document === 'undefined') return 0;
  const provider = document.getElementsByClassName('scroll-navigation-provider')[0];
  if (!provider) return 0;
  const style = getComputedStyle(provider);
  const main = parseInt(style.getPropertyValue('--header-main-nav-height'), 10) || 0;
  const notifications = parseInt(style.getPropertyValue('--header-notifications-height'), 10) || 0;
  const jump = parseInt(style.getPropertyValue('--header-jump-to-height'), 10) || 0;
  return main + notifications + jump;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeEmail(value: unknown): string | null {
  if (!isNonEmptyString(value)) return null;
  const email = value.trim().toLowerCase();
  return email.length > 0 ? email : null;
}

const filterMenuItems = (subNavigationItems: SubNavItem[], groupEmails: string[]) => {
  const emailSet = new Set(groupEmails);

  const isVisible = (visibleBy: VisibleByEmail[]) => {
    if (!visibleBy || visibleBy.length === 0) return true;
    return visibleBy.some(
      (item: { email: { value: string } }) => item.email?.value && emailSet.has(item.email.value)
    );
  };

  const filterChildren = (children: SubNavItem[]): SubNavItem[] => {
    return children.reduce<SubNavItem[]>((acc, child) => {
      if (!isVisible(child.visibleBy.targetItems)) return acc;
      if (child.children?.results?.length > 0) {
        acc.push({
          ...child,
          children: { results: filterChildren(child.children.results as SubNavItem[]) },
        });
      } else {
        acc.push(child);
      }
      return acc;
    }, []);
  };

  return subNavigationItems.reduce<SubNavItem[]>((acc, record) => {
    if (!isVisible(record.visibleBy.targetItems)) return acc;
    if (record.children?.results?.length > 0) {
      acc.push({
        ...record,
        children: { results: filterChildren(record.children.results as SubNavItem[]) },
      });
    } else {
      acc.push(record);
    }
    return acc;
  }, []);
};

const SubNavigation = (props: SubNavigationProps): JSX.Element | null => {
  const { data: session } = useSession();
  const { subNavigationData } = props;
  const router = useRouter();
  const { showMainNav } = useScrollNavigation();
  const [headerHeight, setHeaderHeight] = useState(0);

  const data = subNavigationData ?? props.fields?.data;

  const datasource = data?.current?.subNavigation?.targetItem
    ? data.current.subNavigation.targetItem
    : data?.matches?.ancestors?.find((ancestor) => ancestor.subNavigation)?.subNavigation
        ?.targetItem;

  let navItems = datasource?.children.results || [];

  const userGroupEmails = (session?.googleGroups ?? [])
    .map((g) => normalizeEmail(g.email))
    .filter((e): e is string => Boolean(e));

  navItems = filterMenuItems(navItems, userGroupEmails);

  const isMobile = useMediaQuery(MediaQueryConstants.Tablet);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mobileList, setMobileList] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const subNavRef = useRef<HTMLElement | null>(null);
  const originalTopRef = useRef<number | null>(null);
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  useEffect(() => {
    const measure = () => setHeaderHeight(getHeaderHeight());
    measure();
    const resizeObserver = new ResizeObserver(measure);
    const header = document.getElementsByClassName('global-header')[0];
    const notifications = document.getElementsByClassName('global-notification-banner')[0];
    const jumpTo = document.getElementsByClassName('jump-to-links')[0];
    if (header) {
      resizeObserver.observe(header);
    }
    if (notifications) {
      resizeObserver.observe(notifications);
    }
    if (jumpTo) {
      resizeObserver.observe(jumpTo);
    }
    window.addEventListener('resize', measure);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    const measureOriginalTop = () => {
      if (!subNavRef.current) return;

      originalTopRef.current = subNavRef.current.getBoundingClientRect().top + window.scrollY;
    };

    const onScroll = () => {
      if (isPageEditing || originalTopRef.current === null) {
        setIsSticky(false);
        return;
      }

      const hasReachedOriginalPosition = window.scrollY >= originalTopRef.current;
      const hasPassedMinimumScroll = window.scrollY > 80;

      setIsSticky(hasReachedOriginalPosition && hasPassedMinimumScroll);
    };

    measureOriginalTop();
    onScroll();

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', measureOriginalTop);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measureOriginalTop);
    };
  }, [isPageEditing]);

  // Reset dropdown state on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setOpenIndex(null);
      setMobileList(false);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('routeChangeError', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('routeChangeError', handleRouteChange);
    };

    // Empty dependency array - only run once on mount. Do not replace with router.events as lint suggests, will cause endless page refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (datasource === null || navItems.length === 0) {
    return null;
  }

  const handleMobileToggle = () => {
    setMobileList(!mobileList);
  };

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const handleMouseEnter = (index: number) => {
    setOpenIndex(index);
  };

  const handleMouseLeave = () => {
    setOpenIndex(null);
  };

  const handleMobileLinkClick = () => {
    setOpenIndex(null);
    setMobileList(false);
  };

  const eventHandlers3 = isMobile
    ? { onClick: handleMobileLinkClick }
    : { onMouseEnter: () => handleMouseLeave() };

  const renderSubNavItem = (item: SubNavItem, index: number) => {
    const isDropdown = item.dropdownLabel?.jsonValue?.value && item.children?.results?.length > 0;
    const isMenuItem = item.menuItem?.jsonValue;
    const isOpen = openIndex === index;

    if (isDropdown) {
      const subItemCount = item.children.results.length;

      return (
        <div
          key={index}
          className={cx('sub-navigation__item-wrapper', 'sub-navigation__item--with-dropdown', {
            'is-open': isOpen,
          })}
          onMouseEnter={!isMobile ? () => handleMouseEnter(index) : undefined}
          onMouseLeave={!isMobile ? handleMouseLeave : undefined}
          onClick={isMobile ? () => handleToggle(index) : undefined}
        >
          <div
            className={cx(
              'sub-navigation__item',
              'sub-navigation__item--no-link',
              'flex gap-2 items-center'
            )}
          >
            <Text field={item.dropdownLabel.jsonValue} tag="span" className="" editable={false} />
            {isOpen ? <MaterialIcon name="ExpandLess" /> : <MaterialIcon name="ExpandMore" />}
          </div>
          {isOpen && (
            <div
              className={cx('sub-navigation__item-sub-menu', {
                'sub-navigation__item-sub-menu--scroll': subItemCount > 8,
              })}
            >
              {item.children.results.map((childItem: NavItem, childIndex: number) => (
                <Link
                  key={childIndex}
                  field={childItem.menuItem.jsonValue}
                  className="block px-4 py-2"
                  editable={false}
                  onClick={handleMobileLinkClick}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    if (isMenuItem) {
      return (
        <Link
          key={index}
          field={item.menuItem.jsonValue}
          className={cx('sub-navigation__item', 'sub-navigation__item--with-link')}
          editable={false}
          {...eventHandlers3}
        >
          <span>{item.menuItem.jsonValue.value.text}</span>
        </Link>
      );
    }

    return null;
  };

  return (
    <nav
      ref={subNavRef}
      className={`${cx('sub-navigation', 'component', {
        'sub-navigation--sticky': isSticky,
        'fixed left-0 right-0': isSticky,
        relative: !isSticky,
        'sub-navigation--open-mobile': mobileList,
        'sub-navigation--closed-mobile': !mobileList,
      })} sub-navigation`}
      style={isSticky ? { top: showMainNav ? headerHeight : 0 } : undefined}
    >
      <div
        className={cx(
          'sub-navigation__container',
          'container flex flex-col lg:flex-row justify-between lg:gap-16'
        )}
      >
        <div className="flex lg:hidden items-center mx-[-16px] lg:mx-[0] pr-[16px] lg:pr-[0] bg-brand-gray-100 border-b border-b-brand-gray-300 lg:border-b-0 lg:bg-transparent">
          {datasource?.sectionNameLink && (
            <>
              <Link
                className={cx(
                  'sub-navigation__item',
                  'sub-navigation__item--section-title',
                  'hidden lg:flex'
                )}
                field={datasource.sectionNameLink.jsonValue}
                editable={false}
              />
              <span
                className="cursor-pointer flex lg:hidden px-[16px] py-[20px] items-center justify-between w-full font-whitney-semibold"
                onClick={() => handleMobileToggle()}
              >
                {datasource.sectionNameLink.jsonValue.value.text}
                <MaterialIcon name={mobileList ? 'ExpandLess' : 'ExpandMore'} className="ml-2" />
              </span>
            </>
          )}
        </div>
        <div
          className={cx(
            'sub-navigation__list-container',
            'flex flex-col lg:flex-row lg:gap-8 flex-1 transition-all duration-200',
            isMobile && !mobileList ? 'hidden mb-0' : 'flex'
          )}
        >
          <div className="hidden lg:flex">
            {datasource?.sectionNameLink && (
              <>
                <Link
                  className={cx(
                    'sub-navigation__item',
                    'sub-navigation__item--section-title',
                    'hidden lg:flex'
                  )}
                  field={datasource.sectionNameLink.jsonValue}
                  editable={false}
                />
                <span
                  className="cursor-pointer flex lg:hidden px-[16px] py-[20px] items-center justify-between w-full font-whitney-semibold"
                  onClick={() => handleMobileToggle()}
                >
                  {datasource.sectionNameLink.jsonValue.value.text}
                  <MaterialIcon name={mobileList ? 'ExpandLess' : 'ExpandMore'} className="ml-2" />
                </span>
              </>
            )}
          </div>
          {isMobile && datasource?.sectionNameLink && (
            <Link
              field={datasource.sectionNameLink.jsonValue}
              className={cx('sub-navigation__item', 'sub-navigation__item--with-link')}
              editable={false}
              onClick={handleMobileLinkClick}
            >
              <span>{datasource.sectionNameLink.jsonValue.value.text}</span>
            </Link>
          )}

          {/* Render regular nav items */}
          {navItems.map((item, index) => renderSubNavItem(item, index))}
        </div>
      </div>
    </nav>
  );
};

export const getComponentServerProps: GetComponentServerProps = async (
  _rendering: ComponentRendering,
  layoutData: LayoutServiceData
) => {
  const graphQLClientFactory = createGraphQLClientFactory({ api: scConfig.api });
  const graphQLClient = graphQLClientFactory();
  const language = layoutData.sitecore.context.language || 'en';
  const contextItem = layoutData.sitecore.route?.itemId || '';

  const response = await graphQLClient.request<SubNavigationGraphQLResponse>(SubNavigation_GQL, {
    contextItem,
    language,
  });

  return { subNavigationData: response };
};

export default compose<SubNavigationProps>(withStyles())(SubNavigation);
