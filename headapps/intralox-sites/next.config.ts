import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { nextImageRemotePatterns } from './src/lib/nextImageRemotePatterns';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Patched Sitecore SDK Link implementations (see `src/patches/sitecore-nextjs-link-*.js`). */
const sitecoreLinkPatchesDir = path.join(__dirname, 'src/patches');

const nextConfig: NextConfig = {
  // Allow specifying a distinct distDir when concurrently running app in a container
  distDir: process.env.NEXTJS_DIST_DIR || '.next',

  /**
   * Full-site SSG (`generateStaticParams` ~1800 routes) includes heavy belt-finder pages;
   * the default 60s limit fails under parallel prerender (Edge layout + belt tooling).
   */
  staticPageGenerationTimeout: 180,

  // Enable React Strict Mode
  reactStrictMode: true,

  /** Monorepo: point tracing at repo root so Next does not pick the wrong lockfile/workspace root. */
  outputFileTracingRoot: path.join(__dirname, '../..'),

  // Disable the X-Powered-By header. Follows security best practices.
  poweredByHeader: false,

  // use this configuration to ensure that only images from the whitelisted domains
  // can be served from the Next.js Image Optimization API
  // see https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
  images: {
    remotePatterns: [...nextImageRemotePatterns],
  },

  // use this configuration to serve the sitemap.xml and robots.txt files from the API route handlers
  rewrites: async () => {
    return [
      {
        source: '/sitemap:id([\\w-]{0,}).xml',
        destination: '/api/sitemap',
        locale: false,
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
        locale: false,
      },
    ];
  },

  /**
   * Dev-only: disable webpack filesystem cache (PackFileCacheStrategy / *.pack.gz).
   * Parallel `sitecore-tools:generate-map:watch` + `next dev`, or interrupted compiles,
   * can leave `.next/cache/webpack` in a bad state → ENOENT on pack files and
   * `TypeError: a[d] is not a function` in webpack-runtime. Production builds unaffected.
   */
  webpack: (config, { dev, webpack: webpackApi }) => {
    if (dev) {
      config.cache = false;
    }
    config.plugins.push(
      new webpackApi.NormalModuleReplacementPlugin(
        /@sitecore-content-sdk[\\/]nextjs[\\/]dist[\\/]esm[\\/]components[\\/]Link\.js$/,
        path.join(sitecoreLinkPatchesDir, 'sitecore-nextjs-link-esm.js'),
      ),
      new webpackApi.NormalModuleReplacementPlugin(
        /@sitecore-content-sdk[\\/]nextjs[\\/]dist[\\/]cjs[\\/]components[\\/]Link\.js$/,
        path.join(sitecoreLinkPatchesDir, 'sitecore-nextjs-link-cjs.js'),
      ),
    );
    return config;
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
