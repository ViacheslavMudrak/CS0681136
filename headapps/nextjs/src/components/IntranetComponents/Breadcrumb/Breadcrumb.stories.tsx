import type { Meta, StoryObj } from '@storybook/react';
import Breadcrumb from './Breadcrumbs';
import { BreadcrumbProps } from './Breadcrumb.types';

// ✅ Helper to build mock breadcrumb items
const makeCrumb = (id: number, title: string, path: string) => ({
  id: `${id}`,
  displayName: title,
  title: { jsonValue: { value: title } },
  navTitle: { jsonValue: { value: title } },
  hideInBreadcrumbs: { jsonValue: { value: '' } },
  url: { path },
});

// ✅ Base mock props
const baseProps: BreadcrumbProps = {
  fields: {
    data: {
      currentItem: {
        id: 'current',
        displayName: 'Current Page',
        title: { jsonValue: { value: 'Current Page' } },
        navTitle: { jsonValue: { value: 'Current Page' } },
        hideInBreadcrumbs: { jsonValue: { value: '' } },
        url: { path: '/current' },
        breadcrumbItems: [],
      },
    },
  },
  rendering: {
    componentName: 'Breadcrumb',
    uid: 'mock-uid',
    params: {},
  },
  params: {},
  stylesSXA: '',
};

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
};
export default meta;

type Story = StoryObj<typeof Breadcrumb>;

// ✅ 1–2 crumbs (no collapse)
export const ShortTrail: Story = {
  args: {
    ...baseProps,
    fields: {
      data: {
        currentItem: {
          ...baseProps.fields.data.currentItem,
          breadcrumbItems: [makeCrumb(1, 'Home', '/'), makeCrumb(2, 'Section', '/section')],
        },
      },
    },
  },
};

// ✅ 4 crumbs (collapse triggered on desktop)
export const LongTrail: Story = {
  args: {
    ...baseProps,
    fields: {
      data: {
        currentItem: {
          ...baseProps.fields.data.currentItem,
          breadcrumbItems: [
            makeCrumb(1, 'Home', '/'),
            makeCrumb(2, 'Section', '/section'),
            makeCrumb(3, 'Subsection', '/section/sub'),
            makeCrumb(4, 'Deep Link', '/section/sub/deep'),
          ],
        },
      },
    },
  },
};

// ✅ With hidden crumb
export const WithHiddenCrumb: Story = {
  args: {
    ...baseProps,
    fields: {
      data: {
        currentItem: {
          ...baseProps.fields.data.currentItem,
          breadcrumbItems: [
            makeCrumb(1, 'Home', '/'),
            {
              ...makeCrumb(2, 'Hidden Section', '/hidden'),
              hideInBreadcrumbs: { jsonValue: { value: 'true' } },
            },
            makeCrumb(3, 'Visible Section', '/visible'),
          ],
        },
      },
    },
  },
};
