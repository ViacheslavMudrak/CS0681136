// ExternalLinkBanner.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import ExternalLinkBanner from './ExternalLinkBanner';
import type { ExternalLinkBannerProps } from './ExternalLinkBanner.types';

const meta: Meta<typeof ExternalLinkBanner> = {
  title: 'Components/ExternalLinkBanner',
  component: ExternalLinkBanner,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<ExternalLinkBannerProps>;

export const Primary: Story = {
  args: {
    fields: {
      optionalEyebrow: { value: 'Keep working' },
      mainText: {
        value:
          'Get what you need outside of Our Ascension. You can still access resources directly.',
      },
      icon1Image: {
        value: {
          src: '/images/external-compay-logo-1.png',
          alt: 'UKG',
        },
      },
      icon1Description: {
        value: 'Visit UKG for help with lorem, ipsum, and dolor.',
      },
      icon1Button: {
        value: {
          href: 'https://www.google.com',
          text: 'Go to UKG',
          target: '_blank',
        },
      },
      icon2Image: {
        value: {
          src: '/images/external-compay-logo-2.png',
          alt: 'Oracle Logo',
        },
      },
      icon2Description: {
        value: 'Visit Oracle for help with lorem, ipsum, and dolor.',
      },
      icon2Button: {
        value: {
          href: 'https://www.google.com',
          text: 'Go to Oracle',
          target: '_blank',
        },
      },
    },
    params: {
      showLogos: '1',
    },
    rendering: {
      uid: 'ExternalLinkBanner-MockRendering',
      componentName: 'ExternalLinkBanner',
      dataSource: 'MockDataSource',
      params: {},
      fields: {},
    },
    stylesSXA: '',
  },
};
