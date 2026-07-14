import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ErrorComponent from './ErrorComponent';
import type { ErrorComponentProps } from './ErrorComponent.types';

const meta: Meta<typeof ErrorComponent> = {
  title: 'Components/Error Component',
  component: ErrorComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ErrorComponentProps>;

export const Error404WithSearchBar: Story = {
  args: {
    rendering: {
      componentName: 'ErrorComponent',
      dataSource: 'Error Component',
    },
    params: {},
    fields: {
      eyebrow: { value: '404 ERROR' },
      componentHeadline: {
        value:
          "We couldn't find the page you're looking for. It may have been moved, renamed, or removed.",
      },
      subtext: {
        value:
          'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
      },
      searchBarPlaceholderText: { value: 'Search' },
      dividerText: { value: '— or —' },
      buttonLink: {
        value: {
          href: '/',
          text: 'GO BACK TO HOME',
          target: '_self',
        },
      },
      requestAccessButton: {
        value: {
          href: 'mailto:access@example.com',
          text: 'REQUEST ACCESS',
          target: '_self',
        },
      },
    },
  },
};

export const Error500WithSearchBar: Story = {
  args: {
    rendering: {
      componentName: 'ErrorComponent',
      dataSource: 'Error Component',
    },
    params: {},
    fields: {
      eyebrow: { value: '500 ERROR' },
      componentHeadline: { value: 'Something went wrong.' },
      subtext: {
        value:
          'We are experiencing technical difficulties on our end. Our team has been notified and is working to fix the issue.',
      },
      searchBarPlaceholderText: { value: 'Search' },
      dividerText: { value: '— or —' },
      buttonLink: {
        value: {
          href: '/',
          text: 'GO BACK TO HOME',
          target: '_self',
        },
      },
      requestAccessButton: {
        value: {
          href: 'mailto:access@example.com',
          text: 'REQUEST ACCESS',
          target: '_self',
        },
      },
    },
  },
};

export const Error404WithoutSearchBar: Story = {
  args: {
    rendering: {
      componentName: 'ErrorComponent',
      dataSource: 'Error Component',
    },
    params: {},
    fields: {
      eyebrow: { value: '404 ERROR' },
      componentHeadline: { value: 'Page not found.' },
      subtext: {
        value:
          'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
      },
      searchBarPlaceholderText: { value: 'Search' },
      dividerText: { value: '— or —' },
      buttonLink: {
        value: {
          href: '/',
          text: 'GO BACK TO HOME',
          target: '_self',
        },
      },
      requestAccessButton: {
        value: {
          href: 'mailto:access@example.com',
          text: 'REQUEST ACCESS',
          target: '_self',
        },
      },
    },
  },
};

export const Error500WithoutSearchBar: Story = {
  args: {
    rendering: {
      componentName: 'ErrorComponent',
      dataSource: 'Error Component',
    },
    params: {},
    fields: {
      eyebrow: { value: '500 ERROR' },
      componentHeadline: { value: 'Something went wrong.' },
      subtext: {
        value:
          'We are experiencing technical difficulties on our end. Our team has been notified and is working to fix the issue.',
      },
      searchBarPlaceholderText: { value: 'Search' },
      dividerText: { value: '— or —' },
      buttonLink: {
        value: {
          href: '/',
          text: 'GO BACK TO HOME',
          target: '_self',
        },
      },
      requestAccessButton: {
        value: {
          href: 'mailto:access@example.com',
          text: 'REQUEST ACCESS',
          target: '_self',
        },
      },
    },
  },
};
