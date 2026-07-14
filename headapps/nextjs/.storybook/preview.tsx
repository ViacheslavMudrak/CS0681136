import { I18nProvider } from 'next-localization';
import React from 'react';
import { FunctionComponent } from 'react';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { SessionProvider } from 'next-auth/react';
import { SitecoreProvider } from '@sitecore-content-sdk/nextjs';
import type { Preview } from '@storybook/nextjs-vite';
import type { Page } from '@sitecore-content-sdk/nextjs';

import theme from '../src/theme/shared/src';

import '../src/assets/storybook-only/material-icons.scss';
import '../src/components/common/Icon/MaterialIcon.module.scss';
import '../src/assets/main.scss';

// Mock Sitecore configuration for Storybook
const scConfig = {
  api: {},
};

const defaultDict = {
  RelatedPagesEditModeMessageNoPagesFound: 'No related pages found',
};

const defaultPage: Page = {
  mode: {
    isEditing: false,
    isPreview: false,
    isDesignLibrary: false,
    isNormal: true,
    designLibrary: { isVariantGeneration: false },
    name: null as unknown as any,
  },
  layout: {
    sitecore: {
      route: { itemId: 'storybook-item-id' } as any,
      context: {
        itemPath: '/sitecore/test',
      },
    },
  },
  locale: 'en',
};

// Component map for Sitecore provider
const fakeComponentMap: Map<string, FunctionComponent> = new Map([
  ['DummyComponent', () => <div>Dummy Component</div>],
]);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  decorators: [
    (Story, context) => {
      // Check if story has mock tags parameter
      const mockTags = context.parameters?.mockTags;

      // Create page object based on whether mock tags are present
      let pageToUse: Page;

      if (mockTags !== undefined) {
        // Story needs mock tags - create a new page object with tags
        pageToUse = {
          ...defaultPage,
          ...context.args.page,
          layout: {
            sitecore: {
              route: {
                itemId: 'mock-item-id',
                fields: {
                  areaTags: [],
                  topicTags: mockTags,
                  contentTags: [],
                },
              } as any,
              context: {
                itemPath: '/sitecore/test',
                landingPageSettings: {
                  newsLandingPage: {
                    url: '/news',
                  },
                  reflectionLandingPage: {
                    url: '/reflections',
                  },
                },
                scriptSettings: {
                  globalScriptsInHead: [],
                  globalScriptsInBody: [],
                },
              },
            },
          },
        } as Page;
      } else {
        // No mock tags - use default page behavior
        pageToUse = { ...defaultPage, ...context.args.page } as Page;
      }

      return (
        <>
          <SessionProvider session={null}>
            <SitecoreProvider
              componentMap={fakeComponentMap}
              api={scConfig.api as unknown as any}
              page={pageToUse}
              loadImportMap={() => import('../.sitecore/import-map')}
            >
              <I18nProvider lngDict={defaultDict} locale="en">
                <ThemeProvider theme={theme}>
                  <CssBaseline />
                  <Story />
                </ThemeProvider>
              </I18nProvider>
            </SitecoreProvider>
          </SessionProvider>
        </>
      );
    },
  ],
};

export default preview;
