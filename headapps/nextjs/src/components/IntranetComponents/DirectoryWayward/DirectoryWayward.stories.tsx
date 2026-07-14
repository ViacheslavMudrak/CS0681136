import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import DirectoryWayward from './DirectoryWayward';
import type { DirectoryWaywardProps } from './DirectoryWayward.types';

const meta: Meta<typeof DirectoryWayward> = {
  title: 'Components/Directory Wayward',
  component: DirectoryWayward,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<DirectoryWaywardProps>;

export const Primary: Story = {
  args: {
    rendering: {
      uid: 'mock-uid',
      componentName: 'DirectoryWayward',
      dataSource: 'mock-datasource',
      placeholders: {},
      fields: {},
    },
    params: {},
    fields: {
      headline: {
        value: 'Document Directory',
      },
      searchBarPlaceholder: {
        value: 'Search all documents in this category...',
      },
      viewAllLinkText: {
        value: 'VIEW ALL DOCUMENTS',
      },
      directorySearchPage: {
        id: 'mock-id',
        url: '/directory',
        name: 'Directory',
        displayName: 'Directory',
        fields: {},
      },
    },
  },
};

export const CustomTitle: Story = {
  args: {
    rendering: {
      uid: 'mock-uid',
      componentName: 'DirectoryWayward',
      dataSource: 'mock-datasource',
      placeholders: {},
      fields: {},
    },
    params: {},
    fields: {
      headline: {
        value: 'Resource Library',
      },
      searchBarPlaceholder: {
        value: 'Find resources...',
      },
      viewAllLinkText: {
        value: 'VIEW ALL RESOURCES',
      },
      directorySearchPage: {
        id: 'mock-id',
        url: '/resources',
        name: 'Resources',
        displayName: 'Resources',
        fields: {},
      },
    },
  },
};

export const ApplicationDirectory: Story = {
  args: {
    rendering: {
      uid: 'mock-uid',
      componentName: 'DirectoryWayward',
      dataSource: 'mock-datasource',
      placeholders: {},
      fields: {},
    },
    params: {},
    fields: {
      headline: {
        value: 'Application Directory',
      },
      searchBarPlaceholder: {
        value: 'Search for applications...',
      },
      viewAllLinkText: {
        value: 'VIEW ALL APPLICATIONS',
      },
      directorySearchPage: {
        id: 'mock-id',
        url: '/applications',
        name: 'Applications',
        displayName: 'Applications',
        fields: {},
      },
    },
  },
};
