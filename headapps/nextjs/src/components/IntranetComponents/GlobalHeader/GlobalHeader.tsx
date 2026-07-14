import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import GlobalSearchBarWidget from 'components/search/widgets/GlobalSearchBar';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { useGlobalHeaderStore } from 'lib/zustand/globalheaderstore';
import { useSession } from 'next-auth/react';
import { useI18n } from 'next-localization';
import { useRouter } from 'next/router';
import { JSX, useState, useEffect, useCallback, useMemo } from 'react';
import React from 'react';
import scConfig from 'sitecore.config';
import { MediaQueryConstants } from 'src/util/const/material';

import {
  ComponentRendering,
  GetComponentServerProps,
  Image,
  LayoutServiceData,
  Text,
  Link,
  withDatasourceCheck,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { createGraphQLClientFactory } from '@sitecore-content-sdk/nextjs/client';
import { Avatar, IconButton, useMediaQuery } from '@mui/material';

import { GlobalHeaderAccountMenu } from './AccountMenu/AccountMenu.types';
import AccountMenu from './AccountMenu/AccountMenu';
import FavoritesMenu from './FavoritesMenu/FavoritesMenu';
import { GlobalHeader_GQL } from './GlobalHeader.graphql';
import styles from './GlobalHeader.module.scss';
import {
  GlobalHeaderGraphQLResponse,
  GlobalHeaderProps,
  GlobalHeaderStatics,
  PrimaryNavigation,
  SiteNavigationItem,
  VisibleByItem,
} from './GlobalHeader.types';
import { brandBlue } from 'src/theme/shared/src/lib/colors';

const cx = classNames.bind(styles);

/* IE-1586 - Suggested changes to comment this code, preserved for future use  
 type NotificationItem = {
   id: string;
   title: string;
   description: string;
   timeLabel: string;
   url: string;
   isRead?: boolean;
 };

 const mockNotifications: NotificationItem[] = [
   {
     id: 'notif-1',
     title: 'Nursing & Clinical',
     description: 'Content updated',
     url: 'https:www.google.com',
     timeLabel: 'just now',
     isRead: false,
   },
   {
     id: 'notif-2',
     title: 'Nursing & Clinical',
     description: 'New document added',
     url: 'https:www.google.com',
     timeLabel: '2 hours ago',
     isRead: false,
   },
   {
     id: 'notif-3',
     title: 'Nursing & Clinical',
     description: 'Policy changes published',
     url: 'https:www.google.com',
     timeLabel: '5 days ago',
     isRead: true,
   },
   {
     id: 'notif-4',
     title: 'Nursing & Clinical',
     description: 'Policy changes published',
     url: 'https:www.google.com',
     timeLabel: '1 week ago',
     isRead: true,
   },
 ];
*/

const GlobalHeader = (props: GlobalHeaderProps): JSX.Element => {
  const { datasource, rendering } = props;
  const router = useRouter();
  const navigationLinks = datasource?.children.results.filter(
    (r) => r._type === 'GlobalHeaderPrimaryNavigation'
  ) as PrimaryNavigation[];

  const globalHeaderAccountMenu = datasource?.children.results.filter(
    (r) => r._type === 'GlobalHeaderAccountMenu'
  )[0] as GlobalHeaderAccountMenu;

  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing;

  const { data: session, status: sessionStatus } = useSession();
  const groups = session?.googleGroups;

  const showRecentSuggestions = rendering.params?.displayRecentSearches === '1';
  const showTrendingSuggestions = rendering.params?.displayTrendingSearches === '1';

  const { t } = useI18n();
  const noDatasourceMessage =
    t('GlobalHeaderEditModeMessageNoDatasourceFound') || GlobalHeaderStatics.noDatasourceMessage;

  /* IE-1586 - Suggested changes to comment this code, preserved for future use  
    const actionItemsMenuHeader =
    t('ActionItemsMenuHeader') || GlobalHeaderStatics.actionItemsMenuHeader;
    const actionItemMenuNoItemsText =
    t('ActionItemMenuNoItemsText') || GlobalHeaderStatics.actionItemMenuNoItemsText;
    const notificationMenuHeader =
    t('NotificationMenuHeader') || GlobalHeaderStatics.notificationMenuHeader;
    const notificationMenuFooterButtonText =
    t('NotificationMenuFooterButtonText') || GlobalHeaderStatics.notificationMenuFooterButtonText;
  */
  const accountMenuHeader = t('AccountMenuHeader') || GlobalHeaderStatics.accountMenuHeader;

  const isMobile = useMediaQuery(MediaQueryConstants.Mobile, { noSsr: true });
  const [actionsMenu, setActionsMenu] = useState(false);
  const [notificationsMenu, setNotificationsMenu] = useState(false);
  const [accountMenu, setAccountMenu] = useState(false);
  const [favoritesMenu, setFavoritesMenu] = useState(false);
  const [hamburgerMenu, setHamburgerMenu] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string>('');

  useEffect(() => {
    router.prefetch('/search');
  }, [router]);

  useEffect(() => {
    if (session?.googleProfile?.photos?.[0]?.url) {
      setUserPhotoUrl(session.googleProfile.photos[0].url);
    }
  }, [session?.googleProfile]);

  // Sync Zustand store → local state so external components (e.g., DirectoryEntryListing)
  // can open the favorites menu via openFavoritesMenu().
  const { favoritesMenuOpen, closeFavoritesMenu } = useGlobalHeaderStore();
  useEffect(() => {
    if (favoritesMenuOpen) {
      setFavoritesMenu(true);
      closeFavoritesMenu();
    }
  }, [favoritesMenuOpen, closeFavoritesMenu]);

  useEffect(() => {
    if (favoritesMenu) {
      setActionsMenu(false);
      setNotificationsMenu(false);
      setAccountMenu(false);
    }
  }, [favoritesMenu]);

  /* IE-1586 - Suggested changes to comment this code, preserved for future use 
  // Actions menu toggle
  const handleActionsMenu = () => {
    setActionsMenu(!actionsMenu);
  };
  // Notifications menu toggle
  const handleNotificationsMenu = () => {
    setNotificationsMenu((prev) => {
      const next = !prev;
      return next;
    });
  }; */

  // Favorites menu toggle
  const handleFavoritesMenu = () => {
    setFavoritesMenu(!favoritesMenu);
  };

  // Employee menu toggle
  const handleAccountMenu = () => {
    setAccountMenu(!accountMenu);
  };

  const handleHamburgerMenu = () => {
    setHamburgerMenu(!hamburgerMenu);
  };

  const handleCloseMenu = useCallback(() => {
    setFavoritesMenu(false);
    setActionsMenu(false);
    setNotificationsMenu(false);
    setAccountMenu(false);
    setHamburgerMenu(false);
    setOpenSubmenu(null);
    setIsMobileSearchOpen(false);
  }, []);

  /* IE-1586 - Suggested changes to comment this code, preserved for future use  
     const handleMobileUtilityArrow = () => {
      setActionsMenu(false);
      setNotificationsMenu(false);
      setFavoritesMenu(false);
      setAccountMenu(false);
   };
   */

  // Closes all the menus on resize, so nothing is left open if browser goes to mobile
  useEffect(() => {
    const closeMenusOnResize = () => {
      handleCloseMenu();
    };

    window.addEventListener('resize', closeMenusOnResize);
    return () => window.removeEventListener('resize', closeMenusOnResize);
  }, [handleCloseMenu]);

  useEffect(() => {
    const shouldLockBody = hamburgerMenu;

    const shouldFreezeHeader = notificationsMenu || actionsMenu || favoritesMenu || accountMenu;

    document.body.classList.toggle('no-scroll', shouldLockBody);
    document.body.classList.toggle('global-header-menu-open', shouldFreezeHeader);

    return () => {
      document.body.classList.remove('no-scroll');
      document.body.classList.remove('global-header-menu-open');
    };
  }, [hamburgerMenu, notificationsMenu, actionsMenu, favoritesMenu, accountMenu]);

  const isUtilityPanelOpen = favoritesMenu || accountMenu || notificationsMenu || actionsMenu;

  const userGroupEmails = useMemo(
    () =>
      new Set(
        (groups ?? [])
          .map((g) => g.email?.toLowerCase().trim())
          .filter((e): e is string => Boolean(e))
      ),
    [groups]
  );

  const isVisibleToUser = useCallback(
    (visibleByItems: VisibleByItem[] | undefined): boolean => {
      if (isEditing) return true;
      if (!visibleByItems || visibleByItems.length === 0) return true;
      if (sessionStatus !== 'authenticated') return false;
      if (userGroupEmails.size === 0) return false;
      return visibleByItems.some((item) => {
        const allowedEmail = item.email?.jsonValue?.value?.toLowerCase().trim();
        return Boolean(allowedEmail) && userGroupEmails.has(allowedEmail as string);
      });
    },
    [isEditing, sessionStatus, userGroupEmails]
  );

  const renderColumnLinks = (items: SiteNavigationItem[]) => {
    const visibleItems = items.filter((link) => isVisibleToUser(link?.visibleBy?.targetItems));
    if (visibleItems.length === 0) return null;
    return (
      <div className={cx('flex flex-col md:gap-4')}>
        {visibleItems.map((link, key) => (
          <Link field={link?.menuItem?.jsonValue} key={key} />
        ))}
      </div>
    );
  };

  const getSecondaryLinks = (primaryNav: PrimaryNavigation) => {
    const visibleSecondaryNavs = primaryNav?.children?.results?.filter((item) =>
      isVisibleToUser(item?.visibleBy?.targetItems)
    );

    const subNavigations =
      primaryNav && primaryNav?.children && visibleSecondaryNavs?.length > 0 ? (
        <>
          <div className={cx('global-header__submenu-mobile', 'flex md:hidden justify-between')}>
            <div
              className={cx('global-header__submenu-mobile-header', 'flex gap-2')}
              onClick={() => setOpenSubmenu(null)}
            >
              <MaterialIcon name="ChevronLeft" />
              <span>{primaryNav?.navigationLabel?.jsonValue?.value}</span>
            </div>
            <div className={cx('global-header__close-menu', '')} onClick={handleCloseMenu}>
              <MaterialIcon name="Close" />
            </div>
          </div>
          <div className={cx('global-header__mobile-nav-link-scroll', 'flex gap-4 lg:gap-10')}>
            {visibleSecondaryNavs.map((item, index) => {
              const col2Items = item?.column2?.targetItems ?? [];
              const col3Items = item?.column3?.targetItems ?? [];
              const navigationClassName =
                col2Items.length > 0
                  ? col3Items.length > 0
                    ? 'md:grid grid-col-3 md:[grid-template-columns:repeat(3,minmax(130px,200px))] lg:[grid-template-columns:repeat(3,minmax(130px,200px))] xl:[grid-template-columns:repeat(3,minmax(200px,200px))] grid-flow-col justify-start md:justify-between'
                    : 'md:grid grid-col-2 md:[grid-template-columns:repeat(2,minmax(130px,300px))] lg:[grid-template-columns:repeat(2,minmax(160px,300px))] xl:[grid-template-columns:repeat(2,minmax(200px,300px))] grid-flow-col'
                  : 'md:grid md:[grid-template-columns:repeat(1,minmax(130px,300px))] lg:[grid-template-columns:repeat(1,minmax(160px,300px))] xl:[grid-template-columns:repeat(1,minmax(200px,300px))] grid-flow-col';
              return (
                <React.Fragment key={index}>
                  <div
                    className={cx(
                      'global-header__submenu-col',
                      'flex flex-col flex-[1_1_20%] gap-4'
                    )}
                  >
                    <span className={cx('global-header__submenu-header', '')}>
                      {item?.navigationLabel?.jsonValue?.value}
                    </span>
                    <div
                      className={cx(
                        'global-header__submenu-col-links-container flex flex-col md:gap-4',
                        navigationClassName,
                        ''
                      )}
                    >
                      {renderColumnLinks(item?.column1?.targetItems ?? [])}
                      {renderColumnLinks(item?.column2?.targetItems ?? [])}
                      {renderColumnLinks(item?.column3?.targetItems ?? [])}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </>
      ) : (
        <></>
      );
    return subNavigations;
  };

  if (isEditing && !datasource) {
    return (
      <>
        <p>{noDatasourceMessage}</p>
      </>
    );
  }

  if (!datasource) return <></>;

  return (
    <div className={`${cx('global-header', '')} global-header`}>
      {isUtilityPanelOpen && (
        <div
          className={cx('global-header__overlay', {
            'global-header__overlay--visible': isUtilityPanelOpen,
          })}
          onClick={handleCloseMenu}
        />
      )}
      <div
        className={cx(
          'global-header__container',
          'component container flex md:justify-between items-center gap-2 md:gap-4',
          props.stylesSXA
        )}
        id={rendering.params?.RenderingIdentifier}
      >
        <div
          className={cx('global-header__hamburger-menu', 'flex md:hidden')}
          onClick={handleHamburgerMenu}
        >
          <MaterialIcon name="Menu" />
        </div>
        <Link
          field={datasource?.headerLink?.jsonValue}
          className={cx('global-header__logo', 'flex gap-4 items-center')}
        >
          <Image field={datasource?.headerImage?.jsonValue} />
          <Text className="hidden md:flex" field={datasource?.headerText?.jsonValue} tag="span" />
        </Link>
        <div
          className={cx(
            'global-header__search',
            isMobileSearchOpen && 'global-header__search--mobile-search'
          )}
        >
          {!isMobileSearchOpen && (
            <button
              className={cx('global-header__mobile-search-icon-button')}
              onClick={() => setIsMobileSearchOpen(true)}
            >
              <MaterialIcon name="SearchOutlined" />
            </button>
          )}
          <div
            className={cx(
              'global-header__mobile-search',
              isMobileSearchOpen && 'show-mobile-search'
            )}
          >
            <GlobalSearchBarWidget
              defaultItemsPerPage={5}
              rfkId={'global_search_ps'}
              placeholder="Search for policies, news, benefits..."
              itemRedirectionHandler={(article) => {
                // Redirect to /query with the article name/title as the search term
                const searchTerm = article.name || article.title || '';
                if (searchTerm) {
                  router.push(article.url || `/search?q=${encodeURIComponent(searchTerm)}`);
                }
              }}
              submitRedirectionHandler={(query, filterParams) => {
                if (query) {
                  const url = `/search?q=${encodeURIComponent(query)}${filterParams ? `&${filterParams}` : ''}`;
                  router.push(url);
                }
              }}
              showRecentSuggestions={showRecentSuggestions}
              showTrendingSuggestions={showTrendingSuggestions}
              showSearchWithin={true}
            />
          </div>
        </div>
        <div className={cx('global-header__utilities', 'flex gap-4 md:relative items-center')}>
          {isMobileSearchOpen && (
            <button className={cx('global-header__mobile-search-close')} onClick={handleCloseMenu}>
              <MaterialIcon name="CloseOutline" />
            </button>
          )}

          {/* IE-1586 - Suggested changes to comment this code, preserved for future use  
          <div
            className={cx('global-header__actions-trigger', 'flex items-center')}
            onClick={handleActionsMenu}
          >
            <MaterialIcon
              name={
                datasource?.actionItemsIcon?.jsonValue?.value || GlobalHeaderStatics.actionItemsIcon
              }
            />
          </div>

          <div
            className={cx('global-header__action-menu', 'utility-menu', 'flex-col absolute', {
              'utility-menu-open': actionsMenu,
            })}
          >
            <div className={cx('global-header__menu-header', 'flex items-center justify-between')}>
              <div className="flex gap-2 items-center">
                <div
                  className={cx(
                    'global-header__utility-menu-back-arrow',
                    'utility-menu-back-arrow',
                    'flex items-center'
                  )}
                  onClick={handleMobileUtilityArrow}
                >
                  <MaterialIcon name="ChevronLeft" />
                </div>
                <MaterialIcon
                  name={
                    datasource?.actionItemsIcon?.jsonValue?.value ||
                    GlobalHeaderStatics.actionItemsIcon
                  }
                />
                <span>{actionItemsMenuHeader}</span>
                <span className={cx('global-header__action-item-number', 'action-item-number', '')}>
                  4
                </span>
              </div>
              <div className={cx('global-header__close-menu', '')} onClick={handleCloseMenu}>
                <MaterialIcon name="Close" />
              </div>
            </div>

            <div
              className={cx(
                'global-header__menu-item-container',
                'actions-item-container',
                'flex flex-col gap-4 mt-4'
              )}
            >
              <div
                className={cx(
                  'global-header__action-item',
                  'global-header__action-item--danger',
                  'flex flex-col gap-2'
                )}
              >
                <span className={cx('global-header__action-item-header', '')}>
                  Complete Post Hire Compliance training
                </span>
                <div className="flex gap-2 items-center">
                  <MaterialIcon name="PriorityHigh" />
                  <span className={cx('global-header__action-item-due', 'action-item-due', '')}>
                    4 Days Left
                  </span>
                </div>
              </div>
              <div
                className={cx(
                  'global-header__action-item',
                  'global-header__action-item--warning',
                  'flex flex-col gap-2'
                )}
              >
                <span className={cx('global-header__action-item-header', '')}>
                  Complete Post Hire Compliance training
                </span>
                <div className="flex gap-2">
                  <span className={cx('global-header__action-item-due', 'action-item-due', '')}>
                    Due: 12/12/24
                  </span>
                </div>
              </div>
              <div className={cx('global-header__action-item', 'flex flex-col gap-2')}>
                <span className={cx('global-header__action-item-header', '')}>
                  Complete New Hire Benefites Enrollment
                </span>
                <div className="flex gap-2">
                  <span className={cx('global-header__action-item-due', 'action-item-due', '')}>
                    Due: 12/20/24
                  </span>
                </div>
              </div>
              <div className={cx('global-header__action-item', 'flex flex-col gap-2')}>
                <span className={cx('global-header__action-item-header', '')}>
                  Complete Post Hire Introduction to Ethics training
                </span>
                <div className="flex gap-2">
                  <span className={cx('global-header__action-item-due', 'action-item-due', '')}>
                    Due 12/20/24
                  </span>
                </div>
              </div>
              <div className={cx('global-header__action-item-footer', 'mt-4')}>
                <span className="w-full block mt-6 text-center">{actionItemMenuNoItemsText}</span>
              </div>
            </div>
          </div>
          <div
            className={cx('global-header__notifications-trigger', 'flex items-center')}
            onClick={handleNotificationsMenu}
          >
            <MaterialIcon
              name={
                datasource?.notificationsIcon?.jsonValue?.value ||
                GlobalHeaderStatics.notificationsIcon
              }
            />
          </div>
          <div
            className={cx('global-header__notification-menu', 'utility-menu', 'flex-col absolute', {
              'utility-menu-open': notificationsMenu,
            })}
          >
            <div className={cx('global-header__menu-header', 'flex items-center justify-between')}>
              <div className="flex gap-2 items-center">
                <MaterialIcon name="NotificationsActiveOutlined" />
                <span>{notificationMenuHeader}</span>
                <span
                  className={cx('global-header__notifications-mark-all', 'notifications-mark-all')}
                >
                  Mark all seen
                </span>
              </div>
              <div className={cx('global-header__close-menu', '')} onClick={handleCloseMenu}>
                <MaterialIcon name="Close" />
              </div>
            </div>
            <div className={cx('global-header__menu-item-container', 'flex flex-col gap-4 mt-4')}>
              {mockNotifications.map((notification) => {
                return (
                  <div
                    key={notification.id}
                    className={cx(
                      'global-header__notification-item',
                      'flex gap-2 justify-between',
                      notification.isRead && 'is-read'
                    )}
                  >
                    <a
                      href={notification.url}
                      className={cx(
                        'global-header__notification-trigger',
                        'flex w-full items-start'
                      )}
                    >
                      <span
                        className={cx(
                          'global-header__notification-text',
                          'flex flex-col flex-[0_0_60%]'
                        )}
                      >
                        <span className={cx('global-header__notifications-text-title', 'truncate')}>
                          {notification.title}
                        </span>
                        <span
                          className={cx(
                            'global-header__notifications-text-description',
                            'truncate'
                          )}
                        >
                          {notification.description}
                        </span>
                      </span>
                    </a>
                    <div className="flex gap-2 flex-[0_0_40%] justify-end">
                      <span className={cx('global-header__notification-time', 'flex')}>
                        {notification.timeLabel}
                      </span>
                      <div
                        className={cx(
                          'global-header__notification-mark-seen',
                          'flex justify-start items-start'
                        )}
                      >
                        <MaterialIcon name="CheckCircleOutlined" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              className={cx(
                'global-header__menu-footer',
                'global-header__menu-footer--notifications',
                'flex'
              )}
            >
              <button className={cx('global-header__notifications-footer-button', '')}>
                <span>{notificationMenuFooterButtonText}</span>
              </button>
            </div>
          </div>
          */}

          {/* Favorites */}
          <div
            className={cx('global-header__favorites-trigger', 'flex items-center')}
            onClick={handleFavoritesMenu}
          >
            <MaterialIcon
              name={
                datasource?.favoritesIcon?.jsonValue?.value || GlobalHeaderStatics.favoritesIcon
              }
            />
          </div>

          <FavoritesMenu
            isOpen={favoritesMenu}
            onClose={handleCloseMenu}
            browseAllApplicationsLink={datasource?.browseAllApplicationsLink?.jsonValue}
          />

          {/* ACCOUNT */}
          <IconButton
            onClick={handleAccountMenu}
            className={cx('global-header__account-avatar', '')}
          >
            <Avatar
              sx={{ backgroundColor: brandBlue[901] }}
              src={userPhotoUrl}
              alt="User profile"
              imgProps={{ referrerPolicy: 'no-referrer' }}
            />
          </IconButton>

          <AccountMenu
            isOpen={accountMenu}
            accountMenuHeader={accountMenuHeader}
            onClose={handleCloseMenu}
            globalHeaderAccountMenu={globalHeaderAccountMenu}
          />
        </div>
      </div>
      <div
        className={cx('global-header__main-navigation', 'flex flex-col w-full', {
          'hamburger-menu-open': hamburgerMenu,
        })}
      >
        <div
          className={cx(
            'global-header__mobile-menu-header',
            'flex md:hidden gap-4 justify-between w-full'
          )}
        >
          <span>Menu</span>
          <div className={cx('global-header__close-menu', '')} onClick={handleCloseMenu}>
            <MaterialIcon name="Close" />
          </div>
        </div>
        {/* This is the Main Navigation */}
        <div className={cx('global-header__main-navigation-wrapper', '')}>
          <nav
            className={cx(
              'global-header__main-navigation-list',
              'flex flex-col md:flex-row gap-8 md:justify-center'
            )}
          >
            <div
              className={cx(
                'global-header__main-navigation-container',
                'main-navigation-container',
                'container flex flex-col md:flex-row md:gap-8 justify-center'
              )}
              onMouseLeave={() => !isMobile && setOpenSubmenu(null)}
            >
              {navigationLinks &&
                navigationLinks.map((item, index) => (
                  <React.Fragment key={index}>
                    <div
                      className={cx('global-header__main-navigation-item')}
                      onMouseEnter={() => !isMobile && setOpenSubmenu(index)}
                      onClick={() =>
                        isMobile && setOpenSubmenu(openSubmenu === index ? null : index)
                      }
                    >
                      <span className="flex justify-betwee md:justify-start items-center">
                        {item?.navigationLabel?.jsonValue?.value}
                        <MaterialIcon name="ChevronRight" />
                      </span>
                    </div>
                    <div
                      className={cx(
                        'global-header__submenu-wrapper',
                        {
                          'is-open': isMobile && openSubmenu === index,
                        },
                        ''
                      )}
                    >
                      <div
                        className={cx(
                          'global-header__main-navigation-submenu',
                          'main-navigation-submenu',
                          { 'submenu-open': openSubmenu === index },
                          'flex flex-col md:flex-row gap-4 md:justify-center'
                        )}
                        onMouseLeave={() => !isMobile && setOpenSubmenu(null)}
                      >
                        {getSecondaryLinks(item)}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
            </div>
          </nav>
        </div>
        {/* End Main Navigation */}
        <div
          className={cx('global-header__mobile-menu-utilities', 'flex md:hidden flex-col w-full')}
        >
          {/* IE-1586 - Suggested changes to comment this code, preserved for future use  
            <div className="flex gap-2 items-center" onClick={handleActionsMenu}>
            <MaterialIcon
              name={
                datasource?.actionItemsIcon?.jsonValue?.value || GlobalHeaderStatics.actionItemsIcon
              }
            />
            <span>Action Items</span>
          </div>
          <div className="flex gap-2 items-center" onClick={handleNotificationsMenu}>
            <MaterialIcon
              name={
                datasource?.notificationsIcon?.jsonValue?.value ||
                GlobalHeaderStatics.notificationsIcon
              }
            />
            <span>Notifications</span>
          </div> */}
          <div className="flex gap-2 items-center" onClick={handleFavoritesMenu}>
            <MaterialIcon
              name={
                datasource?.favoritesIcon?.jsonValue?.value || GlobalHeaderStatics.favoritesIcon
              }
            />
            <span>Favorites</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getComponentServerProps: GetComponentServerProps = async (
  rendering: ComponentRendering,
  layoutData: LayoutServiceData
) => {
  const graphQLClientFactory = createGraphQLClientFactory({ api: scConfig.api });
  const graphQLClient = graphQLClientFactory();
  const language = layoutData.sitecore.context.language || 'en';

  const response = await graphQLClient.request<GlobalHeaderGraphQLResponse>(GlobalHeader_GQL, {
    datasource: rendering.dataSource,
    language,
  });

  return { datasource: response.datasource };
};

export default compose<GlobalHeaderProps>(withDatasourceCheck(), withStyles())(GlobalHeader);
