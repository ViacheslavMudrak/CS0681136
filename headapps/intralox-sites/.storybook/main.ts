/**
 * Storybook Phase 4 (ADR-lite): async Sitecore roots (`export async function Default`)
 * use Strategy C — stories target sync `partial/` trees or thin wrappers + mocks from
 * `src/storybook/`. Add `webpackFinal` aliases (Strategy B) only for imports that cannot
 * run in Storybook; document each alias inline. Strategy A (RSC-in-Storybook) is not the default.
 * See `docs/STORYBOOK-PHASES.md` Phase 4 (local / team copy when present).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';
import nextJsLoadConfigModule from 'next/dist/server/config.js';
import type { StorybookConfig } from '@storybook/nextjs';
import type { NextConfig } from 'next';
import webpack from 'webpack';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const STORIES_FILE =
  /\.stories\.(tsx|ts|jsx|js|mjs)$/;
const TITLE_SINGLE = /title:\s*'((?:\\'|[^'])*)'/;
const TITLE_DOUBLE = /title:\s*"((?:\\"|[^"])*)"/;

/**
 * Story index order uses `preview.tsx` `parameters.options.storySort` when the indexer can
 * extract it (object form, first matching `preview.{js,jsx,ts,tsx}`). This list still sorts CSF
 * paths by `meta.title` so `fileNameOrder` ties align with titles if a fallback is needed.
 */
function listCsfStoryPathsSortedByMetaTitle(root: string): string[] {
  const storiesRoot = path.join(root, 'src/stories');
  const hits: { rel: string; sortKey: string }[] = [];

  const walk = (dir: string) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(abs);
      } else if (ent.isFile() && STORIES_FILE.test(ent.name)) {
        const raw = fs.readFileSync(abs, 'utf8');
        const sq = raw.match(TITLE_SINGLE);
        const dq = raw.match(TITLE_DOUBLE);
        const title = (sq?.[1] ?? dq?.[1] ?? '').replace(/\\'/g, "'");
        /** Paths are relative to `.storybook/` (Storybook `main` cwd). */
        const rel = path.relative(__dirname, abs).replace(/\\/g, '/');
        hits.push({ rel, sortKey: title || ent.name });
      }
    }
  };

  walk(storiesRoot);
  hits.sort((a, b) =>
    a.sortKey.localeCompare(b.sortKey, 'en', { numeric: true, sensitivity: 'base' }),
  );
  return hits.map((h) => h.rel);
}

/**
 * Mirrors `next/dist/build/define-env` `getImageConfig` dev payload so `next/image` hostname
 * checks see `images.remotePatterns` from `next.config.ts`. Storybook does not run Next's
 * webpack pipeline, so `process.env.__NEXT_IMAGE_OPTS` is otherwise missing and defaults to
 * empty `remotePatterns`, which rejects every absolute URL (e.g. picsum mocks).
 */
function storybookNextImageOptsFromConfig(nextConfig: NextConfig) {
  const images = nextConfig.images ?? {};
  return {
    deviceSizes: images.deviceSizes,
    imageSizes: images.imageSizes,
    qualities: images.qualities,
    path: images.path,
    loader: images.loader,
    dangerouslyAllowSVG: images.dangerouslyAllowSVG,
    unoptimized: images.unoptimized,
    domains: images.domains,
    remotePatterns: images.remotePatterns,
    localPatterns: images.localPatterns,
    output: nextConfig.output,
  };
}

/**
 * Webpack `NormalModuleReplacementPlugin` matches `beforeResolve` **request** strings. The SDK
 * re-exports `NextImage` as `export { NextImage } from './components/NextImage'` — that request
 * is `./components/NextImage`, not an absolute path containing `@sitecore-content-sdk/nextjs`, so
 * a regex-only NMR never ran and Storybook kept the stock `NextImage` → `/_next/image` (broken).
 */
