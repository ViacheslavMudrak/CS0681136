import { SessionProvider } from 'next-auth/react';

import type { Meta, StoryObj } from '@storybook/react';

import PersonOrgStructure from './PersonOrgStructure';
import type { PersonOrgStructureProps } from './PersonOrgStructure.types';

const meta: Meta<PersonOrgStructureProps> = {
  title: 'Components/Google/PersonOrgStructure',
  component: PersonOrgStructure,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <SessionProvider session={null}>
        <Story />
      </SessionProvider>
    ),
  ],
  args: {
    className: '',
  },
};

export default meta;
type Story = StoryObj<PersonOrgStructureProps>;

export const Default: Story = {};

export const WithMockData: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/google/org-structure?email=john.doe@ascension.org',
        method: 'GET',
        status: 200,
        response: {
          tree: {
            email: 'john.doe@ascension.org',
            name: { displayName: 'John Doe', givenName: 'John', familyName: 'Doe' },
            title: 'VP of Engineering',
            department: 'Technology',
            photoUrl: '',
            directReports: [
              {
                email: 'jane.smith@ascension.org',
                name: { displayName: 'Jane Smith', givenName: 'Jane', familyName: 'Smith' },
                title: 'Director of Engineering',
                department: 'Technology',
                photoUrl: '',
                directReports: [
                  {
                    email: 'bob.johnson@ascension.org',
                    name: { displayName: 'Bob Johnson', givenName: 'Bob', familyName: 'Johnson' },
                    title: 'Senior Developer',
                    department: 'Technology',
                    photoUrl: '',
                    directReports: [],
                  },
                  {
                    email: 'carol.davis@ascension.org',
                    name: { displayName: 'Carol Davis', givenName: 'Carol', familyName: 'Davis' },
                    title: 'Software Engineer',
                    department: 'Technology',
                    photoUrl: '',
                    directReports: [],
                  },
                ],
              },
              {
                email: 'alice.williams@ascension.org',
                name: {
                  displayName: 'Alice Williams',
                  givenName: 'Alice',
                  familyName: 'Williams',
                },
                title: 'Engineering Manager',
                department: 'Technology',
                photoUrl: '',
                directReports: [],
              },
            ],
          },
          totalNodes: 5,
        },
      },
    ],
  },
};
