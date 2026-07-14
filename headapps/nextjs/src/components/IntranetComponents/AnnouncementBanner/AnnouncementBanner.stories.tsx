import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import AnnouncementBanner, { DarkTheme } from './AnnouncementBanner';
import type { AnnouncementBannerProps, AnnouncementBannerFields } from './AnnouncementBanner.types';

const meta: Meta<AnnouncementBannerProps> = {
  title: 'Components/Announcement Banner',
  component: AnnouncementBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<AnnouncementBannerProps>;

// Helper to create rendering props with announcement data
const createRenderingWithAnnouncement = (
  bannerContent: string,
  buttonLink?: { href: string; text: string; target?: string },
  params: Record<string, string> = {}
): Partial<AnnouncementBannerProps> =>
  ({
    rendering: {
      componentName: 'AnnouncementBanner',
      dataSource: 'announcement-banner-datasource',
      uid: 'announcement-banner-container',
      params,
      fields: {
        bannerContent: {
          value: bannerContent,
        },
        buttonLink: {
          value: buttonLink || {},
        },
      } as AnnouncementBannerFields,
    } as never,
  }) as Partial<AnnouncementBannerProps>;

/**
 * Scenario 1: User is viewing the 'Announcement Banner'
 * Result: User can view the News Icon, Configured Message, and Text Link
 */
export const DefaultAnnouncementBanner: Story = {
  args: createRenderingWithAnnouncement('<p>IMPORTANT ANNOUNCEMENT TEXT WOULD GO HERE</p>', {
    href: '/news',
    text: 'TEXT LINK',
  }),
};

/**
 * Scenario 2: User hovers over the text link
 * Result: Text link font color darkens slightly
 */
export const HoverTextLink: Story = {
  args: createRenderingWithAnnouncement('<p>Hover over the text link to see the color change</p>', {
    href: '/news',
    text: 'HOVER ME',
  }),
};

/**
 * Scenario 3: User clicks on the 'Text Link'
 * Result: User is navigated to the configured URL
 */
export const ClickableLink: Story = {
  args: createRenderingWithAnnouncement(
    '<p>Click the link to navigate to the configured page</p>',
    { href: 'https://www.example.com', text: 'LEARN MORE', target: '_blank' }
  ),
};

/**
 * Scenario 4: The content author has configured a lengthy announcement
 * Result: Truncate the announcement before it reaches the text link
 */
export const LengthyAnnouncement: Story = {
  args: createRenderingWithAnnouncement(
    '<p>This is a very long announcement message that demonstrates how the component handles lengthy text content. The announcement should be truncated before it reaches the text link to maintain proper layout and readability. This ensures that the text link is always visible and accessible to users regardless of the announcement length.</p>',
    { href: '/more-info', text: 'READ MORE' }
  ),
};

/**
 * Mobile Scenario 1: User is viewing the 'News Announcement' banner on a mobile device
 * Result: User can view the same elements. If needed, wrap to second line, then truncate.
 */
export const MobileView: Story = {
  args: createRenderingWithAnnouncement(
    '<p>This announcement demonstrates mobile responsiveness. On smaller screens, the text can wrap to a second line before being truncated.</p>',
    { href: '/mobile-news', text: 'VIEW' }
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Announcement without link
 */
export const NoLink: Story = {
  args: createRenderingWithAnnouncement('<p>This announcement has no action link</p>'),
};

/**
 * Empty state (no announcements)
 */
export const NoAnnouncements: Story = {
  args: createRenderingWithAnnouncement(''),
};

/**
 * Dark Theme: Default announcement banner with dark background
 * Result: User can view white text on blue background
 */
export const DarkThemeDefault: Story = {
  render: (args) => <DarkTheme {...args} />,
  args: createRenderingWithAnnouncement('<p>IMPORTANT ANNOUNCEMENT TEXT WOULD GO HERE</p>', {
    href: '/news',
    text: 'Text link',
  }),
};

/**
 * Dark Theme: Lengthy announcement
 * Result: Text truncates before reaching the link, with white text on blue background
 */
export const DarkThemeLengthy: Story = {
  render: (args) => <DarkTheme {...args} />,
  args: createRenderingWithAnnouncement(
    '<p>This is a very long announcement message that demonstrates how the component handles lengthy text content in dark theme. The announcement should be truncated before it reaches the text link to maintain proper layout and readability. This ensures that the text link is always visible and accessible to users regardless of the announcement length.</p>',
    { href: '/more-info', text: 'READ MORE' }
  ),
};

/**
 * Dark Theme: Mobile view
 * Result: Responsive dark theme banner on mobile devices
 */
export const DarkThemeMobile: Story = {
  render: (args) => <DarkTheme {...args} />,
  args: createRenderingWithAnnouncement(
    '<p>This dark theme announcement demonstrates mobile responsiveness. On smaller screens, the text can wrap to a second line before being truncated.</p>',
    { href: '/mobile-news', text: 'VIEW' }
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Dark Theme: No link
 * Result: Dark theme banner without action link
 */
export const DarkThemeNoLink: Story = {
  render: (args) => <DarkTheme {...args} />,
  args: createRenderingWithAnnouncement('<p>This dark theme announcement has no action link</p>'),
};

/**
 * IE-1633: Home page prompt for users with no News Home Site
 * Rendered when `showOnlyForUnknownHomeSiteUsers` is checked AND the user's home site
 * is None/Unknown. Storybook has no NextAuth session, so `session?.newsHomeSite` is
 * undefined and the banner renders (treated as unknown).
 */
export const DarkThemeUnknownHomeSitePrompt: Story = {
  render: (args) => <DarkTheme {...args} />,
  args: createRenderingWithAnnouncement(
    '<p>Curate the news you want to see by selecting news topics in your settings.</p>',
    { href: '/account#accountSettings', text: 'GO TO SETTINGS' },
    { showOnlyForUnknownHomeSiteUsers: '1' }
  ),
};
