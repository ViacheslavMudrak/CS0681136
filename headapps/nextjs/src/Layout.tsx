/**
 * This Layout is needed for Starter Kit.
 */
import React, { JSX, useState, useEffect } from 'react';
import Head from 'next/head';
import { Placeholder, Field, DesignLibrary, Page } from '@sitecore-content-sdk/nextjs';
import Scripts from 'src/Scripts';
import SitecoreStyles from 'src/components/content-sdk/SitecoreStyles';
import GlobalScripts from 'src/lib/global-scripts/GlobalScripts';
import { materialIconsOutlined } from 'ts/material-icons';
import DebugDialog from 'components/common/DebugDialog/DebugDialog';
import AppleSplashLinks from 'components/common/AppleSplashLinks/AppleSplashLinks';
import { ScrollNavigationProvider } from 'src/lib/contexts/ScrollNavigationContext';
import { useI18n } from 'next-localization';
import { useSession } from 'next-auth/react';

interface LayoutProps {
  page: Page;
  mainReplacementChildren?: React.ReactNode;
}

interface RouteFields {
  [key: string]: unknown;
  title?: Field;
}

const Layout = ({ page, mainReplacementChildren }: LayoutProps): JSX.Element => {
  const { t } = useI18n();
  const { layout, mode } = page;
  const { route } = layout.sitecore;
  const fields = route?.fields as RouteFields;
  const mainClassPageEditing = mode.isEditing ? 'editing-mode' : 'prod-mode';
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);
  const { data: session, status } = useSession();
  const employeeNumber =
    status === 'loading' ? '' : (session?.googleProfile?.userInfo?.employeeNumber ?? '');
  const isDebugDialogAllowed =
    process.env.NEXT_PUBLIC_ENV === 'LOCAL' ||
    process.env.NEXT_PUBLIC_ENV === 'DEV' ||
    process.env.NEXT_PUBLIC_ENV === 'QA' ||
    process.env.NEXT_PUBLIC_ENV === 'UAT';

  useEffect(() => {
    if (!isDebugDialogAllowed) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+? (which is Ctrl+Shift+/)
      if (event.ctrlKey && event.shiftKey && event.key === '?') {
        event.preventDefault();
        setDebugDialogOpen((newState) => {
          return !newState;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDebugDialogAllowed]);

  const scriptSettings = layout.sitecore.context.scriptSettings;

  return (
    <div className={`${materialIconsOutlined.variable}`}>
      <Scripts />
      <GlobalScripts
        scriptSettings={scriptSettings}
        status={status}
        employeeNumber={employeeNumber}
      />
      <SitecoreStyles layoutData={layout} enableThemes={false} />
      <Head>
        <title>{fields?.title?.value?.toString() || t('SiteTitle') || 'OurAscension'}</title>
        {/* Standard favicons */}
        <link rel="icon" href="/assets/icon.svg" sizes="any" type="image/svg+xml" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
        {/* Windows tiles */}
        <meta name="msapplication-config" content="/assets/browserconfig.xml" />
        {/* PWA manifest + theme */}
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#051D64" />
        {/* iOS PWA */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="OurAscension" />
        <AppleSplashLinks />
      </Head>

      {/* root placeholder for the app, which we add components to using route data */}
      <div className={mainClassPageEditing}>
        {mode.isDesignLibrary ? (
          <DesignLibrary />
        ) : (
          <>
            <ScrollNavigationProvider disabled={mode.isEditing}>
              <header className="header-nav-area">
                <div id="header">
                  <div className="header-main-nav-spacer" aria-hidden="true" />
                  {route && <Placeholder name="headless-header" rendering={route} />}
                </div>
              </header>
            </ScrollNavigationProvider>
            <main>
              <div id="content">
                {route && !mainReplacementChildren && (
                  <>
                    <Placeholder name="headless-main" rendering={route} />
                    <Placeholder name="ascension-main" rendering={route} />
                  </>
                )}
                {mainReplacementChildren}
              </div>
            </main>
            <footer>
              <div id="footer">
                {route && <Placeholder name="headless-footer" rendering={route} />}
              </div>
            </footer>
          </>
        )}
      </div>
      {isDebugDialogAllowed && (
        <DebugDialog open={debugDialogOpen} onClose={() => setDebugDialogOpen(false)} />
      )}
    </div>
  );
};

export default Layout;
