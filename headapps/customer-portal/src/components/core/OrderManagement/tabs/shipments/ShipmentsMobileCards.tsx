"use client";

import Link from "next/link";
import React, { useRef } from "react";

import { useActiveLocale } from "@/hooks/use-active-locale";
import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";
import { localizeHref } from "@/lib/locale-path";
import { getShipmentGridColumnDesignSlot, type ShipmentGridRow } from "@/lib/orderManagementUtils";

import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";

import { OrderManagementEmptyState } from "../../partial/OrderManagementEmptyState";
import { OrderManagementHighlightedText } from "../../partial/OrderManagementHighlightedText";
import { OrderManagementMobileCountRow } from "../../partial/OrderManagementTableShared";

import type { OrderManagementGridColumnItem } from "../../OrderManagement.type";
import { ShipmentsPackingSlipButton } from "./ShipmentsPackingSlipButton";
import { formatShippingTabDateDisplay } from "@/lib/shipping-tab-date-display";
import { stashOrderDetailEntryPoint } from "@/lib/order-detail-entry-point";
import { ShipmentsExternalLinkIcon } from "./ShipmentsExternalLinkIcon";

function getColumnLabel(col: OrderManagementGridColumnItem): string {
  return col.fields?.GridName?.value?.trim() || col.displayName?.trim() || col.name || "";
}

function shipmentCell(
  slot: number,
  row: ShipmentGridRow,
  q: string,
  detailHref: string,
  locale: string
) {
  switch (slot) {
    case 0: {
      const trackingHref = row.trackingUrl?.trim();
      const trackingNumber = row.trackingNumber?.trim() ?? "";
      const trackingLabel = q ? (
        <OrderManagementHighlightedText text={row.trackingNumber} query={q} />
      ) : (
        row.trackingNumber
      );
      if (trackingHref) {
        return (
          <a
            href={trackingHref}
            target="_blank"
            rel="noopener noreferrer"
            className={"inline-flex min-w-0 items-start gap-[5px] no-underline"}
            aria-label={`Open tracking for ${row.trackingNumber} in a new tab`}
          >
            <span
              className={
                "min-w-0 break-words text-[18px] font-[700] leading-[1.5] text-[#0377BA] [overflow-wrap:anywhere] line-clamp-2 overflow-hidden"
              }
            >
              {trackingLabel}
            </span>
            <span className={"text-[#0377BA] font-[500] mt-[-4px]"}>
              <ShipmentsExternalLinkIcon size={16} />
            </span>
          </a>
        );
      }
      if (trackingNumber) {
        return (
          <span className={"leading-[1.375] text-[var(--color-text-heading-color)]"}>
            {trackingLabel}
          </span>
        );
      }
      return (
        <span className={"leading-[1.375] text-[var(--color-text-heading-color)]"}>
          Not available
        </span>
      );
    }
    case 1:
      return q ? <OrderManagementHighlightedText text={row.carrier} query={q} /> : row.carrier;
    case 2:
      return (
        <Link
          href={detailHref}
          className={
            "min-w-0 flex-1 break-words text-right text-[14px] font-medium leading-tight text-[var(--color-menu-hover-color)] underline-offset-2 hover:underline [overflow-wrap:anywhere] line-clamp-2 overflow-hidden"
          }
          onClick={() => stashOrderDetailEntryPoint("Shipments_Listing")}
        >
          {q ? <OrderManagementHighlightedText text={row.poNumber} query={q} /> : row.poNumber}
        </Link>
      );
    case 3:
      return (
        <Link
          href={detailHref}
          className={
            "min-w-0 flex-1 break-words text-right text-[14px] font-medium leading-tight text-[var(--color-menu-hover-color)] underline-offset-2 hover:underline [overflow-wrap:anywhere] line-clamp-2 overflow-hidden"
          }
          onClick={() => stashOrderDetailEntryPoint("Shipments_Listing")}
        >
          {q ? (
            <OrderManagementHighlightedText text={row.orderNumber} query={q} />
          ) : (
            row.orderNumber
          )}
        </Link>
      );
    case 4:
      return row.itemCount;
    case 5:
      return formatShippingTabDateDisplay(row.shipDateIso, locale);
    default:
      return "—";
  }
}

