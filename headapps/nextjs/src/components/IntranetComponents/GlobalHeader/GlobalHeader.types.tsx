import { ComponentProps } from 'lib/component-props';
import { LinkField, Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { GlobalHeaderAccountMenu } from './AccountMenu/AccountMenu.types';

export type VisibleByItem = {
  id: string;
  name: string;
  email: {
    jsonValue: Field<string>;
  };
};

export type SiteNavigationItem = {
  id: string;
  name: string;
  menuItem: {
    jsonValue: LinkField;
  };
  visibleBy: {
    targetItems: VisibleByItem[];
  };
};

export type SecondaryNavigation = {
  navigationLabel: {
    jsonValue: Field<string>;
  };
  visibleBy: {
    targetItems: VisibleByItem[];
  };
  column1: {
    targetItems: SiteNavigationItem[];
  };
  column2: {
    targetItems: SiteNavigationItem[];
  };
  column3: {
    targetItems: SiteNavigationItem[];
  };
};

export type PrimaryNavigation = {
  _type: string;
  navigationLabel: {
    jsonValue: Field<string>;
  };
  children: {
    results: SecondaryNavigation[];
  };
};

export type GlobalHeaderDatasource = {
  headerImage: {
    jsonValue: ImageField;
  };
  headerText: {
    jsonValue: Field<string>;
  };
  actionItemsIcon: {
    jsonValue: Field<string>;
  };
  notificationsIcon: {
    jsonValue: Field<string>;
  };
  favoritesIcon: {
    jsonValue: Field<string>;
  };
  searchIcon: {
    jsonValue: Field<string>;
  };
  headerLink: {
    jsonValue: LinkField;
  };
  accountMenuTitle: {
    jsonValue: Field<string>;
  };
  accountMenuAssociateIDLabel: {
    jsonValue: Field<string>;
  };
  browseAllApplicationsLink: {
    jsonValue: LinkField;
  };
  children: {
    results: PrimaryNavigation[] | GlobalHeaderAccountMenu[];
  };
};

export type GlobalHeaderGraphQLResponse = {
  datasource: GlobalHeaderDatasource;
};

export type GlobalHeaderFields = {
  data: {
    datasource: GlobalHeaderDatasource;
  };
};

export type GlobalHeaderProps = ComponentProps & {
  fields: GlobalHeaderFields;
  datasource?: GlobalHeaderDatasource;
};

export const GlobalHeaderStatics = {
  noDatasourceMessage:
    'Please select a Global Header from the top-level site item Global Header field.',
  favoritesMenuHeader: 'My Favorites',
  addFavoriteButtonText: 'Add',
  newFolderButtonText: 'New Folder',
  favoritesMenuFooterButtonText: 'Favorite this page',
  notificationMenuHeader: 'Notifications',
  notificationMenuFooterButtonText: 'View All Notifications',
  actionItemsMenuHeader: 'Action Items',
  actionItemMenuNoItemsText: 'No additional action items',
  accountMenuHeader: 'Account',
  associateIdLabel: 'Associate Id',
  actionItemsIcon: 'Checklist',
  notificationsIcon: 'NotificationsActive',
  favoritesIcon: 'FavoriteBorder',
  searchIcon: 'Search',
  accountAvatar: {
    value: {
      src: '/images/sample-person-1.svg',
      alt: 'Sample Logo',
    },
  },
};
