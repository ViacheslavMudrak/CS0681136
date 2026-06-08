"use client";

import { AppPlaceholder } from "@sitecore-content-sdk/nextjs";
import type { ComponentMap, NextjsContentSdkComponent } from "@sitecore-content-sdk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useScrollExtentSync } from "@/hooks/use-scroll-extent-sync";
import AccessDenied from "@/components/shared/permissions/AccessDenied";
import Button from "@/components/ui/Button";
import PortalShellChromeLoading, {
  PortalShellMainSkeleton,
} from "@/components/shared/portal-loading/PortalShellChromeLoading";
import { useDashboardPageViewAnalytics } from "@/hooks/useDashboardPageViewAnalytics";
import { CONTACT_SUPPORT_PATH, isPortalAccessDeniedProfile } from "@/lib/auth-utils";
import { getPathWithoutLocale } from "@/lib/locale-cookie";
import { getIsRightAlignedLayout } from "@/lib/portal-shell-layout";
import { usePortalRouteTransitionOptional } from "@/lib/portal-route-transition-context";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/lib/user-profile-context";
import { PortalShellProps } from "../PortalShell.type";
import MobileNavToggle from "./MobileNavToggle";
import PortalShellHeaderShell from "./PortalShellHeaderShell";

type SitecoreComponentMapModule = typeof import(".sitecore/component-map");
let defaultComponentMapCache: SitecoreComponentMapModule["default"] | undefined;

function getDefaultComponentMap(): SitecoreComponentMapModule["default"] {
  if (!defaultComponentMapCache) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- breaks circular import with generated component-map
    defaultComponentMapCache = require(".sitecore/component-map")
      .default as SitecoreComponentMapModule["default"];
  }
  return defaultComponentMapCache;
}

