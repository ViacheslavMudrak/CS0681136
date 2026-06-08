/* eslint-disable @typescript-eslint/no-require-imports */
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Allow specifying a distinct distDir when concurrently running app in a container
  distDir: process.env.NEXTJS_DIST_DIR || ".next",

  // Enable React Strict Mode
  reactStrictMode: true,

  // Disable the X-Powered-By header. Follows security best practices.
  poweredByHeader: false,

  // TypeScript configuration
  // Note: TypeScript only has errors, not warnings. Build will fail on TypeScript errors.
  typescript: {
    // Don't ignore TypeScript errors - we want to catch actual errors
    ignoreBuildErrors: false
  },

  // ESLint configuration
  // Disable ESLint during builds since we have a separate lint command
  // This prevents ESLint warnings from failing the build
  eslint: {
    // Ignore ESLint during builds - use 'npm run lint' separately for linting
    ignoreDuringBuilds: true
  },

  // Webpack configuration to resolve .sitecore path for all runtimes
  webpack: (config, { isServer }) => {
    const path = require("path");

    // Ensure .sitecore paths resolve correctly for both server and client
    config.resolve.alias = {
      ...config.resolve.alias,
      ".sitecore": path.resolve(__dirname, ".sitecore")
    };

    // Allow importing CSS files from node_modules
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".css": [".css"]
    };

    return config;
  },

  // use this configuration to ensure that only images from the whitelisted domains
  // can be served from the Next.js Image Optimization API
  // see https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
  images: {
    // Bypass built-in optimizer for XM Cloud media (see src/lib/sitecore-next-image-loader.ts).
    loader: "custom",
    loaderFile: "./src/lib/sitecore-next-image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "edge*.**",
        port: ""
      },
      {
        protocol: "https",
        hostname: "lllc-d-001*.**",
        port: ""
      },
      {
        protocol: "https",
        hostname: "xmc-*.**",
        port: ""
      },
      {
        protocol: "https",
        hostname: "*.sitecorecloud.io",
        port: ""
      },
      {
        protocol: "https",
        hostname: "**.sitecorecontenthub.cloud",
        port: ""
      },
      {
        protocol: "https",
        hostname: "www.figma.com",
        port: "",
        pathname: "/api/mcp/asset/**"
      }
    ]
  },

  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        source: "/:path*\\.(svg|png|jpg|jpeg|gif|webp|ico|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      }
    ];
  },

  // use this configuration to serve the sitemap.xml and robots.txt files from the API route handlers
  rewrites: async () => {
    return [
      {
        source: "/sitemap:id([\\w-]{0,}).xml",
        destination: "/api/sitemap",
        locale: false
      },
      {
        source: "/robots.txt",
        destination: "/api/robots",
        locale: false
      }
    ];
  }
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
