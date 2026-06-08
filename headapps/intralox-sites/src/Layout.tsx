import React, { JSX } from "react";
import { Field, ImageField, Page } from "@sitecore-content-sdk/nextjs";
import Scripts from "src/Scripts";
import SitecoreStyles from "components/content-sdk/SitecoreStyles";
import { DesignLibraryLayout } from "./DesignLibraryLayout";
import { AppPlaceholder } from "@sitecore-content-sdk/nextjs";
import componentMap from ".sitecore/component-map";
import { AlertBox } from "components/alert-box/AlertBox";
import type {
  AlertInfoBoxReference,
  EnableAlertField,
} from "components/alert-box/AlertBox.type";
import { FloatingActionButton } from "components/floating-action-button/FloatingActionButton";
import type {
  FloatingButtonReference,
  ShowFloatingButtonField,
} from "components/floating-action-button/FloatingActionButton.type";
import {
  deriveLocalNavFromHeaderPlaceholders,
  routeHasLocalNavigationPlaceholderContent,
  routeShowsSubNavigation,
} from "components/local-navigation/localNavigationUtils";
import { LocalNavigationClient } from "components/local-navigation/partial/LocalNavigationClient";
import BottomPlaceholder from "components/shared/bottomPlaceholder/BottomPlaceholder";
import { cn } from "lib/utils";
import { IAuthorFields } from "./components/articleBanner/ArticleBanner.type";
import { IFields } from "./utils/interface";

interface LayoutProps {
  page: Page;
}

/** Route-level image field used for `<link rel="icon">` via `generateMetadata`. */
export interface RouteFaviconIconField {
  value?: {
    src?: string;
    alt?: string;
    width?: string;
    height?: string;
  };
}

export interface RouteFields {
  [key: string]: unknown;
  Title?: Field;
  /** Page banner / hero image from the route item when used by the Banner rendering. */
  Image?: ImageField;
  FaviconIcon?: RouteFaviconIconField;
  ShowFloatingButton?: ShowFloatingButtonField;
  FloatingButton?: FloatingButtonReference;
  EnableAlert?: EnableAlertField;
  AlertInfoBox?: AlertInfoBoxReference;
  /** When true, pages with the local navigation rendering may show the strip (see `LocalNavigation`). */
  ShowSubNavigation?: Field<boolean>;
  ShowParentPage?: Field<boolean>;
  HasDarkTheme?: Field<boolean>;
  Author?: IAuthorFields;
  ShowTopBorder?: Field<boolean>;
}

