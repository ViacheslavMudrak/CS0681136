import type { Preview } from '@storybook/nextjs';
import type { Page } from '@sitecore-content-sdk/nextjs';
import { SitecoreProvider } from '@sitecore-content-sdk/nextjs';
import { ImageConfigContext } from 'next/dist/shared/lib/image-config-context.shared-runtime';
import { imageConfigDefault } from 'next/dist/shared/lib/image-config';

import componentMap from '.sitecore/component-map.client';
import scConfig from '../sitecore.config';
import { nextImageRemotePatterns } from '../src/lib/nextImageRemotePatterns';

import '@laitram-l-l-c/intralox-tailwind-config/css/fonts.css';
import 'swiper/css';
import '../src/app/globals.css';

/**
 * Baseline XM page for Storybook: SDK field components (`NextImage`, etc.) read
 * `SitecoreProviderReactContext` and expect `page.mode` (including `isNormal`). Without a
 * provider, `context.page` is undefined and the iframe can hang on the loading spinner.
 */
const storybookSitecorePageBase = {
  siteName: 'Storybook',
  mode: { isNormal: true, isEditing: false, isPreview: false },
  layout: {
    sitecore: {
      route: {
        itemId: '11111111-1111-1111-1111-111111111111',
        itemLanguage: 'en',
        name: 'Storybook page',
      },
      context: { variantId: '' },
    },
  },
} as unknown as Page;

function storybookSitecorePageFromContext(context: { args?: Record<string, unknown> }): Page {
  const partial = context.args?.page as Page | undefined;
  if (!partial) {
    return storybookSitecorePageBase;
  }
  const mode = {
    ...storybookSitecorePageBase.mode,
    ...(partial.mode ?? {}),
  };
  const isNormal =
    typeof mode.isNormal === 'boolean'
      ? mode.isNormal
      : !Boolean(mode.isEditing || mode.isPreview);
  return {
    ...storybookSitecorePageBase,
    ...partial,
    mode: { ...mode, isNormal },
  } as Page;
}

/** Aligns with XM Cloud component standards (section 16): 320, 768, 992, 1440. */
const intraloxViewports = {
  intralox320: {
    name: '320',
    styles: { width: '320px', height: '100%' },
    type: 'mobile' as const,
  },
  intralox768: {
    name: '768',
    styles: { width: '768px', height: '100%' },
    type: 'tablet' as const,
  },
  intralox992: {
    name: '992',
    styles: { width: '992px', height: '100%' },
    type: 'desktop' as const,
  },
  intralox1440: {
    name: '1440',
    styles: { width: '1440px', height: '100%' },
    type: 'desktop' as const,
  },
};

/**
 * `next/image` reads `ImageConfigContext` when `process.env.__NEXT_IMAGE_OPTS` is missing in a
 * chunk (common in Storybook dev with split vendors). Keeps hostname checks aligned with
 * `next.config.ts` via {@link nextImageRemotePatterns}.
 */
const storybookImageConfig = {
  ...imageConfigDefault,
  remotePatterns: [...nextImageRemotePatterns],
  /** Storybook has no `/_next/image`; keeps `next/image` aligned when a chunk lacks `__NEXT_IMAGE_OPTS`. */
  unoptimized: true,
};

const preview: Preview = {
  decorators: [
    (Story, context) => (
      <div lang="en">
        <ImageConfigContext.Provider value={storybookImageConfig}>
          <SitecoreProvider
            api={scConfig.api}
            componentMap={componentMap}
            page={storybookSitecorePageFromContext(context)}
          >
            <Story />
          </SitecoreProvider>
        </ImageConfigContext.Provider>
      </div>
    ),
  ],
  initialGlobals: {
    viewport: { value: 'intralox1440', isRotated: false },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      options: intraloxViewports,
    },
    backgrounds: {
      default: 'canvas',
      values: [
        { name: 'canvas', value: '#fafafa' },
        { name: 'white', value: '#ffffff' },
        /** Design token `--color-surface-muted` / `bg-surface-muted` */
        { name: 'light gray', value: '#f7f7f7' },
      ],
    },
    /**
     * Required for any story that mounts components using `next/navigation`
     * (e.g. Content Switcher tabs, local navigation, media client).
     * @see https://storybook.js.org/docs/get-started/frameworks/nextjs#nextjs-navigation
     */
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/solutions',
        query: {},
      },
      /**
       * Storybook is not a full Next.js server: `/_next/image` optimization can hang or never resolve,
       * which looks like an endless image “loader”. Use direct URLs in the canvas (production is unchanged).
       * @see https://storybook.js.org/docs/get-started/frameworks/nextjs#parameters
       */
      image: {
        unoptimized: true,
      },
    },
    /**
     * Sidebar + story index order: Storybook reads the first existing `preview.{js,jsx,ts,tsx}`.
     * A shim `preview.ts` that only re-exports `preview.tsx` prevented static extraction of
     * `storySort` from the indexer, so the UI fell back to discovery order. Use an **object**
     * `storySort` here (not a TS-annotated function) so `getStorySortParameter` can serialize it.
     *
     * @see https://storybook.js.org/docs/api/parameters#optionsstorysort
     */
    options: {
      storySort: {
        method: 'alphabetical',
        locales: 'en',
      },
    },
  },
};

export default preview;
