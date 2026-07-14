import { UserNewsFeed_GraphQL } from 'src/models/graphql/user-news-feed';
import { TagItem } from 'ts/common-sitecore-field-types';

import type { Meta, StoryObj } from '@storybook/react';

import UserNewsFeed from './UserNewsFeed';
import type { UserNewsFeedProps, QueryData } from './UserNewsFeed.types';

const meta: Meta<typeof UserNewsFeed> = {
  title: 'Components/UserNewsFeed',
  component: UserNewsFeed,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<UserNewsFeedProps & QueryData>;

const mockArticles: UserNewsFeed_GraphQL[] = [
  {
    id: 'mock-id-1',
    url: { path: '/news/article-1' },
    title: {
      value:
        'News article headline that comes from the news article page title lorem ipsum lorem News article headline that comes from the news article page title lorem ipsum lorem',
    },
    publishDate: { value: '2024-10-15T00:00:00Z' },
    thumbnail: {
      jsonValue: {
        value: {
          src: '/images/photo-gallery-image-1.jpg',
          alt: 'News Thumbnail 1',
        },
      },
    },
  },
  {
    id: 'mock-id-2',
    url: { path: '/news/article-2' },
    title: { value: 'News article headline that comes from the news article' },
    publishDate: { value: '2024-09-20T00:00:00Z' },
    thumbnail: {
      jsonValue: {
        value: {
          src: '/images/photo-gallery-image-1.jpg',
          alt: 'News Thumbnail 2',
        },
      },
    },
  },
  {
    id: 'mock-id-3',
    url: { path: '/news/article-3' },
    title: { value: 'News article headline that comes from the news article page title' },
    publishDate: { value: '2024-09-01T00:00:00Z' },
    thumbnail: {
      jsonValue: {
        value: {
          src: '/images/photo-gallery-image-1.jpg',
          alt: 'News Thumbnail 3',
        },
      },
    },
  },
  {
    id: 'mock-id-4',
    url: { path: '/news/article-3' },
    title: { value: 'News article headline that comes from the news article page title' },
    publishDate: { value: '2024-09-01T00:00:00Z' },
    thumbnail: {
      jsonValue: {
        value: {
          src: '/images/photo-gallery-image-1.jpg',
          alt: 'News Thumbnail 4',
        },
      },
    },
  },
  {
    id: 'mock-id-5',
    url: { path: '/news/article-5' },
    title: { value: '5 News article headline that comes from the news article page title' },
    publishDate: { value: '2024-09-01T00:00:00Z' },
    thumbnail: {
      jsonValue: {
        value: {
          src: '/images/photo-gallery-image-1.jpg',
          alt: 'News Thumbnail 5',
        },
      },
    },
  },
  {
    id: 'mock-id-6',
    url: { path: '/news/article-6' },
    title: { value: 'News article headline that comes from the news article page title' },
    publishDate: { value: '2024-09-01T00:00:00Z' },
    thumbnail: {
      jsonValue: {
        value: {
          src: '/images/photo-gallery-image-1.jpg',
          alt: 'News Thumbnail 6',
        },
      },
    },
  },
  {
    id: 'mock-id-7',
    url: { path: '/news/article-7' },
    title: { value: 'News article headline that comes from the news article page title' },
    publishDate: { value: '2024-09-01T00:00:00Z' },
    thumbnail: {
      jsonValue: {
        value: {
          src: '/images/photo-gallery-image-1.jpg',
          alt: 'News Thumbnail 7',
        },
      },
    },
  },
  {
    id: 'mock-id-8',
    url: { path: '/news/article-8' },
    title: { value: 'News article headline that comes from the news article page title' },
    publishDate: { value: '2024-09-01T00:00:00Z' },
    thumbnail: {
      jsonValue: {
        value: {
          src: '/images/photo-gallery-image-1.jpg',
          alt: 'News Thumbnail 8',
        },
      },
    },
  },
  {
    id: 'mock-id-9',
    url: { path: '/news/article-9' },
    title: { value: '9 News article headline that comes from the news article page title' },
    publishDate: { value: '2024-09-01T00:00:00Z' },
    thumbnail: {
      jsonValue: {
        value: {
          src: '/images/photo-gallery-image-1.jpg',
          alt: 'News Thumbnail 9',
        },
      },
    },
  },
];

const mockSiteTags: TagItem[] = [
  {
    id: 'site-tag-1',
    name: 'site-culture',
    fields: {
      title: { value: 'Site Culture' },
      facetCategory: { value: 'Regional News' },
    },
  },
  {
    id: 'site-tag-2',
    name: 'site-leadership',
    fields: {
      title: { value: 'Site Leadership' },
      facetCategory: { value: 'Regional News' },
    },
  },
  {
    id: 'site-tag-3',
    name: 'site-news',
    fields: {
      title: { value: 'Site News' },
      facetCategory: { value: 'Regional News' },
    },
  },
];

const mockGlobalTags: TagItem[] = [
  {
    id: 'global-tag-1',
    name: 'global-culture',
    fields: {
      title: { value: 'Global Culture' },
      facetCategory: { value: 'Regional News' },
    },
  },
  {
    id: 'global-tag-2',
    name: 'global-leadership',
    fields: {
      title: { value: 'Global Leadership' },
      facetCategory: { value: 'Regional News' },
    },
  },
  {
    id: 'global-tag-3',
    name: 'global-news',
    fields: {
      title: { value: 'Global News' },
      facetCategory: { value: 'Regional News' },
    },
  },
  {
    id: 'global-tag-4',
    name: 'global-spotlight',
    fields: {
      title: { value: 'Global Spotlight' },
      facetCategory: { value: 'Regional News' },
    },
  },
];

export const Primary: Story = {
  args: {
    fields: {
      newsFeedTitle: { value: 'My News Feed' },
      newsFeedSubtitle: { value: 'Customize your news fededs in your' },
      accountPageLInk: {
        value: {
          href: '/account',
        },
      },
      newsLookupRange: { value: 14 },
      seeAllLinkText: { value: 'See All' },
      modalTitle: { value: 'My News' },
      modalInstructions: {
        value: 'Curate your custom news feed by selecting news categories from the list below',
      },
      tagsHeadingText: { value: 'Topics' },
      globalTags: mockGlobalTags,
      systemNewsTags: mockSiteTags,
    },
    userfeed: {
      results: mockArticles,
    },
    rendering: {
      uid: 'MockRendering',
      componentName: 'UserNewsFeed',
      dataSource: 'MockDataSource',
      params: {},
      fields: {},
    },
    stylesSXA: '',
  },
};
