"use client";

import { useOktaAuth } from "@okta/okta-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import type { ComponentProps } from "@/lib/component-props";
import { useDashboardRecentDataOptional } from "@/contexts/DashboardRecentDataContext";
import { trackDashboardPageView } from "@/lib/dashboardAnalytics";
import {
  isDashboardHomePathname,
  isPersonalizedDashboardHomePage,
  resolveDashboardInfoPanelVisible,
  resolveDashboardPillsVisible,
  resolveDashboardUserType,
} from "@/lib/dashboard-page-view-utils";
import { getPathWithoutLocale } from "@/lib/locale-cookie";
import { useProfileContextOptional } from "@/lib/profile-context";

export interface UseDashboardPageViewAnalyticsParams {
  page: ComponentProps["page"];
  rendering: ComponentProps["rendering"];
}

export function useDashboardPageViewAnalytics({
  page,
  rendering,
}: UseDashboardPageViewAnalyticsParams): void {
  const pathname = usePathname();
  const profile = useProfileContextOptional();
  const recent = useDashboardRecentDataOptional();
  const oktaAuth = useOktaAuth();
  const trackedKeyRef = useRef<string | null>(null);

  const accountId = profile?.selectedAccount?.id ?? "";
  const isEditing = page.mode.isEditing;
  const isHomePage = isPersonalizedDashboardHomePage(page);
  const isHomePath = pathname ? isDashboardHomePathname(pathname) : false;
  const recentLoading = recent?.loading ?? false;
  const recentDataSettled = recent?.recentDataSettled ?? false;
  const recentData = recent?.data;

  useEffect(() => {
    if (!isHomePage || !isHomePath || isEditing) return;
    if (!accountId) return;
    if (recentLoading || !recentDataSettled) return;

    const logicalPath = getPathWithoutLocale(pathname ?? "/");
    const dedupeKey = `${accountId}::${logicalPath}`;
    if (trackedKeyRef.current === dedupeKey) return;
    trackedKeyRef.current = dedupeKey;

    const email = oktaAuth?.authState?.idToken?.claims?.email as string | undefined;
    const orders = recentData?.orders?.orders ?? [];
    const quotes = recentData?.quotes?.quotes ?? [];

    trackDashboardPageView({
      dashboardPersona: String(profile?.selectedAccount?.role ?? "").trim() || "—",
      accountId: String(accountId),
      userType: resolveDashboardUserType(email),
      infoPanelVisible: resolveDashboardInfoPanelVisible(rendering, isEditing),
      pillsVisible: resolveDashboardPillsVisible(rendering, isEditing),
      ordersCount: orders.length,
      quotesCount: quotes.length,
    });
  }, [
    accountId,
    isEditing,
    isHomePage,
    isHomePath,
    oktaAuth?.authState?.idToken?.claims?.email,
    pathname,
    profile?.selectedAccount?.role,
    recentData?.orders?.orders,
    recentData?.quotes?.quotes,
    recentDataSettled,
    recentLoading,
    rendering,
  ]);
}
