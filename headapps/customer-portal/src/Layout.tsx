import componentMap from ".sitecore/component-map";
import { AppPlaceholder, Field, Page } from "@sitecore-content-sdk/nextjs";
import PagePermissionFallback from "components/shared/permissions/PagePermissionFallback";
import PermissionGate from "components/shared/permissions/PermissionGate";
import SitecoreStyles from "components/content-sdk/SitecoreStyles";
import LoadingSkeleton from "components/shared/loading-skeleton/LoadingSkeleton";
import PortalRouteLoadingFallback from "components/shared/portal-loading/PortalRouteLoadingFallback";
import { JSX, Suspense } from "react";
import Scripts from "src/Scripts";
import { DesignLibraryLayout } from "./DesignLibraryLayout";

interface LayoutProps {
  page: Page;
}

export interface RouteFields {
  [key: string]: unknown;
  Title?: Field;
}

const Layout = ({ page }: LayoutProps): JSX.Element => {
  const { layout, mode } = page;
  const { route } = layout.sitecore;
  const mainClassPageEditing = mode.isEditing ? "editing-mode" : "prod-mode";
  const routeFields = route?.fields as RouteFields & { PermissionSelection?: unknown } | undefined;
  const pagePermissionSelection = routeFields?.PermissionSelection || [];
  const isPermissionPage = routeFields?.Title?.value === "Roles Permissions";
  const shouldEnforcePagePermission = mode.isNormal && Array.isArray(pagePermissionSelection) && (pagePermissionSelection as unknown[]).length > 0;
  const pageBody = (
    <>
      <header>
        <div id='header'>
          {route && (
            <Suspense
              fallback={
                <div className='flex items-center justify-center p-4'>
                  <LoadingSkeleton variant='spinner' size='medium' />
                </div>
              }
            >
              <AppPlaceholder
                page={page}
                componentMap={componentMap}
                name='headless-header'
                rendering={route}
              />
            </Suspense>
          )}
        </div>
      </header>
      <main>
        <div id='content'>
          {route && (
            <Suspense
              fallback={
                <div className='flex items-center justify-center p-4'>
                  <LoadingSkeleton variant='spinner' size='medium' />
                </div>
              }
            >
              <AppPlaceholder
                page={page}
                componentMap={componentMap}
                name='headless-main'
                rendering={route}
              />
              <AppPlaceholder
                page={page}
                componentMap={componentMap}
                name='headless-head-script'
                rendering={route}
              />
              <AppPlaceholder
                page={page}
                componentMap={componentMap}
                name='headless-body-script'
                rendering={route}
              />
            </Suspense>
          )}
        </div>
      </main>
      <footer>
        <div id='footer'>
          {route && (
            <Suspense
              fallback={
                <div className='flex items-center justify-center p-4'>
                  <LoadingSkeleton variant='spinner' size='medium' />
                </div>
              }
            >
              <AppPlaceholder
                page={page}
                componentMap={componentMap}
                name='headless-footer'
                rendering={route}
              />
            </Suspense>
          )}
        </div>
      </footer>
    </>
  );

  return (
    <>
      <Scripts />
      <SitecoreStyles layoutData={layout} />
      {/* root placeholder for the app, which we add components to using route data */}
      <div className={mainClassPageEditing}>
        {mode.isDesignLibrary ? (
          <DesignLibraryLayout />
        ) : shouldEnforcePagePermission ? (
          <PermissionGate
            required={pagePermissionSelection}
            fallback={<PagePermissionFallback isPermissionPage={isPermissionPage} />}
            loadingFallback={<PortalRouteLoadingFallback />}
          >
            {pageBody}
          </PermissionGate>
        ) : (
          pageBody
        )}
      </div>
    </>
  );
};

export default Layout;