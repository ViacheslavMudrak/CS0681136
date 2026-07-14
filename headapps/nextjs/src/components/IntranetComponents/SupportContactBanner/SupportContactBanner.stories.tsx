// SupportContactBanner.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SupportContactBanner from './SupportContactBanner';
import type { SupportContactBannerProps } from './SupportContactBanner.types';

const meta: Meta<typeof SupportContactBanner> = {
  title: 'Components/Support Contact Banner',
  component: SupportContactBanner,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<SupportContactBannerProps>;

export const Primary: Story = {
  args: {
    rendering: {
      uid: 'mock-uid',
      componentName: 'SupportContactBanner',
      dataSource: 'mock-datasource',
      params: {},
      placeholders: {},
      fields: {},
    },
    params: {},
    fields: {
      data: {
        datasource: {
          optionalEyebrow: { jsonValue: { value: 'Get in Contact' } },
          headlineText: {
            jsonValue: { value: 'Looking for support from our team? Reach out with your request.' },
          },
          children: {
            results: [
              {
                contactName: { jsonValue: { value: 'Admin Assistant' } },
                linkIcon: { targetItem: { value: { value: 'Mail' } } },
                linkUrl: {
                  jsonValue: {
                    value: {
                      href: 'mailto:adminassistant@email.com',
                      text: 'adminassistant@email.com',
                      target: '_blank',
                    },
                  },
                },
              },
              {
                contactName: { jsonValue: { value: 'Admin Phone' } },
                linkIcon: {
                  targetItem: { value: { value: 'HeadsetMic' } },
                },
                linkUrl: {
                  jsonValue: {
                    value: {
                      href: 'tel:+5555555555',
                      text: '+1 (555) 555-5555',
                      target: '_self',
                    },
                  },
                },
              },
              {
                contactName: { jsonValue: { value: 'Live Chat' } },
                linkIcon: {
                  targetItem: { value: { value: 'QuestionAnswer' } },
                },
                linkUrl: {
                  jsonValue: {
                    value: {
                      href: '/chat',
                      text: 'Start a Chat',
                      target: '_self',
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
};
