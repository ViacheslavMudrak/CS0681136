// Storybook-only image utilities
// These images are only available in Storybook, not in the Next.js application

export const STORYBOOK_IMAGES = {
  // Hero backgrounds
  heroBackgrounds: {
    default: '/images/detail-hero-default-storybook.png',
    blue: '/images/sample-hero-blue-bg.svg',
    green: '/images/sample-hero-green-bg.svg',
    marketNewsBackground: '/images/market-news-hero-background.png',
    collab: '/images/collab-site-hero-bg.png',
  },

  //Banner backgrounds
  bannerBackgrounds: {
    default: '/images/banner-background-dark-blue.png',
  },

  // Profile/People images
  profiles: {
    person1: '/images/sample-person-1.jpg',
    person2: '/images/sample-person-2.jpg',
    person3: '/images/sample-person-3.jpg',
    group: '/images/sample-group.jpg',
  },

  // Content images
  content: {
    news1: '/images/sample-news-1.jpg',
    news2: '/images/sample-news-2.jpg',
    sampledoctor1: '/images/sample-doctor-1.png',
  },

  // Icons and logos
  icons: {
    companyLogo: '/images/sample-company-logo.svg',
    placeholder: '/images/sample-placeholder.svg',
  },

  // Placeholders with different aspect ratios
  placeholders: {
    banner: '/images/placeholder-banner.svg',
  },
} as const;

/**
 * Helper function to create Sitecore ImageField structure for Storybook
 */
export function createStorybookImageField(
  src: string,
  alt: string = 'Sample image',
  width: number = 1920,
  height: number = 1080
) {
  return {
    value: {
      src,
      alt,
      width,
      height,
    },
  };
}

/**
 * Helper function to create Sitecore ImageReferenceItem for Storybook
 */
export function createStorybookImageReference(
  src: string,
  alt: string = 'Sample image',
  width: number = 1920,
  height: number = 1080
) {
  return {
    fields: {
      image: createStorybookImageField(src, alt, width, height),
    },
    name: 'CTA Banner BG Image'
  };
}

/**
 * Check if we're running in Storybook environment
 */
export const isStorybook =
  typeof window !== 'undefined' && (window as any).__STORYBOOK_CLIENT_API__;
