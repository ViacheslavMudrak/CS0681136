import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import GatedContent from './GatedContent';
import type { GatedContentProps } from './GatedContent.types';

const meta: Meta<typeof GatedContent> = {
  title: 'Components/Gated Content',
  component: GatedContent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<GatedContentProps>;

export const Default: Story = {
  args: {
    rendering: {
      componentName: 'GatedContent',
      dataSource: 'Gated Content',
    },
    params: {},
    fields: {
      eyebrow: { value: 'Access restricted' },
      componentHeadline: {
        value: 'The content you are trying to view requires specific permissions.',
      },
      subtext: {
        value:
          'If you believe you should have access, please submit a request using the official form below.',
      },
      dividerText: { value: '— or —' },
      requestLink: {
        value: {
          href: '/',
          text: 'Request Access',
          target: '_self',
        },
      },
      ctaLink: {
        value: {
          href: '/',
          text: 'Go to home',
          target: '_self',
        },
      },
    },
  },
};