const Layout = ({ page }: LayoutProps): JSX.Element => {
  const { layout, mode } = page;
  const { route, context } = layout.sitecore;
  const routeFields = route?.fields as RouteFields | undefined;
  const showFloatingButton = routeFields?.ShowFloatingButton?.value === true;
  const enableAlert = routeFields?.EnableAlert?.value === true;
  const isEditing = mode.isEditing;
  const showSubRoute = routeShowsSubNavigation(routeFields);
  const hasCmsLocalNavSlot = routeHasLocalNavigationPlaceholderContent(route);
  const itemPath =
    context && typeof context === "object" && "itemPath" in context
      ? String((context as { itemPath?: string }).itemPath ?? "").trim() ||
        undefined
      : undefined;
  const routeItemId = typeof route?.itemId === "string" ? route.itemId : "";
  const shouldForceDerivedLocalNavForPolicyStatements = Boolean(
    itemPath &&
    itemPath.toLowerCase().startsWith("/support/policy-statements/"),
  );
  const derivedLocalNav =
    !hasCmsLocalNavSlot &&
    (showSubRoute || shouldForceDerivedLocalNavForPolicyStatements) &&
    routeItemId
      ? deriveLocalNavFromHeaderPlaceholders(route, routeItemId, itemPath)
      : { primaries: [], secondaries: [], useIndustryNavDropdowns: false };
  const showDerivedLocalNav =
    !hasCmsLocalNavSlot &&
    (showSubRoute || shouldForceDerivedLocalNavForPolicyStatements) &&
    (derivedLocalNav.primaries.length > 0 ||
      derivedLocalNav.secondaries.length > 0);
  const siteTheme =
    (context?.siteTheme as string)?.toLowerCase() ?? page.siteName;
  const previousPage = context?.previousPage as
    | { title?: string; url?: string }
    | undefined;
  const author = routeFields?.Author;
  return (
    <>
      <Scripts />
      <SitecoreStyles layoutData={layout} />
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.dataset.site=${JSON.stringify(siteTheme)};`,
        }}
      />
      {/* root placeholder for the app, which we add components to using route data */}
      <div id="page-wrap" className="flex min-h-screen flex-col">
        {mode.isDesignLibrary ? (
          <DesignLibraryLayout />
        ) : (
          <>
            {/* Fixed chrome + flow spacer: `position:sticky` was unreliable (mobile grid parent, scroll
                ancestry). Spacer height tracks `--headerTop` (set from Navigation).
                In XM Cloud Pages editor, preview wrappers often create a containing block that breaks
                `position:fixed`, so header and local nav would separate from each other; keep chrome
                in normal flow there only (`relative` + zero spacer). */}
            <div id="layout-sticky-chrome-slot" className="w-full shrink-0">
              <div
                id="layout-chrome-spacer"
                className={
                  isEditing
                    ? "pointer-events-none w-full shrink-0 h-0 min-h-0"
                    : "pointer-events-none w-full shrink-0 h-[var(--headerTop)]"
                }
                aria-hidden
              />
              <div
                id="layout-sticky-chrome"
                className={
                  isEditing
                    ? "relative z-[1000] flex w-full flex-col gap-0"
                    : "fixed top-0 left-0 right-0 z-[1000] flex w-full flex-col gap-0"
                }
              >
                {!mode.isDesignLibrary && (
                  <AlertBox
                    enableAlert={enableAlert}
                    alertInfoBox={routeFields?.AlertInfoBox}
                    isEditing={isEditing}
                  />
                )}
                <header className="m-0 w-full border-0 p-0">
                  <div
                    id="header"
                    className="m-0 max-mobile-large:flex-col-reverse max-mobile-large:gap-0 max-mobile-large:py-0"
                  >
                    {route && (
                      <AppPlaceholder
                        page={page}
                        componentMap={componentMap}
                        disableSuspense
                        name="headless-header"
                        rendering={route}
                      />
                    )}
                  </div>
                </header>
                {route && (
                  <div id="layout-chrome-nav" className="w-full">
                    <div
                      id="layout-local-navigation-slot"
                      className={cn(
                        isEditing &&
                          showDerivedLocalNav &&
                          "[&_.sc-jss-empty-placeholder]:!min-h-0 [&_.sc-jss-empty-placeholder]:h-0 [&_.sc-jss-empty-placeholder]:m-0 [&_.sc-jss-empty-placeholder]:overflow-hidden [&_.sc-jss-empty-placeholder]:border-0 [&_.sc-jss-empty-placeholder]:p-0",
                      )}
                    >
                      <AppPlaceholder
                        page={page}
                        componentMap={componentMap}
                        disableSuspense
                        name="headless-local-navigation"
                        rendering={route}
                      />
                    </div>
                    {showDerivedLocalNav && (
                      <LocalNavigationClient
                        isEditing={isEditing}
                        showSubRoute
                        primaries={derivedLocalNav.primaries}
                        secondaries={derivedLocalNav.secondaries}
                        useIndustryNavDropdowns={
                          derivedLocalNav.useIndustryNavDropdowns
                        }
                        routeItemGuid={routeItemId}
                        id="layout-derived-local-navigation"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
            {route && (
              <div
                id="layout-script-placeholders"
                className={cn(
                  isEditing &&
                    "[&_.sc-jss-empty-placeholder]:!min-h-0 [&_.sc-jss-empty-placeholder]:h-0 [&_.sc-jss-empty-placeholder]:m-0 [&_.sc-jss-empty-placeholder]:overflow-hidden [&_.sc-jss-empty-placeholder]:border-0 [&_.sc-jss-empty-placeholder]:p-0",
                )}
              >
                <AppPlaceholder
                  page={page}
                  componentMap={componentMap}
                  name="headless-body-script"
                  rendering={route}
                />
                <AppPlaceholder
                  page={page}
                  componentMap={componentMap}
                  name="headless-head-script"
                  rendering={route}
                />
              </div>
            )}
            <main className="relative z-[1] flex-1">
              <div id="content">
                {route && (
                  <AppPlaceholder
                    page={page}
                    componentMap={componentMap}
                    disableSuspense
                    name="headless-main"
                    rendering={route}
                  />
                )}
                <BottomPlaceholder
                  ShowParentPage={routeFields?.ShowParentPage}
                  HasDarkTheme={routeFields?.HasDarkTheme}
                  title={previousPage?.title}
                  url={previousPage?.url}
                  author={author}
                  containerWidth={routeFields?.ContainerWidth as IFields}
                  ShowTopBorder={routeFields?.ShowTopBorder}
                />
              </div>
            </main>
            {!mode.isDesignLibrary && (
              <FloatingActionButton
                showFloatingButton={showFloatingButton}
                floatingButton={routeFields?.FloatingButton}
                isEditing={isEditing}
              />
            )}
            <footer className="mt-auto w-full [&_.quick-link-group]:mt-8 [&_.quick-link-group]:!pb-12 [&_.quick-link-group]:md:!pb-20">
              <div id="footer">
                {route && (
                  <AppPlaceholder
                    page={page}
                    componentMap={componentMap}
                    disableSuspense
                    name="headless-footer"
                    rendering={route}
                  />
                )}
              </div>
            </footer>
          </>
        )}
      </div>
    </>
  );
};

export default Layout;
