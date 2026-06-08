"use client";

import React from "react";

import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

import Button from "@/components/ui/Button";

import type { DetailPageHeaderProps } from "./DetailPageHeader.type";

export function DetailPageHeader({
  backAriaLabel,
  onBack,
  title,
  headingTag = "h2",
  statusBadge,
  actions,
  metadata,
  reference,
}: DetailPageHeaderProps): React.ReactElement {
  const HeadingTag = headingTag;
  const visibleActions = (actions ?? []).filter((action) => action.visible !== false);
  const showActions = visibleActions.length > 0;

  return (
    <>
      <header className="flex w-full flex-col gap-[6px] bg-[linear-gradient(180deg,_rgba(239,246,255,0.5)_0%,_rgba(245,247,250,0.8)_90%,_#F8F8F8_100%)] md:gap-[14px] lg:pt-[0px]">
        <div className="flex w-full items-start justify-between gap-[4px] md:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-[8px] md:items-center md:gap-[12px]">
            <Button
              type="button"
              variant="ghost"
              btnVariant="iconBtn"
              className="mt-[5px] shrink-0 text-[var(--color-text-heading-color)] !justify-start font-bold !px-[0] !w-[12px] !min-w-[0px] lg:mt-[0px] [&_svg]:h-[17px] [&_svg]:w-[11px]"
              aria-label={backAriaLabel}
              onPress={onBack}
            >
              <Icon icon={faChevronLeft} size="lg" className="block shrink-0" />
            </Button>
            <div className="flex min-w-0 flex-col gap-[8px] md:flex-row md:items-center md:gap-[16px]">
              <HeadingTag className="m-0 min-w-0 whitespace-nowrap text-[24px] font-[600] leading-[30px] text-[var(--color-text-heading-color)] md:text-[30px] md:leading-[1.25]">
                {title}
              </HeadingTag>
              <div className="shrink-0">{statusBadge}</div>
            </div>
          </div>
          {showActions ? (
            <div className="flex shrink-0 flex-wrap items-start gap-[8px]">
              {visibleActions.map((action) => (
                <Button
                  key={action.key}
                  type="button"
                  variant={action.variant}
                  border={action.border}
                  aria-label={action.ariaLabel}
                  onPress={action.onPress}
                  className="size-[40px] min-w-[40px] p-[12px] justify-center rounded-full shrink-0 md:size-[auto] md:min-w-[auto] md:h-[40px] md:min-w-[112px]"
                >
                  {action.icon}
                  {action.label ? <span className="hidden md:block">{action.label}</span> : null}
                </Button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="w-full pl-[20px] text-[14px] leading-[1.38] font-[400] text-[var(--color-text-basic)] md:hidden">
          {metadata}
        </div>

        {reference ? (
          <div className="w-full pl-[20px] text-[12px] leading-[1.38] text-[var(--color-text-heading-color)] md:hidden">
            {reference}
          </div>
        ) : null}

        <div className="hidden w-full items-end justify-between gap-[12px] md:flex">
          <div className="min-w-0 pl-[25px] text-[16px] leading-[1.375] text-[var(--color-text-basic)]">
            {metadata}
          </div>
          {reference ? (
            <div className="shrink-0 pl-[25px] text-right text-[12px] leading-[1.38] text-[var(--color-text-heading-color)]">
              {reference}
            </div>
          ) : null}
        </div>
      </header>
      <div className="ml-[-16px] mr-[-16px] h-[1px] bg-[#E8EAEB]" />
    </>
  );
}
