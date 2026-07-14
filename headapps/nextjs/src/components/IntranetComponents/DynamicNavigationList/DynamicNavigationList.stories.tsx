import { I18nProvider } from 'next-localization';
import { CustomLinkItem, IconItem } from 'ts/custom-link';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import DynamicNavigationList from './DynamicNavigationList';
import type { DynamicNavigationListProps, SubItemLink } from './DynamicNavigationList.types';

// Mock dictionary
const dictionary = {
  NoSearchResultMessage: 'No results found for $searchKey.',
  ShowAllLabel: 'Showing all',
  ClearLink: 'Clear',
  SearchBoxPlaceholderText: 'Search',
};

const createMockSubItemLink = (name: string, depth: number) => {
  const subItemLink: SubItemLink = {
    name: name,
    title: {
      value: name,
    },
    navigationTitle: {
      value: name,
    },
    url: {
      path:
        depth === 3
          ? `/sitecore/test/Clinical/Resources/${name}`
          : depth === 2
            ? `/sitecore/test/Clinical/${name}`
            : `/sitecore/test/${name}`,
    },
  };
  return subItemLink;
};

const createMockExtraLinkItem = (name: string) => {
  const customLink: CustomLinkItem = {
    fields: {
      generalLink: {
        value: {
          href: `https://gdaintranet.ascension.org/clinicalservices/${name}`,
          linktype: 'external',
          target: '_blank',
          text: name,
          url: `https://gdaintranet.ascension.org/clinicalservices/${name}`,
        },
      },
      directoryEntry: [],
      linkIcon: null as unknown as IconItem,
    },
  };
  return customLink;
};

const mockDataSource = {
  sectionTitle: { value: 'All Clinical Resources' },
  pageLevel: { value: 'Children and Grandchildren' },
  extraLinks: [
    createMockExtraLinkItem('Consumer experience resources for nurses'),
    createMockExtraLinkItem('Consumer experience resources for clinicians'),
    createMockExtraLinkItem('Ascension Strategic Plan'),
  ],
};

const clinicalResources = [
  'Care Communications Application Education',
  'Clinical Education',
  'Downtime Power Plans',
  'Infection Prevention',
  'Interpreter Services',
  'Lab Plus Test Catalog',
  'Nutrition',
  'On Call Schedule',
  'Phone Directories',
  'Provider/Associate Care Team (PACT)',
  'Lorem Ipsum',
];

const tasks = [
  'Time & Schedule',
  'Learning & Development',
  'People Leader Tasks',
  'Associate Resources',
  'People Leader Resources',
  'My Ministry: Tennesee',
  'Pay & Benefits',
];

const longLinks = [
  'Care Communications Application Education and Training Resources',
  'Clinical Education',
  'Downtime Power Plans',
  'Provider/Associate Care Team (PACT) Management System',
  'Comprehensive Laboratory Test Catalog and Reference Guide',
  'Infection Prevention and Control Guidelines',
  'Interpreter Services for Multiple Languages',
  'Nutrition and Dietary Services Information',
  'On Call Schedule and Emergency Contact Information',
  'Phone Directories for All Departments',
  'Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing Elit',
  'Additional Resource Name That Is Very Long',
];

const manyLinks = [
  ...clinicalResources,
  ...tasks,
  ...clinicalResources.map((item) => {
    return `${item}-1`;
  }),
  ...tasks.map((item) => {
    return `${item}-1`;
  }),
  ...clinicalResources.map((item) => {
    return `${item}-2`;
  }),
  ...tasks.map((item) => {
    return `${item}-2`;
  }),
  ...clinicalResources.map((item) => {
    return `${item}-3`;
  }),
  ...tasks.map((item) => {
    return `${item}-3`;
  }),
  ...clinicalResources.map((item) => {
    return `${item}-4`;
  }),
  ...tasks.map((item) => {
    return `${item}-4`;
  }),
];

const mockSubItemLinks = clinicalResources.concat(tasks).map((item) => {
  const pageDepth = Math.round(item.length / 9);
  return createMockSubItemLink(item, pageDepth > 3 ? pageDepth - (pageDepth - 3) : pageDepth);
});

const mockSubItemLinks_FewLinks = clinicalResources.map((item) => {
  const pageDepth = Math.round(item.length / 9);
  return createMockSubItemLink(item, pageDepth > 3 ? pageDepth - (pageDepth - 3) : pageDepth);
});

const mockSubItemLinks_ManyLinks = manyLinks.map((item) => {
  const pageDepth = Math.round(item.length / 9);
  return createMockSubItemLink(item, pageDepth > 3 ? pageDepth - (pageDepth - 3) : pageDepth);
});

const mockSubItemLinks_LongLinks = longLinks.map((item) => {
  const pageDepth = Math.round(item.length / 25);
  return createMockSubItemLink(item, pageDepth > 3 ? pageDepth - (pageDepth - 3) : pageDepth);
});

const meta: Meta<typeof DynamicNavigationList> = {
  title: 'Components/Dynamic Navigation List',
  component: DynamicNavigationList,
};

export default meta;

type Story = StoryObj<DynamicNavigationListProps>;

export const Default: Story = {
  parameters: {},
  args: {
    fields: mockDataSource,
    rendering: {
      componentName: 'DynamicNavigationList',
      dataSource: 'mock',
      params: {},
    },
    stylesSXA: '',
    subItemLinks: mockSubItemLinks,
  },
  render: (args) => {
    return (
      <I18nProvider lngDict={dictionary} locale="en">
        <DynamicNavigationList {...args} />
      </I18nProvider>
    );
  },
};

export const FewLinks: Story = {
  parameters: {},
  args: {
    fields: mockDataSource,
    rendering: {
      componentName: 'DynamicNavigationList',
      dataSource: 'mock',
      params: {},
    },
    stylesSXA: '',
    subItemLinks: mockSubItemLinks_FewLinks,
  },
  render: (args) => {
    return (
      <I18nProvider lngDict={dictionary} locale="en">
        <DynamicNavigationList {...args} />
      </I18nProvider>
    );
  },
};

export const ManyLinks: Story = {
  parameters: {},
  args: {
    fields: mockDataSource,
    rendering: {
      componentName: 'DynamicNavigationList',
      dataSource: 'mock',
      params: {},
    },
    stylesSXA: '',
    subItemLinks: mockSubItemLinks_ManyLinks,
  },
  render: (args) => {
    return (
      <I18nProvider lngDict={dictionary} locale="en">
        <DynamicNavigationList {...args} />
      </I18nProvider>
    );
  },
};

export const LongLinkNames: Story = {
  parameters: {},
  args: {
    fields: mockDataSource,
    rendering: {
      componentName: 'DynamicNavigationList',
      dataSource: 'mock',
      params: {},
    },
    stylesSXA: '',
    subItemLinks: mockSubItemLinks_LongLinks,
  },
  render: (args) => {
    return (
      <I18nProvider lngDict={dictionary} locale="en">
        <DynamicNavigationList {...args} />
      </I18nProvider>
    );
  },
};
