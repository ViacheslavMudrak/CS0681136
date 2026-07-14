import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import NotificationBanner from './NotificationBanner';
import type { NotificationBannerProps } from './NotificationBanner.types';

const meta: Meta<NotificationBannerProps> = {
  title: 'Components/Notification Banner',
  component: NotificationBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<NotificationBannerProps>;

// Helper to create rendering props with banner data
const createRenderingWithBanners = (
  banners: Array<Record<string, unknown>>
): Partial<NotificationBannerProps> =>
  ({
    rendering: {
      componentName: 'NotificationBanner',
      dataSource: 'notification-banner-container',
      uid: 'notification-banner-container',
      params: {},
      fields: {
        data: {
          matches: {
            ancestors: [
              {
                id: 'site-root',
                name: 'Site',
                notificationBanners: {
                  targetItems: banners,
                },
              },
            ],
          },
        },
      },
    } as never,
  }) as Partial<NotificationBannerProps>;

/**
 * Scenario 1: Single Negative banner with dismiss enabled
 * Dark red circular icon, light red background, black text, dark red CTA and X
 */
export const NegativeWithDismiss: Story = {
  args: createRenderingWithBanners([
    {
      id: 'banner-1',
      name: 'Emergency Banner',
      bannerText: {
        jsonValue: {
          value:
            '<p>Emergency maintenance scheduled. All systems will be offline from 2:00 AM to 4:00 AM EST.</p>',
        },
      },
      buttonLink: {
        jsonValue: {
          value: {
            href: '/maintenance-details',
            text: 'View Details',
            target: '',
          },
        },
      },
      notificationLevel: {
        jsonValue: {
          value: 'Alert',
        },
      },
      allowUserToDismiss: {
        jsonValue: {
          value: true,
        },
      },
    },
  ]),
};

/**
 * Scenario 2: Warning banner with dismiss enabled
 * Dark yellow triangle icon, light yellow background, black text, dark yellow CTA and X
 */
export const WarningWithDismiss: Story = {
  args: createRenderingWithBanners([
    {
      id: 'banner-2',
      name: 'Warning Banner',
      bannerText: {
        jsonValue: {
          value:
            '<p>Some services may experience slower response times during peak hours today.</p>',
        },
      },
      buttonLink: {
        jsonValue: {
          value: {
            href: '/service-status',
            text: 'Check Status',
            target: '',
          },
        },
      },
      notificationLevel: {
        jsonValue: {
          value: 'Warning',
        },
      },
      allowUserToDismiss: {
        jsonValue: {
          value: true,
        },
      },
    },
  ]),
};

/**
 * Scenario 3: Informational banner with dismiss enabled
 * Dark blue circular icon, light blue background, black text, dark blue CTA and X
 */
export const InformationalWithDismiss: Story = {
  args: createRenderingWithBanners([
    {
      id: 'banner-3',
      name: 'Info Banner',
      bannerText: {
        jsonValue: {
          value:
            "<p>New features have been added to the portal. Check out what's new in our latest update.</p>",
        },
      },
      buttonLink: {
        jsonValue: {
          value: {
            href: '/whats-new',
            text: 'Learn More',
            target: '',
          },
        },
      },
      notificationLevel: {
        jsonValue: {
          value: 'Informational',
        },
      },
      allowUserToDismiss: {
        jsonValue: {
          value: true,
        },
      },
    },
  ]),
};

/**
 * Scenario 4: Positive banner with dismiss enabled
 * Dark green circular icon, light green background, black text, dark green CTA and X
 */
export const PositiveWithDismiss: Story = {
  args: createRenderingWithBanners([
    {
      id: 'banner-4',
      name: 'Success Banner',
      bannerText: {
        jsonValue: {
          value: '<p>Your changes have been saved successfully. All systems are operational.</p>',
        },
      },
      buttonLink: {
        jsonValue: {
          value: {
            href: '/dashboard',
            text: 'Go to Dashboard',
            target: '',
          },
        },
      },
      notificationLevel: {
        jsonValue: {
          value: 'Positive',
        },
      },
      allowUserToDismiss: {
        jsonValue: {
          value: true,
        },
      },
    },
  ]),
};

/**
 * Scenario 5: Banner without dismiss button
 */
export const WithoutDismiss: Story = {
  args: createRenderingWithBanners([
    {
      id: 'banner-5',
      name: 'No Dismiss Banner',
      bannerText: {
        jsonValue: {
          value: '<p>Critical system update in progress. Please do not refresh your browser.</p>',
        },
      },
      buttonLink: {
        jsonValue: {
          value: {
            href: '/updates',
            text: 'More Info',
            target: '',
          },
        },
      },
      notificationLevel: {
        jsonValue: {
          value: 'Alert',
        },
      },
      allowUserToDismiss: {
        jsonValue: {
          value: false,
        },
      },
    },
  ]),
};

/**
 * Scenario 6: Banner without CTA button
 */
export const WithoutCTA: Story = {
  args: createRenderingWithBanners([
    {
      id: 'banner-6',
      name: 'No CTA Banner',
      bannerText: {
        jsonValue: {
          value: '<p>Thank you for using our services. Have a great day!</p>',
        },
      },
      buttonLink: {
        jsonValue: {
          value: {},
        },
      },
      notificationLevel: {
        jsonValue: {
          value: 'Positive',
        },
      },
      allowUserToDismiss: {
        jsonValue: {
          value: true,
        },
      },
    },
  ]),
};

/**
 * Scenario 7: Multiple banners stacked
 */
export const MultipleBannersStacked: Story = {
  args: createRenderingWithBanners([
    {
      id: 'banner-7a',
      name: 'Negative Banner',
      bannerText: {
        jsonValue: {
          value: '<p>System alert: Emergency maintenance in progress.</p>',
        },
      },
      buttonLink: {
        jsonValue: {
          value: {
            href: '/emergency',
            text: 'Details',
            target: '',
          },
        },
      },
      notificationLevel: {
        jsonValue: {
          value: 'Alert',
        },
      },
      allowUserToDismiss: {
        jsonValue: {
          value: true,
        },
      },
    },
    {
      id: 'banner-7b',
      name: 'Warning Banner',
      bannerText: {
        jsonValue: {
          value: '<p>Some features may be temporarily unavailable.</p>',
        },
      },
      buttonLink: {
        jsonValue: {
          value: {
            href: '/status',
            text: 'Status Page',
            target: '',
          },
        },
      },
      notificationLevel: {
        jsonValue: {
          value: 'Warning',
        },
      },
      allowUserToDismiss: {
        jsonValue: {
          value: true,
        },
      },
    },
    {
      id: 'banner-7c',
      name: 'Info Banner',
      bannerText: {
        jsonValue: {
          value: '<p>New features are now available in your account.</p>',
        },
      },
      buttonLink: {
        jsonValue: {
          value: {
            href: '/features',
            text: 'Learn More',
            target: '',
          },
        },
      },
      notificationLevel: {
        jsonValue: {
          value: 'Informational',
        },
      },
      allowUserToDismiss: {
        jsonValue: {
          value: true,
        },
      },
    },
  ]),
};

/**
 * Scenario 8: No banners (empty state)
 */
export const NoBanners: Story = {
  args: createRenderingWithBanners([]),
};
