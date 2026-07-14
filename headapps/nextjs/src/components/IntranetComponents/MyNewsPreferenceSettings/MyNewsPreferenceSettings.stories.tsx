import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SessionProvider } from 'next-auth/react';
import { SWRConfig } from 'swr';

import type { NewsSiteOptionsResponse } from 'lib/news-preferences/types';
import MyNewsPreferenceSettings from './MyNewsPreferenceSettings';
import type { MyNewsPreferenceSettingsProps } from './MyNewsPreferenceSettings.types';

const mockSession = {
  user: {
    id: 'storybook-user@ascension.org',
    name: 'Storybook User',
    email: 'storybook-user@ascension.org',
  },
  expires: '2099-01-01T00:00:00.000Z',
};

const meta: Meta<typeof MyNewsPreferenceSettings> = {
  title: 'Components/MyNewsPreferenceSettings',
  component: MyNewsPreferenceSettings,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MyNewsPreferenceSettings>;

const mockProps: MyNewsPreferenceSettingsProps = {
  rendering: {
    componentName: 'MyNewsPreferenceSettings',
    uid: 'my-news-preference-settings',
    dataSource: 'test',
    params: {},
  },
  params: {},
  stylesSXA: '',
  fields: {
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
};

// ---------------------------------------------------------------------------
// Mock site options (mirrors /api/user-preferences/news-site-options response).
// Supplemental list arrives already grouped by type then alphabetical, as the
// server returns it.
// ---------------------------------------------------------------------------

const mockSiteOptions: NewsSiteOptionsResponse = {
  home: [
    { id: '{1111}', name: 'St. Vincent', title: { value: 'St. Vincent' } },
    { id: '{2222}', name: 'Via Christi', title: { value: 'Via Christi' } },
  ],
  supplemental: [
    { id: '{1111}', name: 'St. Vincent', title: { value: 'St. Vincent' } },
    { id: '{2222}', name: 'Via Christi', title: { value: 'Via Christi' } },
    { id: '{3333}', name: 'Human Resources', title: { value: 'Human Resources' } },
    { id: '{4444}', name: 'Information Technology', title: { value: 'Information Technology' } },
    { id: '{5555}', name: 'Clinical Resources', title: { value: 'Clinical Resources' } },
    { id: '{6666}', name: 'Nursing Collaboration', title: { value: 'Nursing Collaboration' } },
  ],
};

// ---------------------------------------------------------------------------
// SWR decorator — pre-populates the SWR cache so the mock options are returned
// immediately without an API call. useSwrWithAuth scopes the cache key as
// `${key}#userId=${userId}`.
// ---------------------------------------------------------------------------

const MOCK_SWR_KEY = `/api/user-preferences/news-site-options#userId=${mockSession.user.id}`;

function withMockSwr(siteOptions: NewsSiteOptionsResponse) {
  return function MockSwrDecorator(Story: React.ComponentType) {
    return (
      <SessionProvider session={mockSession}>
        <SWRConfig
          value={{
            fallback: { [MOCK_SWR_KEY]: siteOptions },
            provider: () => new Map(),
          }}
        >
          <Story />
        </SWRConfig>
      </SessionProvider>
    );
  };
}

export const Primary: Story = {
  args: mockProps,
  decorators: [withMockSwr(mockSiteOptions)],
};

export const EmptyOptions: Story = {
  name: 'No Site Options',
  args: mockProps,
  decorators: [withMockSwr({ home: [], supplemental: [] })],
};
