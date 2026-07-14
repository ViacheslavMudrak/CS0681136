import { WidgetsProvider } from '@sitecore-search/react';
import type { Meta, StoryObj } from '@storybook/react';

import GlobalHeader from './GlobalHeader';

import type {
  GlobalHeaderFields,
  GlobalHeaderProps,
  PrimaryNavigation,
  SiteNavigationItem,
} from './GlobalHeader.types';
import { I18nProvider } from 'next-localization';

const createMockColumnLinks = (sequence: number, depth: number): SiteNavigationItem[] => {
  const columnData: SiteNavigationItem[] = [];
  for (let i = 1; i <= depth; i++) {
    columnData.push({
      id: `link-${sequence}-${i}`,
      name: `SubLink ${sequence}.${i}`,
      menuItem: {
        jsonValue: {
          value: {
            text: `SubLink ${sequence}.${i}`,
            linktype: 'internal',
            href: '/Home',
          },
        },
      },
      visibleBy: { targetItems: [] },
    });
  }
  return columnData;
};

const createMockSecondaryNavigation = (
  navigationLabel: string,
  depth: number,
  hasColumn2Data: boolean,
  hasColumn3Data: boolean
) => ({
  navigationLabel: {
    jsonValue: { value: navigationLabel },
  },
  visibleBy: { targetItems: [] },
  column1: {
    targetItems: createMockColumnLinks(1, depth),
  },
  column2: {
    targetItems: hasColumn2Data ? createMockColumnLinks(2, depth) : [],
  },
  column3: {
    targetItems: hasColumn3Data ? createMockColumnLinks(3, depth) : [],
  },
});

type mockSecondaryNavParameter = {
  navigationLabel: string;
  depth: number;
  hasColumn2Data: boolean;
  hasColumn3Data: boolean;
};

const createMockPrimaryNavigation = (
  navigationLabel: string,
  sencondaryNavs: mockSecondaryNavParameter[]
) => {
  const primaryNavigation: PrimaryNavigation = {
    _type: 'PrimaryNavigation',
    navigationLabel: {
      jsonValue: { value: navigationLabel },
    },
    children: {
      results: [],
    },
  };
  sencondaryNavs.forEach((navigation) => {
    primaryNavigation.children.results.push(
      createMockSecondaryNavigation(
        navigation.navigationLabel,
        navigation.depth,
        navigation.hasColumn2Data,
        navigation.hasColumn3Data
      )
    );
  });
  return primaryNavigation;
};

const mockedPrimaryNavigations: PrimaryNavigation[] = [
  createMockPrimaryNavigation('Tasks', [
    {
      navigationLabel: 'Time & Schedule',
      depth: 6,
      hasColumn2Data: true,
      hasColumn3Data: false,
    },
    {
      navigationLabel: 'Pay & Benefits',
      depth: 4,
      hasColumn2Data: false,
      hasColumn3Data: false,
    },
    {
      navigationLabel: 'Learning & Development',
      depth: 4,
      hasColumn2Data: false,
      hasColumn3Data: false,
    },
    {
      navigationLabel: 'Tech Support',
      depth: 6,
      hasColumn2Data: false,
      hasColumn3Data: false,
    },
    {
      navigationLabel: 'People Leader Tasks',
      depth: 6,
      hasColumn2Data: false,
      hasColumn3Data: false,
    },
  ]),
  createMockPrimaryNavigation('Resources', [
    {
      navigationLabel: 'Associate Resources',
      depth: 6,
      hasColumn2Data: true,
      hasColumn3Data: false,
    },
    {
      navigationLabel: 'People Leader Resources',
      depth: 4,
      hasColumn2Data: false,
      hasColumn3Data: false,
    },
  ]),
  createMockPrimaryNavigation('Clinical', [
    {
      navigationLabel: '',
      depth: 6,
      hasColumn2Data: true,
      hasColumn3Data: true,
    },
  ]),
  createMockPrimaryNavigation('Ministry Markets', [
    {
      navigationLabel: 'Ministry Markets',
      depth: 6,
      hasColumn2Data: true,
      hasColumn3Data: false,
    },
    {
      navigationLabel: 'My Ministry: Tennesee',
      depth: 4,
      hasColumn2Data: false,
      hasColumn3Data: false,
    },
  ]),
  createMockPrimaryNavigation('About Ascension', [
    {
      navigationLabel: 'About',
      depth: 4,
      hasColumn2Data: false,
      hasColumn3Data: false,
    },
    {
      navigationLabel: 'Departments',
      depth: 6,
      hasColumn2Data: true,
      hasColumn3Data: false,
    },
  ]),
];

