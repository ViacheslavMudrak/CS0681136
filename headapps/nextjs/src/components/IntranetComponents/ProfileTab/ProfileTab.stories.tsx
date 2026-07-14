import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ProfileTab from './ProfileTab';
import type { ProfileTabProps } from './ProfileTab.types';
import { GoogleProfileProvider } from 'lib/contexts/GoogleProfileContext';
import type { GoogleProfileData } from 'ts/google';

const mockProfile: GoogleProfileData = {
  id: 'mock-user-id',
  primaryEmail: 'debra.mogle@ascension-external.org',
  name: {
    displayName: 'Debra Mogle',
    givenName: 'Debra',
    familyName: 'Mogle',
  },
  organizations: [
    {
      name: 'Ascension',
      title: 'Medical Associate',
      department: 'Management Operations',
      location: 'IN - Indianapolis West - Offsite',
    },
  ],
  relations: [{ value: 'alex.hornak@ascension-external.org', type: 'manager' }],
  userInfo: {
    companyCode: 'Asc Tech',
    businessUnit: 0,
    businessUnitDescription: 'Ascension Technologies',
    employeeClass: '',
    employeeNumber: '12345678',
    isManager: 'false',
    managerLevel: 0,
    workLocationCode: '',
    city: 'Indianapolis',
    state: 'IN',
  },
};

const meta: Meta<typeof ProfileTab> = {
  title: 'Components/ProfileTab',
  component: ProfileTab,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <GoogleProfileProvider profile={mockProfile}>
        <Story />
      </GoogleProfileProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ProfileTab>;

const mockProps: ProfileTabProps = {
  rendering: {
    componentName: 'ProfileTab',
    uid: 'profile-tab',
    dataSource: 'Empty',
    params: {},
  },
  params: {},
  stylesSXA: '',
  fields: {
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
};

export const Primary: Story = {
  args: mockProps,
};