const PortalShellClient = (props: PortalShellProps): React.ReactElement => {
  const isRightAlignedLayout = getIsRightAlignedLayout(props);
  useDashboardPageViewAnalytics({ page: props.page, rendering: props.rendering });
  const pathname = usePathname();
  const isEditing = props.page.mode.isEditing || props.page.mode.isPreview;
  const { profile, loading } = useUserProfile();
  const routeTransition = usePortalRouteTransitionOptional();
  const isContentPending = Boolean(routeTransition?.isContentPending);
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);
  useScrollExtentSync(mainContentRef);
  const componentMap = props.componentMap ?? getDefaultComponentMap();
  const componentMapTyped = componentMap as unknown as ComponentMap<NextjsContentSdkComponent>;
  const normalizedPath = getPathWithoutLocale(pathname || "/").replace(/\/+$/, "") || "/";
  const isContactSupportPage = normalizedPath === CONTACT_SUPPORT_PATH;

  const closeSideNav = () => setSideNavOpen(false);
  const toggleSideNav = () => setSideNavOpen((prev) => !prev);

  useEffect(() => {
    if (!sideNavOpen) return;
    const scrollY = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      try {
        window.scrollTo(0, scrollY);
      } catch {
        /* jsdom may not implement scrollTo */
      }
    };
  }, [sideNavOpen]);

  if (isContactSupportPage) {
    return (
      <main className="min-h-screen w-full" dir={isRightAlignedLayout ? "rtl" : "ltr"}>
        <AppPlaceholder
          name="Content"
          rendering={props.rendering}
          page={props.page}
          componentMap={componentMapTyped}
        />
      </main>
    );
  }

  const isInitialProfileLoad = !isEditing && loading && !profile;

  if (isInitialProfileLoad) {
    return (
      <PortalShellChromeLoading
        dir={isRightAlignedLayout ? "rtl" : "ltr"}
        data-testid="portal-shell-loading"
      />
    );
  }

  if (!isEditing && isPortalAccessDeniedProfile(profile)) {
    return <AccessDenied />;
  }

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen w-full bg-[var(--color-portal-bg)]",
        sideNavOpen && "max-lg:overflow-hidden"
      )}
      dir={isRightAlignedLayout ? "rtl" : "ltr"}
    >
      <PortalShellHeaderShell
        sideNavOpen={sideNavOpen}
        mobileNavToggle={<MobileNavToggle sideNavOpen={sideNavOpen} onToggle={toggleSideNav} />}
        topNav={
          <AppPlaceholder
            name="Top"
            rendering={props.rendering}
            page={props.page}
            componentMap={componentMapTyped}
          />
        }
      />

      {sideNavOpen && (
        <Button
          type="button"
          variant="transparent"
          className="fixed inset-0 z-[45] bg-black/50 lg:hidden rounded-none p-0"
          onPress={closeSideNav}
          aria-label="Close navigation menu"
        >
          <span aria-hidden="true" />
        </Button>
      )}

      <div
        className={cn(
          "grid w-full grid-rows-[1fr] flex-1 grid-cols-1 lg:grid-cols-[275px_1fr] [direction:ltr] min-h-0 max-lg:min-h-0 lg:min-h-[calc(100vh-72px)] max-md:pt-[60px]",
          isRightAlignedLayout && "lg:grid-cols-[1fr_275px]"
        )}
      >
        <aside
          className={cn(
            "flex flex-col min-h-0 overflow-hidden w-[275px] lg:self-start lg:h-[calc(100vh-72px)] lg:max-h-[calc(100vh-72px)] ",
            "bg-[linear-gradient(162.51deg,var(--color-portal-sidebar-start,#151e2c)_0%,var(--color-portal-sidebar-end,#1d2b42)_100%)]",
            "fixed z-50 transition-transform duration-300 ease-in-out lg:sticky lg:top-[72px] lg:bottom-auto lg:z-10 top-[60px] md:top-[60px] inset-inline-start-0",
            "max-lg:bottom-0 max-lg:h-auto -translate-x-full lg:translate-x-0",
            sideNavOpen && "translate-x-0",
            "rtl:translate-x-full rtl:inset-inline-start-auto rtl:inset-inline-end-0",
            sideNavOpen && "rtl:translate-x-0",
            "lg:rtl:translate-x-0 lg:rtl:inset-inline-start-auto lg:rtl:inset-inline-end-auto",
            isRightAlignedLayout && "lg:col-start-2 lg:row-start-1"
          )}
          aria-hidden={!sideNavOpen}
        >
          <div
            className={cn(
              "min-h-0 w-full overflow-hidden max-lg:absolute max-lg:inset-0 max-lg:flex-none max-lg:h-auto",
              "lg:flex-1 lg:min-h-0 lg:h-full",
              "[&>*]:flex-1 [&>*]:flex-col [&>*]:min-h-0 [&>*]:min-w-0 [&>*]:h-full [&>*]:max-h-full [&>*]:overflow-hidden",
              "[&_.component>.component-content]:flex-1 [&_.component>.component-content]:flex-col [&_.component>.component-content]:min-h-0 [&_.component>.component-content]:min-w-0 [&_.component>.component-content]:h-full [&_.component>.component-content]:max-h-full [&_.component>.component-content]:overflow-hidden"
            )}
          >
            <AppPlaceholder
              name="SideNav"
              rendering={props.rendering}
              page={props.page}
              componentMap={componentMapTyped}
            />
          </div>
        </aside>
        <main
          ref={mainContentRef}
          className={cn(
            "min-h-0 max-lg:min-h-0 lg:min-h-full py-[16px] px-[16px] md:p-[18px] !pt-[16px] lg:py-[28px] lg:px-[24px] bg-[var(--color-portal-bg)]",
            isRightAlignedLayout && "lg:col-start-1 lg:row-start-1",
            sideNavOpen && "max-lg:overflow-hidden max-lg:overscroll-none"
          )}
          aria-busy={isContentPending || undefined}
          dir={isRightAlignedLayout ? "rtl" : "ltr"}
        >
          {isContentPending ? (
            <PortalShellMainSkeleton />
          ) : (
            <AppPlaceholder
              name="Content"
              rendering={props.rendering}
              page={props.page}
              componentMap={componentMapTyped}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default PortalShellClient;
