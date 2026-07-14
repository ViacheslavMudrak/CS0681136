import type { Meta, StoryObj } from '@storybook/react';
import ReflectionDetailHeader from './ReflectionDetailHeader';
import type {
  ReflectionDetailHeaderProps,
  ReflectionDetailHeaderFields,
} from './ReflectionDetailHeader.types';

const meta: Meta<ReflectionDetailHeaderProps> = {
  title: 'Components/Reflection Detail Header',
  component: ReflectionDetailHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<ReflectionDetailHeaderProps>;

// Helper to create rendering props with reflection data
// Note: The headline (publishDate) is now pulled from the page context on reflection detail pages
const createRenderingWithReflection = (
  label: string,
  googleSlideFile?: { href: string; text: string; target?: string },
  pdfFile?: { href: string; text: string; target?: string }
): Partial<ReflectionDetailHeaderProps> => ({
  rendering: {
    componentName: 'ReflectionDetailHeader',
    dataSource: 'reflection-detail-header-datasource',
    uid: 'reflection-detail-header-container',
    params: {},
  },
  fields: {
    label: {
      value: label,
    },
    googleSlideFile: {
      value: googleSlideFile || {},
    },
    pdfFile: {
      value: pdfFile || {},
    },
  } as ReflectionDetailHeaderFields,
});

/**
 * Scenario 1: User is on the Reflection details looking at the Breadcrumb
 * Result: User sees an ellipses followed by the Parent page then date of the reflection
 *
 * Scenario 3: User is looking at the header
 * Result: The user sees Label, Headline (Reflection Date from page context) and on right we see an option for Google Slide, PDF, and Like the reflection
 * Note: The headline date is pulled from the publishDate field of the reflection detail page context
 */
export const Default: Story = {
  args: createRenderingWithReflection(
    "TODAY'S REFLECTION",
    {
      href: 'https://docs.google.com/presentation/d/1SLfwdcrKqWDgh_Wi1zxJC-F3n1VnPiLrjp1EPe1lSkw/edit',
      text: 'Google Slide',
      target: '_blank',
    },
    {
      href: 'https://drive.google.com/file/d/1kkmPr1seXgxdaZDFWA7b4SsxThwRlZbw/view',
      text: 'PDF',
      target: '_blank',
    }
  ),
};

/**
 * Scenario 2: User clicks on the ellipses
 * Result: User sees an expanded breadcrumb of grandparent/parent pages
 * Note: MUI Breadcrumbs handles expansion automatically on click
 */
export const LongBreadcrumbTrail: Story = {
  args: createRenderingWithReflection(
    "TODAY'S REFLECTION",
    {
      href: 'https://docs.google.com/presentation/d/1SLfwdcrKqWDgh_Wi1zxJC-F3n1VnPiLrjp1EPe1lSkw/edit',
      text: 'Google Slide',
      target: '_blank',
    },
    {
      href: 'https://drive.google.com/file/d/1kkmPr1seXgxdaZDFWA7b4SsxThwRlZbw/view',
      text: 'PDF',
      target: '_blank',
    }
  ),
};

/**
 * Header display with all action buttons
 * Result: Label, Headline (Date from page context), and action buttons (Google Slide, PDF, Like count)
 */
export const WithAllActions: Story = {
  args: createRenderingWithReflection(
    "TODAY'S REFLECTION",
    {
      href: 'https://docs.google.com/presentation/d/1SLfwdcrKqWDgh_Wi1zxJC-F3n1VnPiLrjp1EPe1lSkw/edit',
      text: 'Google Slide',
      target: '_blank',
    },
    {
      href: 'https://drive.google.com/file/d/1kkmPr1seXgxdaZDFWA7b4SsxThwRlZbw/view',
      text: 'PDF',
      target: '_blank',
    }
  ),
};

/**
 * Scenario 4: Google Slide link opens in new tab
 * Result: Click Google Slide icon/text opens external link in new tab
 */
export const WithGoogleSlideOnly: Story = {
  args: createRenderingWithReflection(
    "TODAY'S REFLECTION",
    {
      href: 'https://docs.google.com/presentation/d/1SLfwdcrKqWDgh_Wi1zxJC-F3n1VnPiLrjp1EPe1lSkw/edit',
      text: 'Google Slide',
      target: '_blank',
    },
    undefined
  ),
};

/**
 * Scenario 5: PDF link available
 * Result: Click PDF icon/text opens Google Drive PDF
 */
export const WithPDFOnly: Story = {
  args: createRenderingWithReflection("TODAY'S REFLECTION", undefined, {
    href: 'https://drive.google.com/file/d/1kkmPr1seXgxdaZDFWA7b4SsxThwRlZbw/view',
    text: 'PDF',
    target: '_blank',
  }),
};

/**
 * Mobile Scenario 1: Mobile responsive layout
 * Result: Same as Desktop except condensed, breadcrumb shows max 2 items
 */
export const MobileView: Story = {
  args: createRenderingWithReflection(
    "TODAY'S REFLECTION",
    {
      href: 'https://docs.google.com/presentation/d/sample',
      text: 'Google Slide',
      target: '_blank',
    },
    {
      href: 'https://drive.google.com/file/d/sample/view',
      text: 'PDF',
      target: '_blank',
    }
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Without any action links
 */
export const NoActions: Story = {
  args: createRenderingWithReflection("TODAY'S REFLECTION", undefined, undefined),
};

/**
 * Custom label text
 */
export const CustomLabel: Story = {
  args: createRenderingWithReflection(
    'DAILY MEDITATION',
    {
      href: 'https://docs.google.com/presentation/d/sample',
      text: 'Google Slide',
      target: '_blank',
    },
    {
      href: 'https://drive.google.com/file/d/sample/view',
      text: 'PDF',
      target: '_blank',
    }
  ),
};
