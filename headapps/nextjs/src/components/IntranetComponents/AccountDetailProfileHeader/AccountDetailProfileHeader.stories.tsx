import type { Meta, StoryObj, Decorator } from '@storybook/nextjs-vite';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

import AccountDetailProfileHeader from './AccountDetailProfileHeader';
import type { AccountDetailProfileHeaderProps } from './AccountDetailProfileHeader.types';
import type { GoogleProfileData } from 'ts/google';

const baseProps: AccountDetailProfileHeaderProps = {
  rendering: {
    componentName: 'AccountDetailProfileHeader',
    uid: 'account-detail-profile-header',
    dataSource: 'Empty',
    params: {},
  },
  params: {},
  stylesSXA: '',
};

const createSessionDecorator = (googleProfile: GoogleProfileData): Decorator => {
  const session: Session = {
    user: { id: 'mock-user-id', name: 'Mock User', email: 'mock.user@example.com' },
    expires: '2099-01-01T00:00:00.000Z',
    googleProfile,
  };
  const SessionDecorator: Decorator = (Story) => (
    <SessionProvider session={session}>
      <Story />
    </SessionProvider>
  );
  (SessionDecorator as unknown as { displayName: string }).displayName = 'SessionDecorator';
  return SessionDecorator;
};

const buildProfile = (overrides: {
  firstName: string;
  lastName: string;
  title: string | null;
  department: string | null;
  photoUrl?: string | null;
}): GoogleProfileData => ({
  id: 'mock-user-id',
  name: {
    givenName: overrides.firstName,
    familyName: overrides.lastName,
    displayName: `${overrides.firstName} ${overrides.lastName}`.trim(),
  },
  photos: overrides.photoUrl ? [{ url: overrides.photoUrl }] : undefined,
  organizations: [
    {
      title: overrides.title ?? undefined,
      department: overrides.department ?? undefined,
    },
  ],
});

const meta: Meta<typeof AccountDetailProfileHeader> = {
  title: 'Components/AccountDetailProfileHeader',
  component: AccountDetailProfileHeader,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AccountDetailProfileHeader>;

export const Primary: Story = {
  args: baseProps,
  decorators: [
    createSessionDecorator(
      buildProfile({
        firstName: 'Debra',
        lastName: 'Mogle',
        title: 'Medical Associate',
        department: 'Management Operations',
      })
    ),
  ],
};

export const NoTitleOrDepartment: Story = {
  args: baseProps,
  decorators: [
    createSessionDecorator(
      buildProfile({
        firstName: 'John',
        lastName: 'Smith',
        title: null,
        department: null,
      })
    ),
  ],
};

export const TitleOnly: Story = {
  args: baseProps,
  decorators: [
    createSessionDecorator(
      buildProfile({
        firstName: 'Jane',
        lastName: 'Doe',
        title: 'Senior Analyst',
        department: null,
      })
    ),
  ],
};

export const DepartmentOnly: Story = {
  args: baseProps,
  decorators: [
    createSessionDecorator(
      buildProfile({
        firstName: 'Sam',
        lastName: 'Lee',
        title: null,
        department: 'Engineering',
      })
    ),
  ],
};