function storybookSitecoreNextImagePatchPlugin(
  storybookNextImageEsm: string,
  storybookNextImageCjs: string,
): webpack.WebpackPluginInstance {
  return {
    apply(compiler: webpack.Compiler) {
      compiler.hooks.normalModuleFactory.tap('StorybookSitecoreNextImagePatch', (nmf) => {
        nmf.hooks.beforeResolve.tap('StorybookSitecoreNextImagePatch', (resolveData) => {
          if (!resolveData?.request) return;
          const request = String(resolveData.request).replace(/\\/g, '/');
          const issuer = String(resolveData.contextInfo?.issuer ?? '').replace(/\\/g, '/');

          const isNextImageRequest =
            request === './components/NextImage' ||
            request === './components/NextImage.js' ||
            request.endsWith('/components/NextImage') ||
            request.endsWith('/components/NextImage.js') ||
            /[/\\]@sitecore-content-sdk[/\\]nextjs[/\\]dist[/\\]esm[/\\]components[/\\]NextImage\.js$/.test(
              request,
            ) ||
            /[/\\]@sitecore-content-sdk[/\\]nextjs[/\\]dist[/\\]cjs[/\\]components[/\\]NextImage\.js$/.test(
              request,
            );

          if (!isNextImageRequest) return;

          if (
            issuer.includes('@sitecore-content-sdk/nextjs/dist/esm') ||
            request.includes('@sitecore-content-sdk/nextjs/dist/esm')
          ) {
            resolveData.request = storybookNextImageEsm;
          } else if (
            issuer.includes('@sitecore-content-sdk/nextjs/dist/cjs') ||
            request.includes('@sitecore-content-sdk/nextjs/dist/cjs')
          ) {
            resolveData.request = storybookNextImageCjs;
          }
        });
      });
    },
  };
}

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.mdx', ...listCsfStoryPathsSortedByMetaTitle(projectRoot)],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/nextjs',
    options: {
      /** Ensures `images.remotePatterns` (e.g. picsum, Sitecore edges) apply to `next/image` in Storybook. */
      nextConfigPath: path.join(projectRoot, 'next.config.ts'),
    },
  },
  /** Absolute `from` so `/storybook/*` files resolve even if the dev server cwd differs. */
  staticDirs: [{ from: path.join(projectRoot, 'public'), to: '/' }],
  webpackFinal: async (webpackConfig) => {
    const loadConfig = nextJsLoadConfigModule.default ?? nextJsLoadConfigModule;
    const nextResolved = await loadConfig(PHASE_DEVELOPMENT_SERVER, projectRoot, undefined);
    const imageOpts = storybookNextImageOptsFromConfig(nextResolved);

    webpackConfig.plugins = webpackConfig.plugins ?? [];
    webpackConfig.plugins.push(
      new webpack.DefinePlugin({
        /** Must stay `JSON.stringify` so reserved words (e.g. `loader: "default"`) minify safely. */
        'process.env.__NEXT_IMAGE_OPTS': JSON.stringify(imageOpts),
      }),
    );

    const storybookNextImageEsm = path.join(projectRoot, 'src/patches/sitecore-nextjs-nextimage-storybook.esm.js');
    const storybookNextImageCjs = path.join(projectRoot, 'src/patches/sitecore-nextjs-nextimage-storybook.cjs.js');
    webpackConfig.plugins.push(
      storybookSitecoreNextImagePatchPlugin(storybookNextImageEsm, storybookNextImageCjs),
    );

    webpackConfig.resolve = webpackConfig.resolve ?? {};
    const existing = webpackConfig.resolve.alias;
    const alias =
      existing && typeof existing === 'object' && !Array.isArray(existing)
        ? { ...existing }
        : {};

    webpackConfig.resolve.alias = {
      ...alias,
      components: path.join(projectRoot, 'src/components'),
      lib: path.join(projectRoot, 'src/lib'),
      temp: path.join(projectRoot, 'src/temp'),
      assets: path.join(projectRoot, 'src/assets'),
      '.sitecore': path.join(projectRoot, '.sitecore'),
      /** Matches `import … from 'src/…'` used alongside tsconfig `baseUrl`. */
      src: path.join(projectRoot, 'src'),
    };

    return webpackConfig;
  },
};

export default config;
