/**
 * Single source of truth for `next/image` remote host allowlisting.
 * Used by `next.config.ts` and Storybook (`ImageConfigContext`) so mocks (e.g. picsum) and
 * Sitecore edges stay aligned without duplicating edits in two places.
 */
export const nextImageRemotePatterns = [
  {
    protocol: 'https' as const,
    hostname: 'edge*.**',
    port: '',
  },
  {
    protocol: 'https' as const,
    hostname: 'edge.sitecorecloud.io',
    pathname: '/**',
  },
  {
    protocol: 'https' as const,
    hostname: 'edge-platform.sitecorecloud.io',
    pathname: '/**',
  },
  {
    protocol: 'https' as const,
    hostname: '*.sitecorecloud.io',
    pathname: '/**',
  },
  {
    protocol: 'https' as const,
    hostname: '**.sitecorecontenthub.cloud',
    pathname: '/**',
  },
  {
    protocol: 'https' as const,
    hostname: 'xmc-*.**',
    port: '',
  },
  {
    protocol: 'https' as const,
    hostname: 'picsum.photos',
    pathname: '/**',
  },
  {
    protocol: 'https' as const,
    hostname: '*.sitecorecontenthub.cloud',
    pathname: '/**',
  },
];
