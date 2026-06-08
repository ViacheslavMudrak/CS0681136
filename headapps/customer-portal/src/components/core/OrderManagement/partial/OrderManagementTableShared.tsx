"use client";

import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import React from "react";

import Button from "@/components/ui/Button";

import { cn } from "@/lib/utils";

/**
 * Shared typography tokens for Order Management list/grid pages and the Quote detail page.
 * Centralizing these prevents per-component px drift and keeps a single Figma-aligned scale
 * across desktop, tablet, and mobile breakpoints.
 */
export const OM_TYPE = {
  /** Primary cell content: 14px / normal */
  cell: "text-[14px] leading-[1.375]",
  /** Emphasized cell content: 14px / medium */
  cellMedium: "text-[14px] font-[500] leading-[1.375]",
  /** Secondary / supporting text: 12px */
  supporting: "text-[12px] leading-[1.375] text-[#7A7B7F]",
  /** Column/field (table header) label: 11px bold uppercase, tablet tracking/line-height */
  label: "text-[11px] font-[700] uppercase tracking-[0.5px] leading-[15px] text-[#222]",
  /** Inline button text (e.g. "Detail"): 12px */
  button: "text-[12px] leading-[1.375] text-[#00287B]",
  /** Search input + placeholder: 13px (tablet/mobile toolbar) */
  search: "text-[13px] leading-[1.25]",
} as const;

export function OrderManagementSortTh({
  title,
  active,
  sortDir,
  onPress,
  className,
  width,
}: {
  title: string;
  active: boolean;
  sortDir: "asc" | "desc";
  className?: string;
  width?: string;
  onPress: () => void;
}): React.ReactElement {
  return (
    <Button
      type="button"
      variant="transparent"
      className={cn(
        "inline-flex items-center justify-start gap-[6px] bg-transparent border-0 p-0 cursor-pointer text-inherit hover:text-[var(--color-menu-hover-color)] focus:outline-none focus-visible:ring-2",
        className
      )}
      onPress={onPress}
      aria-label={`Sort by ${title}`}
    >
      <span className={cn(OM_TYPE.label, "text-inherit", width)}>{title}</span>
      <div className="flex flex-col gap-[0px]">
        <Icon
          icon={faAngleUp}
          width={10}
          className={`${active && sortDir === "asc" ? "opacity-100" : "opacity-50"} shrink-0`}
          aria-hidden
        />
        <Icon
          icon={faAngleDown}
          width={10}
          className={`${active && sortDir !== "asc" ? "opacity-100" : "opacity-50"} shrink-0`}
          aria-hidden
        />
      </div>
    </Button>
  );
}

/**
 * Mobile-only "Showing N results" count summary rendered above the card list.
 * Shared across Orders, Invoices, Shipments, and Quotes mobile cards for consistent layout/wording.
 */
export function OrderManagementMobileCountRow({ count }: { count: number }): React.ReactElement {
  return (
    <div className="flex items-center gap-[4px] text-[12px] font-[400] leading-[1.38] py-[8px] px-[14px] mb-[16px]">
      <span>Showing</span>
      <span>{count} results</span>
    </div>
  );
}

const DEFAULT_LOADING_ROW_COUNT = 6;

export function OrderManagementTableLoadingRows({
  rowCount = DEFAULT_LOADING_ROW_COUNT,
}: {
  rowCount?: number;
}): React.ReactElement {
  const count = Math.max(1, Math.min(rowCount, DEFAULT_LOADING_ROW_COUNT));
  return (
    <div className="flex flex-col gap-2 w-full py-1" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="h-[40px] rounded-[6px] bg-[var(--color-bg-lighter-gray)] animate-pulse"
        />
      ))}
    </div>
  );
}
