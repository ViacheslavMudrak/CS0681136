import type { Meta, StoryObj } from '@storybook/react';
import type { Page } from '@sitecore-content-sdk/nextjs';
import { FullWidth as FullWidthHeader, Condensed as CondensedHeader } from './NewsArticleHeader';
import type { NewsArticleHeaderProps } from './NewsArticleHeader.types';

/**
 * The Storybook decorator in `.storybook/preview.tsx` spreads `args.page` onto
 * the default mock `Page`, so stories can override fields like the page-level
 * Thumbnail. `page` is decorator-only and not part of the component's props.
 */
type StoryArgs = NewsArticleHeaderProps & { page?: Partial<Page> };

const meta: Meta<StoryArgs> = {
  title: 'Components/News Article Header',
  component: FullWidthHeader, // default export for autodocs
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<StoryArgs>;

// ---------- STORIES ----------

export const FullWidth: Story = {
  name: 'Full Width',
  render: (args) => <FullWidthHeader {...args} />,
  args: {
    rendering: {
      uid: 'Empty',
      componentName: 'NewsArticleHeader',
      dataSource: 'Empty',
      params: { showDescription: '1' },
    },
    fields: {
      articleImage: {
        value: {
          src: '/images/sample-doctor-1.png',
          alt: 'Article Header Image',
        },
      },
      authorName: { value: 'Optional Author Name' },
    },
  },
};

export const Condensed: Story = {
  name: 'Condensed',
  render: (args) => <CondensedHeader {...args} />,
  args: {
    rendering: {
      uid: 'Empty',
      componentName: 'NewsArticleHeader',
      dataSource: 'Empty',
      params: { showDescription: '1' },
    },
    fields: {
      articleImage: {
        value: {
          src: '/images/sample-doctor-1.png',
          alt: 'Article Header Image',
        },
      },
      authorName: { value: 'Optional Author Name' },
    },
  },
};

/**
 * Article Image (data source) is empty; the component falls back to the
 * page-level Thumbnail field so authors only have to set one image.
 */
export const ThumbnailFallback: Story = {
  name: 'Thumbnail Fallback',
  render: (args) => <FullWidthHeader {...args} />,
  args: {
    rendering: {
      uid: 'Empty',
      componentName: 'NewsArticleHeader',
      dataSource: 'Empty',
      params: { showDescription: '1' },
    },
    fields: {
      articleImage: { value: { src: '', alt: '' } },
      authorName: { value: 'Optional Author Name' },
    },
    page: {
      layout: {
        sitecore: {
          // Cast through `unknown` because Sitecore's `RouteData` requires
          // additional fields we don't need to mock for this story.
          route: {
            itemId: 'mock-news-item-id',
            fields: {
              thumbnail: {
                value: {
                  src: '/images/sample-doctor-1.png',
                  alt: 'Page Thumbnail (fallback)',
                },
              },
            },
          } as unknown as Page['layout']['sitecore']['route'],
          context: {} as Page['layout']['sitecore']['context'],
        },
      },
    },
  },
};
