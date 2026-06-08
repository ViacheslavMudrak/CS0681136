"use client";

import { Link as ScLink } from "@sitecore-content-sdk/nextjs";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo } from "react";

import { isAuxiliaryNavigationClick } from "@/lib/portal-route-transition-context";
import {
  resolveOrderManagementTabNavHrefForTab,
  syncOrderManagementBrowserUrl,
} from "@/lib/orderManagementTabNavigation";
import { cn } from "@/lib/utils";

import type { OrderManagementTabItem } from "../OrderManagement.type";

const tabLinkBase = cn(
  "relative inline-flex rounded-sm pb-[12px] text-[14px] font-normal text-text-heading no-underline",
  "hover:text-text-basic-active focus:outline-none focus-visible:ring-2"
);

const tabLinkActive = "font-bold text-text-heading";

const tabIndicator = "absolute bottom-0 left-0 right-0 h-[3px] rounded-t-[2px] bg-brand-red";

export function OrderManagementTabBar({
  visibleTabs,
  activeTab,
  currentPathname,
  isEditing = false,
}: {
  visibleTabs: OrderManagementTabItem[];
  activeTab: OrderManagementTabItem | undefined;
  currentPathname: string;
  isEditing?: boolean;
}): React.ReactElement | null {
  const router = useRouter();

  const tabNavHrefs = useMemo(
    () =>
      visibleTabs.map((tab) => ({
        tab,
        href: resolveOrderManagementTabNavHrefForTab(currentPathname, tab.fields?.TabURL),
      })),
    [currentPathname, visibleTabs]
  );

  useEffect(() => {
    if (isEditing) return;
    for (const { href } of tabNavHrefs) {
      if (href) {
        router.prefetch(href);
      }
    }
  }, [isEditing, router, tabNavHrefs]);

  const navigateToTab = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string, isActive: boolean) => {
      if (isActive || isEditing || isAuxiliaryNavigationClick(event) || event.defaultPrevented) {
        return;
      }

      event.preventDefault();
      syncOrderManagementBrowserUrl(href);
      router.push(href);
    },
    [isEditing, router]
  );

  if (visibleTabs.length === 0) return null;

  return (
    <div
      className="flex flex-wrap gap-[24px] border-b border-border-gray pb-0"
      role="navigation"
      aria-label="Order management sections"
    >
      {tabNavHrefs.map(({ tab, href }) => {
        const label = tab.fields?.TabName?.value ?? tab.displayName ?? "Tab";
        const active = tab.id === activeTab?.id;
        const linkClassName = cn(tabLinkBase, active && tabLinkActive);
        const indicator = active ? <span className={tabIndicator} aria-hidden /> : null;

        if (isEditing && tab.fields?.TabURL?.value?.href) {
          return (
            <ScLink
              key={tab.id}
              field={tab.fields.TabURL}
              target="_self"
              className={linkClassName}
              aria-current={active ? "page" : undefined}
            >
              {label}
              {indicator}
            </ScLink>
          );
        }

        if (href) {
          return (
            <NextLink
              key={tab.id}
              href={href}
              className={linkClassName}
              aria-current={active ? "page" : undefined}
              prefetch
              onClick={(event) => navigateToTab(event, href, active)}
            >
              {label}
              {indicator}
            </NextLink>
          );
        }

        return (
          <button
            key={tab.id}
            type="button"
            disabled
            className={cn(
              linkClassName,
              "m-0 cursor-not-allowed appearance-none border-0 bg-transparent p-0 text-left opacity-60",
              "font-[inherit]"
            )}
            aria-current={active ? "page" : undefined}
            title="Tab link is not configured in Sitecore (missing Tab URL)."
          >
            {label}
            {indicator}
          </button>
        );
      })}
    </div>
  );
}
