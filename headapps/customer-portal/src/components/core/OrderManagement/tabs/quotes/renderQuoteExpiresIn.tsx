"use client";

import { Image as SitecoreImage } from "@sitecore-content-sdk/nextjs";
import React from "react";

import type { QuoteRecord } from "@/lib/orderManagementUtils";

import type { OrderManagementTabFields } from "../../OrderManagement.type";

export function renderQuoteExpiresIn(
  row: QuoteRecord,
  expirySoonThresholdDays: number,
  tabFields: OrderManagementTabFields | undefined
): React.ReactNode {
  if (row.statusKey === "order_expired") return "—";
  if (row.expiresInDays === null || row.expiresInDays === undefined) return "—";

  const n = row.expiresInDays;
  const text = n === 1 ? "1 day" : `${n} days`;
  const threshold =
    Number.isFinite(expirySoonThresholdDays) && expirySoonThresholdDays >= 0
      ? expirySoonThresholdDays
      : 7;
  const urgent = n >= 0 && n <= threshold;

  if (!urgent) {
    return text;
  }

  const iconField = tabFields?.UrgencyIcon;
  const hasIcon = Boolean(iconField?.value?.src?.trim());

  return (
    <span className="inline-flex items-center gap-[4px] font-bold text-[#b91c1c]">
      {text}
      {hasIcon ? (
        <SitecoreImage
          field={iconField}
          width={14}
          height={14}
          sizes="14px"
          className="shrink-0 object-contain"
          aria-hidden
        />
      ) : null}
    </span>
  );
}
