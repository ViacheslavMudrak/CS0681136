"use client";

import { Image as SitecoreImage } from "@sitecore-content-sdk/nextjs";
import React from "react";

import {
  formatInvoiceDueInFromCalendarDays,
  invoiceDueInCalendarDays,
  type InvoiceRecord,
} from "@/lib/orderManagementUtils";

import type { OrderManagementTabFields } from "../../OrderManagement.type";

export function renderInvoiceDueIn(
  row: InvoiceRecord,
  dueSoonThresholdDays: number,
  tabFields: OrderManagementTabFields | undefined
): React.ReactNode {
  if (row.statusKey === "invoice_paid") {
    return "–";
  }

  const threshold =
    Number.isFinite(dueSoonThresholdDays) && dueSoonThresholdDays >= 0
      ? dueSoonThresholdDays
      : 5;

  const days = invoiceDueInCalendarDays(row);
  if (days === null) {
    return "—";
  }

  if (days < 0) {
    const iconField = tabFields?.UrgencyIcon;
    const hasIcon = Boolean(iconField?.value?.src?.trim());
    return (
      <span className="inline-flex items-center gap-[4px] font-bold text-[#b91c1c]">
        <span>Overdue</span>
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

  const text = formatInvoiceDueInFromCalendarDays(days);
  const dueSoonUrgent = days <= threshold;

  if (!dueSoonUrgent) {
    return text;
  }

  const iconField = tabFields?.UrgencyIcon;
  const hasIcon = Boolean(iconField?.value?.src?.trim());

  return (
    <span className="inline-flex items-center gap-[4px] font-bold text-[#b91c1c]">
      <span>{text}</span>
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
