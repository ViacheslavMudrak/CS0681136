import { NewsDetailPage } from 'ts/common-sitecore-field-types';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ManualNewsArticleList from './ManualNewsArticleList';
import type { ManualNewsArticleListProps } from './ManualNewsArticleList.types';

const meta: Meta<typeof ManualNewsArticleList> = {
  title: 'Components/ManualNewsArticleList',
  component: ManualNewsArticleList,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ManualNewsArticleList>;

const mockArticles: NewsDetailPage[] = [
  {
    name: 'article-1',
    id: 'article-1',
    url: '#',
    fields: {
      title: { value: 'News Article Headline That Comes From The News Article Page Title' },
      excerpt: { value: 'Article excerpt text' },
      publishDate: { value: 'March 10, 2026' },
      thumbnail: {
        value: {
          src: '/images/photo-gallery-image-1.jpg',
          alt: 'Article 1',
        },
      },
    },
  },
  {
    name: 'article-2',
    id: 'article-2',
    url: '#',
    fields: {
      title: { value: 'Another News Article Headline From The News Article Page Title' },
      excerpt: { value: 'Article excerpt text' },
      publishDate: { value: 'March 11, 2026' },
      thumbnail: {
        value: {
          src: '/images/photo-gallery-image-1.jpg',
          alt: 'Article 2',
        },
      },
    },
  },
  {
    name: 'article-3',
    id: 'article-3',
    url: '#',
    fields: {
      title: { value: 'Third News Article Headline That Wraps To A Second Line' },
      excerpt: { value: 'Article excerpt text' },
      publishDate: { value: 'March 12, 2026' },
      thumbnail: {
        value: {
          src: '/images/photo-gallery-image-1.jpg',
          alt: 'Article 3',
        },
      },
    },
  },
  {
    name: 'article-4',
    id: 'article-4',
    url: '#',
    fields: {
      title: { value: 'Fourth News Article Headline That Comes From The News Article Page Title' },
      excerpt: { value: 'Article excerpt text' },
      publishDate: { value: 'March 13, 2026' },
      thumbnail: {
        value: {
          src: '/images/photo-gallery-image-1.jpg',
          alt: 'Article 4',
        },
      },
    },
  },
];

export const Primary: Story = {
  args: {
    rendering: {
      uid: 'mock-uid',
      componentName: 'ManualNewsArticleList',
      dataSource: 'Empty',
      params: {},
    },
    params: {},
    stylesSXA: '',
    fields: {
      sectionHeadline: { value: 'Headline' },
      selectedArticles: mockArticles,
    },
  } as ManualNewsArticleListProps,
};
