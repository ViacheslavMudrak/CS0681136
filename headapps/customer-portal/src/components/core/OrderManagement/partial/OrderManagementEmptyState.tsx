"use client";

import { LinkField, NextImage, RichText, Text } from "@sitecore-content-sdk/nextjs";
import React from "react";

import Button from "@/components/ui/Button";
import { LinkRender } from "@/components/shared/link-render/LinkRender";
import { useActiveLocale } from "@/hooks/use-active-locale";
import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";
import { localizeHref } from "@/lib/locale-path";
import { getOrderManagementTabLinkRaw } from "@/lib/orderManagementUtils";

import { RETRY_ACTION_LABEL } from "../orderManagementLabels";

export function OrderManagementEmptyState({
  orderManagement,
}: {
  orderManagement: OrderManagementShell;
}): React.ReactElement {
  const { tabFields, loadError, fetchRemote } = orderManagement;
  const activeLocale = useActiveLocale();
  const emptyCtaRaw = getOrderManagementTabLinkRaw(tabFields?.EmptyStatusCTA);
  const hideCTA = tabFields?.HideCTA?.value;
  const emptyCtaHref = emptyCtaRaw ? localizeHref(emptyCtaRaw, activeLocale) : undefined;
  const emptyCtaText = tabFields?.EmptyStatusCTA?.value?.text?.trim();

  if (!tabFields) {
    return (
      <div
        className="flex min-h-[320px] w-full flex-col items-center justify-center gap-[12px] px-[24px] py-[48px] text-center"
        role="status"
      />
    );
  }

  return (
    <div
      className="flex min-h-[320px] w-full flex-col items-center justify-center gap-[12px] px-[24px] py-[48px] text-center"
      role={loadError ? "alert" : "status"}
    >
      {tabFields.EmptyStatusIcon?.value?.src && (
        <NextImage field={tabFields.EmptyStatusIcon} width={120} height={120} sizes="120px" />
      )}
      {tabFields.EmptyStatusTitle?.value ? (
        <Text
          field={tabFields.EmptyStatusTitle}
          tag="h3"
          className="text-[18px] font-semibold text-text-heading"
        />
      ) : null}
      {loadError ? (
        <div className="max-w-[400px] text-[14px] text-text-basic">
          <p>{loadError}</p>
        </div>
      ) : tabFields.EmptyStatusDescription?.value ? (
        <div className="max-w-[400px] text-[14px] text-text-basic">
          <RichText field={tabFields.EmptyStatusDescription} />
        </div>
      ) : null}
      {loadError ? (
        <Button
          type="button"
          border
          variant="inverse"
          className="mt-[4px]"
          onPress={() => void fetchRemote()}
        >
          {RETRY_ACTION_LABEL}
        </Button>
      ) : null}
      {!loadError && emptyCtaHref && !hideCTA ? (
        <LinkRender
          field={tabFields.EmptyStatusCTA as LinkField}
          className="font-medium text-menu-hover-color"
        >
          {emptyCtaText ?? emptyCtaHref}
        </LinkRender>
      ) : null}
    </div>
  );
}
