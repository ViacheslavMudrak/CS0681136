import type { Meta, StoryObj } from '@storybook/react';
import AccountTabNavigation from './AccountTabNavigation';
import type { AccountTabNavigationProps } from './AccountTabNavigation.types';

const meta: Meta<typeof AccountTabNavigation> = {
  title: 'Components/AccountTabNavigation',
  component: AccountTabNavigation,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AccountTabNavigation>;

const mockProps: AccountTabNavigationProps = {
  rendering: {
    componentName: 'AccountTabNavigation',
    uid: 'account-tab-navigation',
    dataSource: 'Empty',
    params: {},
  },
  params: {},
  stylesSXA: '',
  fields: {
    profileTabLabel: { jsonValue: { value: 'Profile' } },
    collaborationTabLabel: { jsonValue: { value: 'Collaboration Sites' } },
    settingsTabLabel: { jsonValue: { value: 'Settings' } },
    myNewsPreferenceSettings: {
      newsPrefsSectionHeading: { jsonValue: { value: 'My News Preferences' } },
      newsHomeSiteLabel: { jsonValue: { value: 'Homepage News' } },
      newsHomeSiteDescription: {
        jsonValue: { value: 'Customize the top of your homepage by selecting a topic.' },
      },
      newsHomeSiteChangeLinkText: { jsonValue: { value: 'Change Topic' } },
      newsHomeSiteUnknownChangeLinkText: { jsonValue: { value: 'Select Topics' } },
      newsSupplementalSitesLabel: { jsonValue: { value: 'My News Feeds' } },
      newsSupplementalSitesDescription: {
        jsonValue: {
          value:
            'Customize My News Feed by selecting one or more topics. These will be shown lower on your personalized homepage.',
        },
      },
      newsSupplementalSitesChangeLinkText: { jsonValue: { value: 'Change Topics' } },
      newsSupplementalSitesNoneChangeLinkText: { jsonValue: { value: 'Select Topics' } },
      maxSupplementalSites: { jsonValue: { value: 5 } },
    },
    myProfileSettings: {
      profileContentTitle: { jsonValue: { value: 'Contact & Role' } },
      profileTitle: { jsonValue: { value: 'Title' } },
      profileDepartment: { jsonValue: { value: 'Department' } },
      profileAssociateId: { jsonValue: { value: 'Associate Id' } },
      profileBusinessUnit: { jsonValue: { value: 'Business Unit' } },
      profileCompanyCode: { jsonValue: { value: 'Company Code' } },
      profileManager: { jsonValue: { value: 'Manager' } },
      profileEmail: { jsonValue: { value: 'Email' } },
      profileLocationTitle: { jsonValue: { value: 'Location' } },
      profileWorkplace: { jsonValue: { value: 'Workplace' } },
      profileCity: { jsonValue: { value: 'City' } },
      profileState: { jsonValue: { value: 'State' } },
    },
  },
};

export const Primary: Story = {
  args: mockProps,
};
