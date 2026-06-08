"use client";

import { useSitecore } from "@sitecore-content-sdk/nextjs";
import { usePathname } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { DashboardRecentDataProvider } from "@/contexts/DashboardRecentDataContext";
import { getPathWithoutLocale } from "@/lib/locale-cookie";

function needsDashboardRecentData(path: string): boolean {
  return (
    path === "/" ||
    path.includes("/dashboard")
  );
}

function needsQuoteRequestDraft(path: string): boolean {
  return path.includes("/orders") || path.includes("quote-request");
}

type PortalFeatureProvidersProps = {
  children: ReactNode;
};

export default function PortalFeatureProviders({
  children,
}: PortalFeatureProvidersProps): ReactElement {
  const pathname = getPathWithoutLocale(usePathname() || "/").replace(/\/+$/, "") || "/";
  const { page } = useSitecore();
  const isNormalMode = page.mode.isNormal;

  const shouldDashboardRecent = isNormalMode ? needsDashboardRecentData(pathname) : true;

  let content = children;

  if (shouldDashboardRecent) {
    content = <DashboardRecentDataProvider>{content}</DashboardRecentDataProvider>;
  }

  return <>{content}</>;
}