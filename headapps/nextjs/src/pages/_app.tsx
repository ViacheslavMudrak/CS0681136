import { JSX, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { I18nProvider } from 'next-localization';
import Bootstrap from 'src/Bootstrap';
import { SitecorePageProps } from '@sitecore-content-sdk/nextjs';
import scConfig from 'sitecore.config';
import 'assets/main.scss';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from 'src/theme/shared/src/';
import { PageController, WidgetsProvider } from '@sitecore-search/react';
import { createTheme } from '@sitecore-search/ui';
import { brandBlue, contentPalette, primaryPalette } from 'src/theme/shared/src/lib/colors';
import { log } from 'src/util/helpers/log-helper';

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

function App({
  Component,
  pageProps,
}: AppProps<SitecorePageProps & { session: Session | null }>): JSX.Element {
  const { dictionary, session, ...rest } = pageProps;
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .catch((error: unknown) => {
        log('ERROR', 'PWA', 'Service worker registration failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      });
  }, []);

  // Only initialize WidgetsProvider if environment variables are available
  // This prevents build-time errors when env vars aren't available
  const customerKey = process.env.NEXT_PUBLIC_SITECORE_SEARCH_CUSTOMER_KEY;
  const apiKey = process.env.NEXT_PUBLIC_SITECORE_SEARCH_API_KEY;
  const searchSubdomain = process.env.NEXT_PUBLIC_SITECORE_SEARCH_SUBDOMAIN;
  const hasSearchConfig = customerKey && (searchSubdomain || apiKey);

  // Only initialize PageController if search config is available
  if (hasSearchConfig) {
    const searchContext = PageController.getContext();
    searchContext.setLocaleLanguage('en');
    searchContext.setLocaleCountry('us');
    const rawUri = router.asPath.split('?')[0];
    const pageUri = (() => {
      try {
        return decodeURIComponent(rawUri).replaceAll(' ', '-');
      } catch {
        return rawUri;
      }
    })();
    searchContext.setPageUri(pageUri);
  }

  const ascTheme = createTheme({
    palette: {
      primary: {
        main: contentPalette.light.primary,
        light: brandBlue['901'],
        dark: primaryPalette.dark.main,
        contrastText: contentPalette.light.inverse,
      },
    },
  });

  return (
    <>
      <Bootstrap {...pageProps} />
      {/*
        // Use the next-localization (w/ rosetta) library to provide our translation dictionary to the app.
        // Note Next.js does not (currently) provide anything for translation, only i18n routing.
        // If your app is not multilingual, next-localization and references to it can be removed.
      */}
      <SessionProvider session={session}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <I18nProvider
            lngDict={dictionary}
            locale={pageProps.page?.locale || scConfig.defaultLanguage}
          >
            <div style={ascTheme.style}>
              {hasSearchConfig ? (
                <WidgetsProvider
                  env="prod"
                  customerKey={customerKey}
                  serviceHost={searchSubdomain ?? 'https://api.rfksrv.com'}
                  apiKey={searchSubdomain ? undefined : apiKey}
                >
                  <Component {...rest} />
                </WidgetsProvider>
              ) : (
                <Component {...rest} />
              )}
            </div>
          </I18nProvider>
        </ThemeProvider>
      </SessionProvider>
    </>
  );
}

export default App;
