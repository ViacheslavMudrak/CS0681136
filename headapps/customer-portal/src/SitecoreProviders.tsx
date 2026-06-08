"use client";

import type { ReactNode } from "react";
import components from ".sitecore/component-map.client";
import {
  ComponentPropsCollection,
  ComponentPropsContext,
  Page,
  SitecoreProvider
} from "@sitecore-content-sdk/nextjs";
import scConfig from "sitecore.config";
import { SitecoreEditingPermissionBridge } from "@/lib/permission-context";
import PortalFeatureProviders from "@/components/providers/PortalFeatureProviders";

/**
 * Per-route Sitecore context. Rendered from page.tsx so `page` updates on navigation
 * while AuthShellProviders in layout stays mounted.
 */
export function SitecoreProviders({
  children,
  page,
  componentProps = {}
}: {
  children: ReactNode;
  page: Page;
  componentProps?: ComponentPropsCollection;
}) {
  return (
    <SitecoreProvider api={scConfig.api} componentMap={components} page={page}>
      <SitecoreEditingPermissionBridge />
      <ComponentPropsContext value={componentProps}>
        <PortalFeatureProviders>{children}</PortalFeatureProviders>
      </ComponentPropsContext>
    </SitecoreProvider>
  );
}
