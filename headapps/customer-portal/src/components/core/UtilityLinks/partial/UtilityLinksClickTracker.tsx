"use client";

import type { MouseEvent, ReactElement, ReactNode } from "react";
import { useCallback } from "react";

import { trackDashboardUtilityLinkClick } from "@/lib/dashboardAnalytics";

interface UtilityLinksClickTrackerProps {
  children: ReactNode;
  linkLabel: string;
  linkPosition: number;
  isEditing: boolean;
}

export function UtilityLinksClickTracker({
  children,
  linkLabel,
  linkPosition,
  isEditing,
}: UtilityLinksClickTrackerProps): ReactElement {
  const onClickCapture = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (isEditing) return;
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const hrefAttr = anchor.getAttribute("href");
      if (!hrefAttr?.trim()) return;
      let linkUrl: string;
      try {
        linkUrl = new URL(hrefAttr.trim(), window.location.href).href;
      } catch {
        linkUrl = hrefAttr.trim();
      }
      trackDashboardUtilityLinkClick({
        linkLabel,
        linkPosition,
        linkUrl,
      });
    },
    [isEditing, linkLabel, linkPosition]
  );

  return <div onClickCapture={onClickCapture}>{children}</div>;
}
