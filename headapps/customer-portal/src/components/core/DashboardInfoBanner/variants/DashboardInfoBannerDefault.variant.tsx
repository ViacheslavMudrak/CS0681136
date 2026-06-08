"use client";

import { NextImage, RichText, Text } from "@sitecore-content-sdk/nextjs";
import React, { useCallback } from "react";

import InfoBanner from "@/components/shared/info-banner/InfoBanner";
import type { ComponentProps } from "@/lib/component-props";
import { trackDashboardInfoPanelLinkClick } from "@/lib/dashboardAnalytics";

import type { IDashboardInfoBannerFields } from "../DashboardInfoBanner.type";
interface DashboardInfoBannerDefaultVariantProps {
  testId: string;
  fields: IDashboardInfoBannerFields | null;
  params: ComponentProps["params"];
  page: ComponentProps["page"];
}

/**
 * Dashboard information panel: optional visibility flag, then {@link InfoBanner} with CMS icon, title, and rich-text body.
 */
export function DashboardInfoBannerDefaultVariant({
  testId,
  fields,
  params,
  page,
}: DashboardInfoBannerDefaultVariantProps): React.ReactElement | null {
  const { styles, RenderingIdentifier: id, HideBanner } = params;
  const isEditing = page.mode.isEditing;
  const showBanner = isEditing || !Boolean(Number(HideBanner));

  const onBannerDescriptionLinkClickCapture = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isEditing) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a[href]");
      if (!anchor) return;
      const hrefAttr = anchor.getAttribute("href");
      if (!hrefAttr || hrefAttr === "#") return;
      let linkUrl: string;
      try {
        linkUrl = new URL(hrefAttr, window.location.href).href;
      } catch {
        linkUrl = hrefAttr;
      }
      const linkText = (anchor.textContent ?? "").trim() || linkUrl;
      trackDashboardInfoPanelLinkClick({ linkText, linkUrl });
    },
    [isEditing]
  );

  if (!fields) {
    return (
      <div
        className={`component dashboard-info-banner ${styles ?? ""}`.trim()}
        id={id}
        data-testid={testId}
      >
        <div className="component-content">
          <span className="is-empty-hint">Dashboard info banner</span>
        </div>
      </div>
    );
  }

  return (
    <section
      className={`component dashboard-info-banner ${styles ?? ""}`.trim()}
      id={id}
      data-testid={testId}
      aria-label={String(fields.BannerTitle?.value ?? "Dashboard info banner")}
    >
      <div className="mb-[16px]">
        {showBanner && (
          <InfoBanner
          icon={
            fields.BannerIcon?.value?.src ? (
              <NextImage field={fields.BannerIcon} width={28} height={28} sizes="40px" />
            ) : undefined
          }
          title={
            fields.BannerTitle?.value ? (
              <Text field={fields.BannerTitle} tag="span" />
            ) : undefined
          }
          description={
            fields.BannerDescription != null ? (
              <div onClickCapture={onBannerDescriptionLinkClickCapture}>
                <RichText field={fields.BannerDescription} tag="div" />
              </div>
            ) : undefined
          }          />
        )}
      </div>
    </section>
  );
}
