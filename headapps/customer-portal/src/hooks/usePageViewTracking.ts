"use client";

import { getPathWithoutLocale } from "@/lib/locale-cookie";
import {
  logGTMAccountSubmittedPageView,
  logGTMLoginPageView,
  logGTMOrderListingPageView,
  logGTMProfileSettingPageView,
  logGTMRolesPermissionsPageView,
  logGTMRegisterPageView,
  logGTMResetPasswordPageView
} from "lib/gtm";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Order Management listing routes (URL distinguishes tab; folder segment casing normalized via toLowerCase). */
const ORDER_MANAGEMENT_LISTING_PATHS = new Set([
  "/orders-management/orders",
  "/orders-management/shipments",
  "/orders-management/invoices",
  "/orders-management/quotes",
]);

function isOrderManagementListingPath(path: string): boolean {
  const normalized = path.replace(/\/+$/, "").toLowerCase();
  return ORDER_MANAGEMENT_LISTING_PATHS.has(normalized);
}

/**
 * Hook to track page views in GTM
 * Automatically tracks page views when pathname changes
 * Only fires events on actual route changes, not on component re-renders
 */
export function usePageViewTracking() {
  const pathname = usePathname();
  const previousPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    const pathForTracking = getPathWithoutLocale(pathname);

    // Only track if logical pathname changed (ignore re-renders and pure locale-prefix changes)
    if (previousPathnameRef.current === pathForTracking) {
      return;
    }

    previousPathnameRef.current = pathForTracking;

    // Map pathnames to specific page view events (locale prefix already stripped)
    if (pathForTracking === "/login") {
      logGTMLoginPageView();
    } else if (pathForTracking === "/register") {
      logGTMRegisterPageView();
    } else if (pathForTracking === "/reset-password") {
      logGTMResetPasswordPageView();
    } else if (pathForTracking === "/account-submitted") {
      logGTMAccountSubmittedPageView();
    } else if (pathForTracking === "/profile-setting") {
      logGTMProfileSettingPageView();
    } else if (pathForTracking === "/admin/roles-permissions") {
      logGTMRolesPermissionsPageView();
    } else if (isOrderManagementListingPath(pathForTracking)) {
      logGTMOrderListingPageView(pathForTracking);
    }
    // Add more specific page view events here as needed
  }, [pathname]);
}
