import type { ArgTypes, Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  HalfGrid as LinkListHalfGrid,
  FullGridFourColumn as LinkListFourCol,
  FullGridThreeColumn as LinkListThreeCol,
} from './LinkList';
import type { LinkListProps } from './LinkList.types';
import { LinkField } from '@sitecore-content-sdk/nextjs';

const baseLink = {
  fields: {
    linkIcon: { value: 'AutoAwesomeOutlined' },
    directoryEntry: [],
    generalLink: {
      value: {
        text: 'Tool Name Goes Here',
        href: '/',
        target: '_blank',
        id: '',
      },
    } as LinkField,
  },
};

const makeLinks = (count: number) => {
  const icons = [
    'AutoAwesomeOutlined',
    'ScheduleOutlined',
    'VerifiedUserOutlined',
    'Link',
    'InsertChartOutlined',
  ];
  return Array.from({ length: count }, (_, i) => ({
    fields: {
      ...baseLink.fields,
      linkIcon: { fields: { value: { value: icons[i % icons.length] } } },
    },
  }));
};

const controls: ArgTypes = {
  linkCount: {
    control: { type: 'number', min: 0, max: 40, step: 1 },
    description: 'Number of links to render',
  },
  disableScrollbar: {
    control: { type: 'boolean' },
    description: 'Disable overflow scrollbar (renders all rows)',
  },
};

const meta: Meta<typeof LinkListHalfGrid> = {
  title: 'Components/Link List',
  component: LinkListHalfGrid,
  tags: ['autodocs'],
  argTypes: controls,
};

export default meta;

type Story = StoryObj<LinkListProps & { linkCount?: number; disableScrollbar?: boolean }>;

export const HalfGrid: Story = {
  args: {
    rendering: {
      uid: 'LinkList-HalfGrid',
      componentName: 'LinkList',
      dataSource: 'story',
    },
    params: {},
    fields: {
      optionalEyebrow: { value: 'Optional Eyebrow' },
      headlineText: { value: 'H2 Page Content Section Headline Here' },
      subtext: {
        value:
          'Optional Text. Lorem ipsum dolor sit amet, mentitum reprimique et eum. Ne eam affert congue. Ius vide accumsan suscipit an, at legendos persequeris mel. Usu ei nihil timeam.',
      },
      links: makeLinks(6),
    },
    linkCount: 12,
    disableScrollbar: false,
  },
  render: (args) => {
    const { linkCount = 12, disableScrollbar = false, ...rest } = args;
    const links = makeLinks(linkCount);
    const rendering = {
      ...(args.rendering || {}),
      params: {
        ...(args.rendering?.params || {}),
        disableScrollbarOverflow: disableScrollbar ? '1' : '0',
      },
    } as LinkListProps['rendering'];
    return (
      <LinkListHalfGrid
        {...(rest as LinkListProps)}
        rendering={rendering}
        fields={{ ...(rest as LinkListProps).fields, links }}
      />
    );
  },
};

export const FullGridFourColumn: Story = {
  args: {
    rendering: {
      uid: 'LinkList-FourCol',
      componentName: 'LinkList',
      dataSource: 'story',
    },
    params: {},
    fields: {
      optionalEyebrow: { value: 'Optional Eyebrow' },
      headlineText: { value: 'H2 Page Content Section Headline Here' },
      subtext: {
        value:
          'Optional Text. Lorem ipsum dolor sit amet, mentitum reprimique et eum. Ne eam affert congue. Ius vide accumsan suscipit an, at legendos persequeris mel. Usu ei nihil timeam.',
      },
      links: makeLinks(8),
    },
    linkCount: 24,
    disableScrollbar: false,
  },
  render: (args) => {
    const { linkCount = 24, disableScrollbar = false, ...rest } = args;
    const links = makeLinks(linkCount);
    const rendering = {
      ...(args.rendering || {}),
      params: {
        ...(args.rendering?.params || {}),
        disableScrollbarOverflow: disableScrollbar ? '1' : '0',
      },
    } as LinkListProps['rendering'];
    return (
      <LinkListFourCol
        {...(rest as LinkListProps)}
        rendering={rendering}
        fields={{ ...(rest as LinkListProps).fields, links }}
      />
    );
  },
};

export const FullGridThreeColumn: Story = {
  args: {
    rendering: {
      uid: 'LinkList-ThreeCol',
      componentName: 'LinkList',
      dataSource: 'story',
    },
    params: {},
    fields: {
      optionalEyebrow: { value: '' },
      headlineText: { value: 'H2 Page Content Section Headline Here' },
      subtext: { value: '' },
      links: makeLinks(6),
    },
    linkCount: 18,
    disableScrollbar: false,
  },
  render: (args) => {
    const { linkCount = 18, disableScrollbar = false, ...rest } = args;
    const links = makeLinks(linkCount);
    const rendering = {
      ...(args.rendering || {}),
      params: {
        ...(args.rendering?.params || {}),
        disableScrollbarOverflow: disableScrollbar ? '1' : '0',
      },
    } as LinkListProps['rendering'];
    return (
      <LinkListThreeCol
        {...(rest as LinkListProps)}
        rendering={rendering}
        fields={{ ...(rest as LinkListProps).fields, links }}
      />
    );
  },
};
