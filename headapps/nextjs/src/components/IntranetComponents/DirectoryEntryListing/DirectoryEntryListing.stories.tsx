// DirectoryEntryListing.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';

import DirectoryEntryListing from './DirectoryEntryListing';
import type { DirectoryEntryListingProps } from './DirectoryEntryListing.types';

const meta: Meta<typeof DirectoryEntryListing> = {
  title: 'Components/Directory Entry Listing',
  component: DirectoryEntryListing,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DirectoryEntryListing>;

export const Default: Story = {
  args: {
    fields: {
      searchPlaceholderText: { value: 'Search directory entries...' },
      listingTitle: { value: 'Directory' },
      directoryFolder: {
        value: {
          href: '',
          text: '',
        },
      },
    },
    rendering: {
      componentName: 'DirectoryEntryListing',
      uid: 'directory-entry-listing-mock',
      dataSource: '/sitecore/content/mock/directory-entry-listing',
      params: {},
    },
    params: {},
    stylesSXA: '',
  } as DirectoryEntryListingProps,
};

export const WithFolderFilter: Story = {
  args: {
    fields: {
      searchPlaceholderText: { value: 'Search employees...' },
      listingTitle: { value: 'Employee Directory' },
      directoryFolder: {
        value: {
          href: '/sitecore/content/Home/Directory/Employees',
          text: 'Employees Folder',
        },
      },
    },
    rendering: {
      componentName: 'DirectoryEntryListing',
      uid: 'directory-entry-listing-filtered-mock',
      dataSource: '/sitecore/content/mock/directory-entry-listing',
      params: {},
    },
    params: {},
    stylesSXA: '',
  } as DirectoryEntryListingProps,
};