const mockFields: GlobalHeaderFields = {
  data: {
    datasource: {
      headerImage: {
        jsonValue: {
          value: {
            src: '/images/ascension-header-logo.svg',
            alt: 'Sample Logo',
          },
        },
      },
      headerText: {
        jsonValue: { value: 'Ascension' },
      },
      actionItemsIcon: {
        jsonValue: { value: 'Checklist' },
      },
      notificationsIcon: {
        jsonValue: { value: 'NotificationsActive' },
      },
      favoritesIcon: {
        jsonValue: { value: 'FavoriteBorder' },
      },
      searchIcon: {
        jsonValue: { value: 'Search' },
      },
      headerLink: {
        jsonValue: {
          value: {
            text: 'Home',
            linktype: 'internal',
            title: '',
            target: '_blank',
            href: '/',
          },
        },
      },
      accountMenuTitle: {
        jsonValue: { value: 'Account' },
      },
      accountMenuAssociateIDLabel: {
        jsonValue: { value: 'Associate ID' },
      },
      browseAllApplicationsLink: {
        jsonValue: {
          value: {
            text: 'Browse All Applications',
            linktype: 'internal',
            title: '',
            target: '',
            href: '/applications',
          },
        },
      },
      children: {
        results: mockedPrimaryNavigations,
      },
    },
  },
};

// Mock dictionary
const dictionary = {
  GlobalHeaderEditModeMessageNoDatasourceFound:
    'Please select a Global Header from the top-level site item Global Header field.',
  FavoritesMenuHeader: 'My Favorites',
  EditFolderHeader: 'Edit Folder',
  EditFolderContent: 'Folder Name',
  EditFolderCancel: 'Cancel',
  EditFolderSave: 'Save Changes',
  DeleteFolderCancel: 'Cancel',
  DeleteFolderSave: 'Yes, Delete',
  DeleteFolderContent: 'Are you sure you want to delete this folder and all items in it?',
  DeleteLinkCancel: 'Cancel',
  DeleteLinkSave: 'Yes, Remove',
  DeleteLinkContent: 'Are you sure you want to remove this page from your favorites list?',
  CreateFolderHeader: 'Create Folder',
  CreateFolderContent: 'Folder Name',
  CreateFolderCancel: 'Cancel',
  CreateFolderSave: 'Save Changes',
  AddFavoriteHeader: 'Add a Favorite',
  AddFavoriteCancel: 'Cancel',
  AddFavoriteSave: 'Save',
  AddFavoriteButtonText: 'Add',
  NewFolderButtonText: 'New Folder',
  AddFavoriteTab1: 'Current Page',
  AddFavoriteTab2: 'Recommended',
  AddFavoriteTab3: 'Custom',
  FavoritesMenuFooterButtonText: 'Favorite this page',
  NotificationMenuHeader: 'Notifications',
  NotificationMenuFooterButtonText: 'View All Notifications',
  ActionItemsMenuHeader: 'Action Items',
  ActionItemMenuNoItemsText: 'No additional action items',
  AccountMenuHeader: 'Account',
};

const meta: Meta<GlobalHeaderProps> = {
  title: 'Components/GlobalHeader',
  component: GlobalHeader,
  tags: ['autodocs'],
  parameters: {},
  decorators: [
    (Story) => (
      <I18nProvider lngDict={dictionary} locale="en">
        <WidgetsProvider
          env="prod"
          customerKey={process.env.NEXT_PUBLIC_SITECORE_SEARCH_CUSTOMER_KEY}
          serviceHost="https://api.rfksrv.com"
          apiKey={process.env.NEXT_PUBLIC_SITECORE_SEARCH_API_KEY}
        >
          <Story />
        </WidgetsProvider>
      </I18nProvider>
    ),
  ],
  args: {
    fields: mockFields,
    rendering: {
      componentName: 'GlobalHeader',
      dataSource: 'mock',
      params: {},
    },
    stylesSXA: '',
  },
};

export default meta;

type Story = StoryObj<GlobalHeaderProps>;

export const Default: Story = {};
