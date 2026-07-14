import type { Meta, StoryObj } from '@storybook/react';
import { SessionProvider } from 'next-auth/react';
import { SWRConfig } from 'swr';

import type {
  CollabSiteCard,
  CollabSitesListResponse,
  ExploreCollabSiteCard,
} from 'lib/collab-sites/collab-site.types';
import MyCollabSitesArea from './MyCollabSitesArea';
import type { MyCollabSitesAreaProps } from './MyCollabSitesArea.types';

const mockSession = {
  user: {
    id: 'storybook-user@ascension.org',
    name: 'Storybook User',
    email: 'storybook-user@ascension.org',
  },
  expires: '2099-01-01T00:00:00.000Z',
};

const meta: Meta<typeof MyCollabSitesArea> = {
  title: 'Components/My Collab Sites Area',
  component: MyCollabSitesArea,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MyCollabSitesArea>;

// ---------------------------------------------------------------------------
// Mock collab site data (mirrors /api/collab-sites/list response shape)
// ---------------------------------------------------------------------------

const mockMyCollabSites: CollabSiteCard[] = [
  {
    id: '/Development/QA-Collab-Site-Home-Page',
    url: '/Development/QA-Collab-Site-Home-Page',
    name: 'QA Collab Site Home Page',
    description: 'This is the description of this group - come and join it!',
    thumbnailImage: { value: {} },
    groupEmails: ['atexec@ascension.org'],
    isHidden: false,
    creationDate: '20260402T000000Z',
    joinRequestEmails: [],
  },
  {
    id: '/Development/QA-Collab',
    url: '/Development/QA-Collab',
    name: 'QA Collab',
    description: '',
    thumbnailImage: {
      value: {
        src: 'https://xmc-ascensionhed155-intranetevoa028-deve38e.sitecorecloud.io/-/media/Project/Intranet-Evolution/DFD/Collab-Sites/Logos/Rectangle-387.png?h=200&iar=0&w=200',
        alt: 'Rectangle 387',
        width: '200',
        height: '200',
      },
    },
    groupEmails: ['atexec@ascension.org'],
    isHidden: true,
    creationDate: '',
    joinRequestEmails: [],
  },
];

const mockExploreCollabSites: ExploreCollabSiteCard[] = [
  {
    id: '/Development/Collab-Site-Hero',
    url: '/Development/Collab-Site-Hero',
    name: 'Collab Site Hero',
    description: 'Strategic planning and confidential documentation for L7+ leadership.',
    thumbnailImage: {
      value: {
        src: 'https://xmc-ascensionhed155-intranetevoa028-deve38e.sitecorecloud.io/-/media/Project/Intranet-Evolution/DFD/Collab-Sites/Logos/Rectangle-387.png?h=200&iar=0&w=200',
        alt: 'Rectangle 387',
        width: '200',
        height: '200',
      },
    },
    groupEmails: [],
    isHidden: false,
    creationDate: '',
    joinRequestEmails: ['collab-hero-admins@ascension.org'],
    joinRequestStatus: 'none',
  },
  {
    id: '/New-Collab-Space-Listing/Collab-Space-Nursing',
    url: '/New-Collab-Space-Listing/Collab-Space-Nursing',
    name: 'Collab Space Nursing',
    description: '',
    thumbnailImage: { value: {} },
    groupEmails: [],
    isHidden: false,
    creationDate: '',
    joinRequestEmails: ['nursing-admins@ascension.org'],
    joinRequestStatus: 'pending',
  },
  {
    id: '/New-Collab-Space-Listing/Collab-Space-Site-Home2',
    url: '/New-Collab-Space-Listing/Collab-Space-Site-Home2',
    name: 'Collab Space Site Home 2',
    description: '',
    thumbnailImage: { value: {} },
    groupEmails: [],
    isHidden: false,
    creationDate: '',
    joinRequestEmails: ['site-home2-admins@ascension.org'],
    joinRequestStatus: 'none',
  },
  {
    id: '/Development/Collab-Space-Site-Home-QA',
    url: '/Development/Collab-Space-Site-Home-QA',
    name: 'Collab Space Site Home QA',
    description: 'Description',
    thumbnailImage: { value: {} },
    groupEmails: [],
    isHidden: false,
    creationDate: '',
    joinRequestEmails: [],
    joinRequestStatus: 'none',
  },
];

const mockApiResponse: CollabSitesListResponse = {
  myCollabSites: mockMyCollabSites,
  exploreCollabSites: mockExploreCollabSites,
};

// ---------------------------------------------------------------------------
// Sitecore datasource fields mock
// ---------------------------------------------------------------------------

const mockProps: MyCollabSitesAreaProps = {
  rendering: {
    componentName: 'MyCollabSitesArea',
    uid: 'my-collab-sites-area',
    dataSource: 'my-collab-sites-area-datasource',
    params: {},
  },
  params: {
    CardsPerPage: '15',
    DynamicPlaceholderId: '',
    FieldNames: '',
  },
  fields: {
    pageHeaderTitle: { value: 'Collaboration Sites' },
    pageHeaderIcon: { fields: { value: { value: 'GroupsOutlined' } } },
    tabLabelMyCollabSites: { value: 'My Collaboration Sites' },
    tabLabelExploreCollabSites: { value: 'Explore Collaboration Sites' },
    emptyStateHeadline: { value: 'Find your people' },
    emptyStateSubheading: { value: "You haven't joined any Collaboration Sites yet." },
    emptyStateDescription: {
      value:
        'Start exploring Collaboration Sites across Ascension to connect with others who share your interests, role, or location.',
    },
    emptyStateCTAButtonText: { value: 'Explore Collaboration Sites' },
    requestToJoinSuccessMessage: {
      value: 'Your request to join has been submitted. You will be notified when approved.',
    },
    requestToJoinFailureMessage: {
      value: 'Something went wrong sending your request. Please try again later.',
    },
  },
};

// ---------------------------------------------------------------------------
// SWR decorator — intercepts fetches to return mock data
// ---------------------------------------------------------------------------

// useSwrWithAuth builds the SWR key as:
//   `/api/collab-sites/list?parentId=<itemId>#userId=<userId>`
// The parentId comes from useSitecore().page.layout.sitecore.route?.itemId, which
// the global preview.tsx sets to 'storybook-item-id'. We pre-populate the SWR
// cache via `fallback` so mock data is returned immediately without an API call.
const MOCK_SWR_KEY = `/api/collab-sites/list?parentId=storybook-item-id#userId=${mockSession.user.id}`;

function withMockSwr(apiResponse: CollabSitesListResponse) {
  return function MockSwrDecorator(Story: React.ComponentType) {
    return (
      <SessionProvider session={mockSession}>
        <SWRConfig
          value={{
            fallback: { [MOCK_SWR_KEY]: apiResponse },
            provider: () => new Map(),
          }}
        >
          <Story />
        </SWRConfig>
      </SessionProvider>
    );
  };
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const WithCollabSites: Story = {
  name: 'With Collab Sites',
  args: mockProps,
  decorators: [withMockSwr(mockApiResponse)],
};

export const EmptyState: Story = {
  name: 'Empty State',
  args: mockProps,
  decorators: [
    withMockSwr({
      myCollabSites: [],
      exploreCollabSites: mockExploreCollabSites,
    }),
  ],
};

export const ExploreWithRequestStates: Story = {
  name: 'Explore Tab — Request & Requested States',
  args: mockProps,
  decorators: [
    withMockSwr({
      myCollabSites: [],
      exploreCollabSites: mockExploreCollabSites,
    }),
  ],
};

export const NoExploreCollabSites: Story = {
  name: 'No Explore Collab Sites',
  args: mockProps,
  decorators: [
    withMockSwr({
      myCollabSites: mockMyCollabSites,
      exploreCollabSites: [],
    }),
  ],
};
