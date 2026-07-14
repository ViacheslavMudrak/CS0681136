import type { Meta, StoryObj } from '@storybook/react';
import AccountDetail from './AccountDetail';
import type { AccountDetailProps } from './AccountDetail.types';

const meta: Meta<typeof AccountDetail> = {
  title: 'Components/AccountDetail',
  component: AccountDetail,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AccountDetail>;

const mockProps: AccountDetailProps = {
  rendering: {
    componentName: 'AccountDetail',
    uid: 'account-detail',
    dataSource: 'Empty',
    params: {},
  },
  params: {},
  stylesSXA: '',
  fields: {
    data: {
      datasource: {
        fields: [
          { name: 'profileTabLabel', jsonValue: { value: 'Profile' } },
          { name: 'collaborationTabLabel', jsonValue: { value: 'Collaboration Sites' } },
          { name: 'settingsTabLabel', jsonValue: { value: 'Settings' } },
          { name: 'newsPrefsSectionHeading', jsonValue: { value: 'My News Preferences' } },
          { name: 'newsHomeSiteLabel', jsonValue: { value: 'Homepage News' } },
          {
            name: 'newsHomeSiteDescription',
            jsonValue: { value: 'Customize the top of your homepage by selecting a topic.' },
          },
          { name: 'newsHomeSiteChangeLinkText', jsonValue: { value: 'Change Topic' } },
          { name: 'newsHomeSiteUnknownChangeLinkText', jsonValue: { value: 'Select Topics' } },
          { name: 'newsSupplementalSitesLabel', jsonValue: { value: 'My News Feeds' } },
          {
            name: 'newsSupplementalSitesDescription',
            jsonValue: {
              value:
                'Customize My News Feed by selecting one or more topics. These will be shown lower on your personalized homepage.',
            },
          },
          { name: 'newsSupplementalSitesChangeLinkText', jsonValue: { value: 'Change Topic' } },
          {
            name: 'newsSupplementalSitesNoneChangeLinkText',
            jsonValue: { value: 'Select Topic' },
          },
          { name: 'maxSupplementalSites', jsonValue: { value: 5 } },
          { name: 'profileContentTitle', jsonValue: { value: 'Contact & Role' } },
          { name: 'profileTitle', jsonValue: { value: 'Title' } },
          { name: 'profileDepartment', jsonValue: { value: 'Department' } },
          { name: 'profileAssociateId', jsonValue: { value: 'Associate Id' } },
          { name: 'profileBusinessUnit', jsonValue: { value: 'Business Unit' } },
          { name: 'profileCompanyCode', jsonValue: { value: 'Company Code' } },
          { name: 'profileManager', jsonValue: { value: 'Manager' } },
          { name: 'profileEmail', jsonValue: { value: 'Email' } },
          { name: 'profileLocationTitle', jsonValue: { value: 'Location' } },
          { name: 'profileWorkplace', jsonValue: { value: 'Workplace' } },
          { name: 'profileCity', jsonValue: { value: 'City' } },
          { name: 'profileState', jsonValue: { value: 'State' } },
        ],
      },
    },
  },
};

export const Primary: Story = {
  args: mockProps,
};
