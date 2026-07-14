import { SessionProvider } from 'next-auth/react';
import { I18nProvider } from 'next-localization';

import { WidgetsProvider } from '@sitecore-search/react';
import type { Meta, StoryObj } from '@storybook/react';

import GoogleFileList from './GoogleFileList';
import { GoogleFileListFields, GoogleFileListProps } from './GoogleFileList.types';

const mockFields: GoogleFileListFields = {
  optionalEyebrow: { value: 'Google Drive Files' },
  sectionHeader: { value: 'Safely view your files from Google Drive.' },
  sectionDescription: {
    value:
      '<p>Access your files directly from Google Drive. Browse and manage documents stored in your Drive account. View, download, or organize files with ease. All changes stay securely synced with Google Drive. </p>',
  },
  buttonText: { value: 'View on Google Drive' },
  ctaLink: {
    value: {
      href: 'https://drive.google.com',
      text: 'Get Access to Google Drive',
      target: '_blank',
    },
  },
  googleDriveID: {
    value: '',
  },
};

// Mock dictionary
const dictionary = {
  UnauthorizedGoogleDriveAccessDescription:
    'Access to this content is restricted. Your account does not have the required permissions. Please contact an administrator if you need access to this resource.',
  UnauthorizedGoogleDriveAccessTitle: 'You do not have access to this content.',
  Loading: 'Loading...',
  LoadMore: 'Load More ...',
  CopyLinkMessage: 'Download link copied for',
};

const meta: Meta<GoogleFileListProps> = {
  title: 'Components/GoogleFileList',
  component: GoogleFileList,
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
          <SessionProvider session={null}>
            <Story />
          </SessionProvider>
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

type Story = StoryObj<GoogleFileListProps>;

export const Default: Story = {};
