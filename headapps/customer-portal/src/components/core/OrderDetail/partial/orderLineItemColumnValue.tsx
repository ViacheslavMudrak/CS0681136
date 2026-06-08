"use client";

import React from "react";

import type { OrderDetailLineItem } from "../OrderDetail.type";
import {
  formatOrderDetailMoneyForDisplay,
  isOrderDetailExtendedNetPriceColumnKey,
  isOrderDetailNetUnitPriceColumnKey,
} from "@/lib/orderDetailUtils";

/**
 * Renders the display value for a CMS order line item column (normalized key from Value or displayName).
 */
export function renderOrderLineItemColumnValue(
  keyNorm: string,
  item: OrderDetailLineItem,
  locale: string
): React.ReactNode {
  if (isOrderDetailExtendedNetPriceColumnKey(keyNorm)) {
    return formatOrderDetailMoneyForDisplay(item.extendedNetPrice, locale);
  }
  if (isOrderDetailNetUnitPriceColumnKey(keyNorm)) {
    return formatOrderDetailMoneyForDisplay(item.netUnitPrice, locale);
  }
  if (keyNorm.includes("QUANTITY") || keyNorm === "QTY") {
    const q = item.quantity;
    if (!q) return "—";
    return `${q.value}`.trim();
  }
  if (keyNorm.includes("PRODUCT") && keyNorm.includes("TYPE")) {
    return item.productType ?? "—";
  }
  if (keyNorm.includes("ATTRIBUTE")) {
    const attrs = item.productAttributes ?? [];
    if (!attrs.length) return "—";
    return (
      <ul className="list-none m-0 p-0 space-y-[4px]">
        {attrs.map((a) => (
          <li key={`${a.key}-${a.value}`}>
            {a.key}: {a.value}
            {a.unit ? ` ${a.unit}` : ""}
          </li>
        ))}
      </ul>
    );
  }
  return "—";
}
