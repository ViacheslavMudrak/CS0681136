import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DarkTheme, LightTheme } from './KeyPeopleComponent';
import type { KeyPeopleComponentProps } from './KeyPeopleComponent.types';

// Assuming KeyPerson is exported from your types file, otherwise you can define it here.
// import type { KeyPerson } from './KeyPeopleComponent.types';

const meta: Meta<typeof DarkTheme> = {
  title: 'Components/Key-People',
  component: DarkTheme,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<KeyPeopleComponentProps>;

// Helper to generate repetitive mock data cleanly
const generateMockLeader = (id: string) => ({
  id,
  url: `/people/${id}`,
  name: `leader-${id}`,
  displayName: 'First Last Name',
  fields: {
    overrideProfileImage: { value: { src: 'https://placehold.co/154x154', alt: 'Leader Profile' } },
    overrideName: { value: 'First Last Name' },
    overrideJobTitle: { value: 'Job Title Here' },
    description: {
      value:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
    emailAccount: { value: 'example@ascension.org' },
    overrideEmail: { value: '' }, // Leaves fallback to emailAccount
    overridePhoneNumber: { value: '877-123-4567' },
    overrideLocation: { value: 'St. Anges Hosp-Baltimore MD' },
  },
});

// ---------- MOCK LEADERS ----------
const mockLeaders = [
  generateMockLeader('1'),
  generateMockLeader('2'),
  generateMockLeader('3'),
  generateMockLeader('4'),
  generateMockLeader('5'),
  generateMockLeader('6'),
];

// ---------- STORIES ----------
export const Dark: Story = {
  args: {
    rendering: {
      uid: 'mock-uid',
      componentName: 'KeyPeopleComponent',
      dataSource: 'mock-datasource',
      params: {
        showAll: '0',
      },
      placeholders: {},
    },
    fields: {
      headlineText: { value: 'Technology Leadership Team' },
      peopleSelection: mockLeaders,
    },
  },
  render: (args) => <DarkTheme {...args} />,
};

export const Light: Story = {
  args: {
    ...Dark.args,
  },
  render: (args) => <LightTheme {...args} />,
};
