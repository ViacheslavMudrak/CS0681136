"use client";

import { Image as SitecoreImage, RichText, Text } from "@sitecore-content-sdk/nextjs";
import React from "react";

import Button from "@/components/ui/Button";
import type { OrderManagementHeaderProps } from "../OrderManagement.type";

export function OrderManagementHeader({
  title,
  subtitle,
  requestQuoteLabelDesktop,
  requestQuoteIcon,
  canRequestQuote = false,
  hideRequestQuote,
  onRequestQuoteOpen,
  quoteBadgeCount = 0,
}: OrderManagementHeaderProps): React.ReactElement {
  const showCta = canRequestQuote && !hideRequestQuote && onRequestQuoteOpen;

  const ariaLabel = String(requestQuoteLabelDesktop?.value ?? "");

  const mobileFab = (
    <Button
      type="button"
      variant="primary"
      btnVariant="iconBtn"
      className="inline-flex !h-[48px] !min-h-[48px] !w-[48px] !min-w-[48px] rounded-full !p-0 text-[30px] font-normal leading-none lg:hidden"
      onPress={onRequestQuoteOpen}
      aria-label={ariaLabel || "Request new quote"}
    >
      <span className="relative inline-flex h-full w-full items-center justify-center" aria-hidden>
        {requestQuoteIcon?.value?.src ? (
          <SitecoreImage field={requestQuoteIcon} width={14} height={16} sizes="18px" />
        ) : (
          "+"
        )}
        {quoteBadgeCount > 0 ? (
          <span className="absolute right-[-2px] top-[-2px] flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-text-white px-1 text-[10px] font-bold leading-none text-action-primary">
            {quoteBadgeCount > 99 ? "99+" : quoteBadgeCount}
          </span>
        ) : null}
      </span>
    </Button>
  );

  return (
    <div className="flex flex-row items-start justify-between gap-[16px]">
      <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
        {title?.value && (
          <Text
            field={title}
            tag="h2"
            className="text-[24px] font-semibold leading-[1.25] text-text-heading"
          />
        )}
        {subtitle?.value && (
          <RichText
            field={subtitle}
            className="text-[14px] font-normal leading-[1.4] text-text-basic"
          />
        )}
      </div>
      {showCta ? (
        <Button
          type="button"
          variant="primary"
          className="hidden md:inline-flex"
          onPress={onRequestQuoteOpen}
          aria-label={ariaLabel}
        >
          <div className="flex gap-[16px]">
            <span className="relative inline-flex items-center justify-center">
              {requestQuoteIcon?.value?.src && (
                <SitecoreImage field={requestQuoteIcon} width={14} height={16} sizes="18px" />
              )}
              {quoteBadgeCount > 0 ? (
                <span
                  className="absolute top-[8px] left-[12px] flex min-h-[13px] min-w-[13px] items-center justify-center rounded-full bg-text-white px-1 text-[10px] font-bold leading-none text-action-primary"
                  aria-hidden
                >
                  {quoteBadgeCount > 99 ? "99+" : quoteBadgeCount}
                </span>
              ) : null}
            </span>

            <Text field={requestQuoteLabelDesktop} tag="span" />
          </div>
        </Button>
      ) : null}

      <div className="md:hidden">{mobileFab}</div>
    </div>
  );
}
