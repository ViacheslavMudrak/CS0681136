import type { Meta, StoryObj } from '@storybook/react';
import type { Field } from '@sitecore-content-sdk/nextjs';
import { SessionProvider } from 'next-auth/react';
import { Default as NewsArticleBookend } from './NewsArticleBookend';
import type { NewsArticleBookendProps } from './NewsArticleBookend.types';
// Import mock tags - Vite alias resolves at runtime
const mockTagsData = {
  healthcare: [
    {
      id: '1',
      name: 'Healthcare',
      displayName: 'Healthcare',
      fields: { title: { value: 'Healthcare' } },
    },
    {
      id: '2',
      name: 'Benefits',
      displayName: 'Benefits',
      fields: { title: { value: 'Benefits' } },
    },
    {
      id: '3',
      name: 'Wellness',
      displayName: 'Wellness',
      fields: { title: { value: 'Wellness' } },
    },
  ],
  advocacy: [
    {
      id: 'area1',
      name: 'Advocacy',
      displayName: 'Advocacy',
      fields: { title: { value: 'Advocacy' } },
    },
    {
      id: 'topic1',
      name: 'Community',
      displayName: 'Community',
      fields: { title: { value: 'Community' } },
    },
  ],
  many: [
    {
      id: '1',
      name: 'Healthcare',
      displayName: 'Healthcare',
      fields: { title: { value: 'Healthcare' } },
    },
    {
      id: '2',
      name: 'Benefits',
      displayName: 'Benefits',
      fields: { title: { value: 'Benefits' } },
    },
    {
      id: '3',
      name: 'Wellness',
      displayName: 'Wellness',
      fields: { title: { value: 'Wellness' } },
    },
    {
      id: '4',
      name: 'Community',
      displayName: 'Community',
      fields: { title: { value: 'Community' } },
    },
    {
      id: '5',
      name: 'Advocacy',
      displayName: 'Advocacy',
      fields: { title: { value: 'Advocacy' } },
    },
    { id: '6', name: 'Safety', displayName: 'Safety', fields: { title: { value: 'Safety' } } },
    {
      id: '7',
      name: 'Innovation',
      displayName: 'Innovation',
      fields: { title: { value: 'Innovation' } },
    },
  ],
};

const meta: Meta<typeof NewsArticleBookend> = {
  title: 'Components/News Article Bookend',
  component: NewsArticleBookend,
  decorators: [
    (Story) => (
      <SessionProvider session={null}>
        <Story />
      </SessionProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<NewsArticleBookendProps>;

export const Primary: Story = {
  args: {
    rendering: {
      componentName: 'NewsArticleBookend',
      dataSource: 'sample-datasource',
      params: {},
    },
    fields: {
      data: {
        contextItem: {
          lastUpdated: {
            value: '20251105T200607Z',
          } as Field<string>,
          lastUpdatedDateOverride: {
            value: '',
          } as Field<string>,
        },
      },
    },
  },
  parameters: {
    mockTags: mockTagsData.healthcare,
  },
};

export const WithManyTags: Story = {
  args: {
    rendering: {
      componentName: 'NewsArticleBookend',
      dataSource: 'sample-datasource',
      params: {},
    },
    fields: {
      data: {
        contextItem: {
          lastUpdated: {
            value: '20251105T200607Z',
          } as Field<string>,
          lastUpdatedDateOverride: {
            value: '',
          } as Field<string>,
        },
      },
    },
  },
  parameters: {
    mockTags: mockTagsData.many,
  },
};

export const WithFewTags: Story = {
  args: {
    rendering: {
      componentName: 'NewsArticleBookend',
      dataSource: 'sample-datasource',
      params: {},
    },
    fields: {
      data: {
        contextItem: {
          lastUpdated: {
            value: '20251105T200607Z',
          } as Field<string>,
          lastUpdatedDateOverride: {
            value: '',
          } as Field<string>,
        },
      },
    },
  },
  parameters: {
    mockTags: mockTagsData.advocacy,
  },
};

export const NoTags: Story = {
  args: {
    rendering: {
      componentName: 'NewsArticleBookend',
      dataSource: 'sample-datasource',
      params: {},
    },
    fields: {
      data: {
        contextItem: {
          lastUpdated: {
            value: '20251105T200607Z',
          } as Field<string>,
          lastUpdatedDateOverride: {
            value: '',
          } as Field<string>,
        },
      },
    },
  },
  parameters: {
    mockTags: [],
  },
};

export const WithDateOverride: Story = {
  args: {
    rendering: {
      componentName: 'NewsArticleBookend',
      dataSource: 'sample-datasource',
      params: {},
    },
    fields: {
      data: {
        contextItem: {
          lastUpdated: {
            value: '20251105T200607Z',
          } as Field<string>,
          lastUpdatedDateOverride: {
            value: '20261105T200607Z',
          } as Field<string>,
        },
      },
    },
  },
  parameters: {
    mockTags: mockTagsData.healthcare,
  },
};