export function ShipmentsMobileCards({
  orderManagement,
}: {
  orderManagement: OrderManagementShell;
}): React.ReactElement {
  const {
    gridColumns,
    shipmentPageSlice,
    appliedSearch,
    locale,
    isOrdersListLoading,
    onPackingSlipDownloadStart,
    tabFields,
  } = orderManagement;

  const cardsRootRef = useRef<HTMLDivElement>(null);

  const activeLocale = useActiveLocale();
  const q = appliedSearch.trim();

  const visibleColumns = gridColumns
    .map((col, index) => ({ col, index, slot: getShipmentGridColumnDesignSlot(col) }))
    .filter(
      (x): x is { col: OrderManagementGridColumnItem; index: number; slot: number } =>
        x.slot !== null
    );
  const seenSlots = new Set<number>();
  const displayColumns = visibleColumns.filter((x) => {
    if (seenSlots.has(x.slot)) return false;
    seenSlots.add(x.slot);
    return true;
  });
  const headerColumn = displayColumns.find((x) => x.slot === 0) ?? displayColumns[0];
  const rowColumns = displayColumns.filter((x) => x !== headerColumn);

  if (!isOrdersListLoading && shipmentPageSlice.length === 0) {
    return (
      <div
        ref={cardsRootRef}
        className={
          "relative overflow-x-clip overscroll-x-none pt-[15px] pr-[15px] pb-[21px] pl-[15px] gap-[15px] lg:hidden"
        }
      >
        <div className="flex flex-col gap-[12px] lg:hidden" role="status">
          <OrderManagementEmptyState orderManagement={orderManagement} />
        </div>
      </div>
    );
  }

  if (isOrdersListLoading && shipmentPageSlice.length === 0) {
    return (
      <div
        ref={cardsRootRef}
        className={
          "relative overflow-x-clip overscroll-x-none pt-[15px] pr-[15px] pb-[21px] pl-[15px] gap-[15px] md:hidden"
        }
      >
        <div
          className={"flex flex-col gap-[12px] lg:hidden"}
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="sr-only">Loading</span>
          <div className="flex w-full max-w-lg flex-col items-center justify-center gap-5 py-16 px-4 mx-auto">
            <LoadingSkeleton variant="skeleton" size="medium" className="!p-0 w-full" />
            <LoadingSkeleton variant="skeleton" size="medium" className="!p-0 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardsRootRef}
      className={
        "relative overflow-x-clip overscroll-x-none pt-[15px] pr-[15px] pb-[21px] pl-[15px] gap-[15px] lg:hidden"
      }
    >
      {shipmentPageSlice.length > 0 ? (
        <OrderManagementMobileCountRow count={shipmentPageSlice.length} />
      ) : null}

      <div className="flex flex-col gap-[12px] lg:hidden" role="list">
        {shipmentPageSlice.map((row: ShipmentGridRow) => {
          const detailHref = localizeHref(
            `/orders-management/orders/${encodeURIComponent(row.orderHeaderId)}`,
            activeLocale
          );
          return (
            <article
              key={row.rowId}
              className={
                "flex flex-col gap-[7px] overflow-hidden rounded-[8px] border border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] p-[15px]"
              }
              role="listitem"
            >
              {headerColumn ? (
                <header
                  className={"w-full shrink-0 border-b border-[var(--color-border-gray)] pb-[8px]"}
                >
                  <div className={"flex min-h-0 min-w-0 flex-1 flex-col gap-0"}>
                    <p
                      className={
                        "w-full text-[11px] font-bold uppercase leading-[1.375] text-[var(--color-text-heading-color)]"
                      }
                    >
                      {getColumnLabel(headerColumn.col)}
                    </p>
                    <div className={"flex w-full min-w-0 items-start gap-[7px]"}>
                      <span
                        className={
                          "min-h-0 min-w-0 flex-1 break-words text-[20px] font-bold leading-normal text-[var(--color-menu-hover-color)] underline-offset-2 hover:underline [overflow-wrap:anywhere] line-clamp-2 overflow-hidden"
                        }
                      >
                        {shipmentCell(headerColumn.slot, row, q, detailHref, locale)}
                      </span>
                    </div>
                  </div>
                </header>
              ) : null}

              {rowColumns.map((meta) => (
                <div
                  key={`ship-mobile-${meta.col.id}`}
                  className={
                    "flex w-full items-start justify-between gap-[12px] border-b border-[var(--color-border-gray)] pb-[8px]"
                  }
                >
                  <span
                    className={
                      "min-w-0 basis-[42%] break-words text-[11px] font-bold uppercase leading-[1.375] text-[var(--color-text-heading-color)] [overflow-wrap:anywhere] line-clamp-2 overflow-hidden"
                    }
                  >
                    {getColumnLabel(meta.col)}
                  </span>
                  <span
                    className={
                      "min-w-0 flex-1 break-words text-right text-[14px] font-normal leading-[1.375] text-[var(--color-text-heading-color)] [overflow-wrap:anywhere] line-clamp-2 overflow-hidden"
                    }
                  >
                    {shipmentCell(meta.slot, row, q, detailHref, locale)}
                  </span>
                </div>
              ))}

              <div
                className={`${"flex h-[25px] shrink-0 items-start justify-end self-stretch pt-0"} !h-auto w-full justify-end`}
              >
                <ShipmentsPackingSlipButton
                  rowId={row.rowId}
                  documentUrl={row.documentUrl}
                  tabFields={tabFields}
                  onDownloadStart={onPackingSlipDownloadStart}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
