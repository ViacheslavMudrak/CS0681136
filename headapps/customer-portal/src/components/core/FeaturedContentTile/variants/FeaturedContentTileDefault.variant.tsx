"use client";

import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import { NextImage, RichText, Text, type LinkField } from "@sitecore-content-sdk/nextjs";
import React, { useCallback, useMemo } from "react";

import { LinkRender } from "@/components/shared/link-render/LinkRender";
import type { ComponentProps } from "@/lib/component-props";
import { trackDashboardFeaturedContentClick } from "@/lib/dashboardAnalytics";

import type { IFeaturedContentTileFields } from "../FeaturedContentTile.type";
import { cn } from "@/lib/utils";

interface FeaturedContentTileDefaultVariantProps {
  testId: string;
  fields: IFeaturedContentTileFields | null;
  params: ComponentProps["params"];
  page: ComponentProps["page"];
}

function ctaLinkOpenInNewTab(field: LinkField | undefined): LinkField | undefined {
  if (!field?.value || typeof field.value !== "object" || Array.isArray(field.value)) {
    return field;
  }
  const href = String((field.value as { href?: string }).href ?? "").trim();
  if (!href) return field;
  return {
    ...field,
    value: {
      ...(field.value as object),
      target: "_blank",
    } as LinkField["value"],
  };
}

export function FeaturedContentTileDefaultVariant({
  testId,
  fields,
  params,
  page,
}: FeaturedContentTileDefaultVariantProps): React.ReactElement | null {
  const {
    styles: paramsStyles,
    RenderingIdentifier: id,
    HideTile,
  } = params as ComponentProps["params"] & {
    HideTile?: unknown;
  };
  const { isEditing } = page.mode;
  const ctaField = useMemo(
    () => (fields ? ctaLinkOpenInNewTab(fields.CTAURL) : undefined),
    [fields?.CTAURL]
  );
  const showSection = isEditing || !Boolean(Number(HideTile));

  if (!fields) {
    return (
      <div
        className={`component featured-content-tile ${paramsStyles ?? ""}`.trim()}
        id={id}
        data-testid={testId}
      >
        <div className="component-content">
          <span className="is-empty-hint">Featured content tile</span>
        </div>
      </div>
    );
  }

  if (!showSection) {
    return null;
  }

  const rawHref = String(fields.CTAURL?.value?.href ?? "").trim();
  const ctaLabelText = String(fields.CTAURL?.value?.text ?? "").trim();
  const hasCta = Boolean(rawHref && ctaField && (ctaLabelText || isEditing));
  const hasBackgroundImage = Boolean(fields.BackgroundImage?.value?.src);
  const tileGradient = hasBackgroundImage
    ? "linear-gradient(143.72deg, rgba(0, 30, 62, 0.75) 4.63%, rgba(9, 48, 113, 0.82) 73.13%)"
    : "linear-gradient(143.72deg, rgb(0, 30, 62) 4.63%, rgb(9, 48, 113) 73.13%)";

  const onFeaturedContentCtaClickCapture = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isEditing) return;
      const t = e.target as HTMLElement | null;
      const anchor = t?.closest("a");
      if (!anchor) return;
      const hrefAttr = anchor.getAttribute("href");
      if (!hrefAttr?.trim()) return;
      let linkUrl: string;
      try {
        linkUrl = new URL(hrefAttr.trim(), window.location.href).href;
      } catch {
        linkUrl = hrefAttr.trim();
      }
      trackDashboardFeaturedContentClick({
        tileHeading: String(fields.TileHeading?.value ?? ""),
        categoryLabel: String(fields.CategoryLabel?.value ?? ""),
        linkUrl,
      });
    },
    [isEditing, fields]
  );

  return (
    <article
      className={`component featured-content-tile ${paramsStyles ?? ""}`.trim()}
      id={id}
      data-testid={testId}
      aria-label={String(fields.TileHeading?.value ?? "Featured content")}
    >
      <div className="relative isolate min-h-[340px] overflow-hidden rounded-lg">
        {hasBackgroundImage ? (
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <NextImage
              field={fields.BackgroundImage}
              alt={String(fields.BackgroundImage?.value?.alt ?? "")}
              className="size-full min-h-full min-w-full max-h-none max-w-none object-cover"
              width={Number(fields.BackgroundImage?.value?.width)}
              height={Number(fields.BackgroundImage?.value?.height)}
              sizes="(max-width: 768px) 100vw, 538px"
            />
          </div>
        ) : null}
        <div
          className="absolute inset-0 z-[1]"
          style={{ background: tileGradient }}
          aria-hidden
        />
        <div className="relative z-[2] box-border flex h-full min-h-[340px] flex-col justify-between gap-6 p-[32px] md:p-[40px]">
          <div className="flex w-full min-w-0 flex-col gap-[10.5px]">
            {fields.CategoryLabel?.value ? (
              <p className="text-[12px] font-[700] uppercase leading-[1.38] text-white/90">
                <Text field={fields.CategoryLabel} tag="span" />
              </p>
            ) : null}
            {fields.TileHeading?.value ? (
              <div className="text-[24px] font-[400] leading-[1.25] text-white">
                <Text field={fields.TileHeading} tag="span" />
              </div>
            ) : null}
            {fields.TileDescription?.value ? (
              <div className="max-w-[446px] font-[400] leading-[1.38] text-[16px] text-white [&_a]:text-white [&_a]:underline [&_a]:decoration-white/80 [&_a]:underline-offset-2 [&_p]:m-0">
                <RichText field={fields.TileDescription} tag="div" />
              </div>
            ) : null}
          </div>
          {hasCta && ctaField ? (
            <div onClickCapture={onFeaturedContentCtaClickCapture}>
              <LinkRender
                field={ctaField}
                className="inline-flex min-h-0 min-w-[112px] max-w-full shrink-0 items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-[12px] font-[400] leading-none text-[#222] no-underline outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                editable={isEditing}
                showLinkTextWithChildrenPresent
              >
                <Icon
                  icon={faArrowUpRightFromSquare}
                  className="shrink-0 text-xs text-[#222]"
                  aria-hidden
                />
              </LinkRender>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
