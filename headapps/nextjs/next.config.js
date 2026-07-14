const path = require('path');

const sassAliases = {
  '@globals': path.join(process.cwd(), './src/assets', 'globals'),
  '@fontawesome': path.join(process.cwd(), './node_modules', 'font-awesome'),
  '@assets': path.join(process.cwd(), './src/assets'),
};

const sassAliasImporter = {
  findFileUrl(url) {
    for (const [alias, aliasPath] of Object.entries(sassAliases)) {
      if (url.startsWith(alias + '/') || url === alias) {
        return new URL('file://' + url.replace(alias, aliasPath).replace(/\\/g, '/'));
      }
    }
    return null;
  },
};

/**
 * Exclude `.dev.tsx` / `.dev.ts` pages from production builds.
 * Files named `*.dev.tsx` are included in every environment except explicit PROD,
 * letting test/POC pages ship to DEV/QA/UAT for validation without reaching production.
 */
const isProd = process.env.NEXT_PUBLIC_ENV === 'PROD';
const pageExtensions = isProd
  ? ['tsx', 'ts', 'jsx', 'js']
  : ['tsx', 'ts', 'jsx', 'js', 'dev.tsx', 'dev.ts'];

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  pageExtensions,

  // Allow specifying a distinct distDir when concurrently running app in a container
  distDir: process.env.NEXTJS_DIST_DIR || '.next',

  i18n: {
    // These are all the locales you want to support in your application.
    // These should generally match (or at least be a subset of) those in Sitecore.
    locales: ['en'],
    // This is the locale that will be used when visiting a non-locale
    // prefixed path e.g. `/about`.
    defaultLocale: process.env.DEFAULT_LANGUAGE || process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
  },

  // Enable React Strict Mode
  reactStrictMode: true,

  // Disable the X-Powered-By header. Follows security best practices.
  poweredByHeader: false,

  // use this configuration to ensure that only images from the whitelisted domains
  // can be served from the Next.js Image Optimization API
  // see https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'edge*.**',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'xmc-*.**',
        port: '',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      // healthz check
      {
        source: '/healthz',
        destination: '/api/healthz',
      },
      // robots route
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
      // sitemap route
      {
        source: '/sitemap:id([\\w-]{0,}).xml',
        destination: '/api/sitemap',
      },
      // feaas api route
      {
        source: '/feaas-render',
        destination: '/api/editing/feaas/render',
      },
      //rewrite for NextAuth API calls
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  webpack: (config, options) => {
    if (!options.isServer) {
      // Add a loader to strip out getComponentServerProps from components in the client bundle
      config.module.rules.unshift({
        test: /src[\\/]components[\\/].*\.tsx$/,
        use: [path.resolve(__dirname, 'node_modules/@sitecore-content-sdk/nextjs/component-props-loader.js')],
      });

      // Prevent server-only modules from being bundled into the client.
      // These are only used at build time (getStaticProps / getComponentServerProps)
      // or in API routes, both of which run exclusively on the server.
      config.resolve.alias = {
        ...config.resolve.alias,
        [path.resolve(__dirname, 'src/lib/cache/redis')]: false,
      };
    } else {
      // Force use of CommonJS on the server for FEAAS SDK since Content SDK also uses CommonJS entrypoint to FEAAS SDK.
      // This prevents issues arising due to FEAAS SDK's dual CommonJS/ES module support on the server (via conditional exports).
      // See https://nodejs.org/api/packages.html#dual-package-hazard.
      config.externals = [
        {
          '@sitecore-feaas/clientside/react': 'commonjs @sitecore-feaas/clientside/react',
          '@sitecore/byoc': 'commonjs @sitecore/byoc',
          '@sitecore/byoc/react': 'commonjs @sitecore/byoc/react',
        },
        ...config.externals,
      ];
    }

    return config;
  },

  // Add sass settings for SXA themes and styles
  sassOptions: {
    importers: [sassAliasImporter],
    additionalData: `
      @use "@assets/mixins/_breakpoints.scss" as *;
      @use "@assets/mixins/_typography.scss" as *;
    `,
    // temporary measure until new versions of bootstrap and font-awesome released
    quietDeps: true,
    silenceDeprecations: ['import'],
  },
};

// When building for production, output a standalone app that can be run with `node server.js` (after running `next build`).
// This is required for containerized deployments.
// See https://nextjs.org/docs/advanced-features/output-file-tracing#standalone
if (process.env.NODE_ENV !== 'development') {
  nextConfig.output = 'standalone';
}

module.exports = nextConfig;
