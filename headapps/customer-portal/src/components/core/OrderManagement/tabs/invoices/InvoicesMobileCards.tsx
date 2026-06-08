"use client";

import { Image as SitecoreImage, Text as SitecoreText } from "@sitecore-content-sdk/nextjs";
import Link from "next/link";
import React, { useRef } from "react";

import { useActiveLocale } from "@/hooks/use-active-locale";
import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";
import { localizeHref } from "@/lib/locale-path";
import {
  formatCurrencyAmount,
  formatOrderDateDisplay,
  getInvoiceGridColumnDesignSlot,
  type InvoiceRecord,
} from "@/lib/orderManagementUtils";

import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";

import { OrderManagementEmptyState } from "../../partial/OrderManagementEmptyState";
import { OrderManagementHighlightedText } from "../../partial/OrderManagementHighlightedText";
import { OrderManagementMobileCountRow } from "../../partial/OrderManagementTableShared";

import type { OrderManagementGridColumnItem } from "../../OrderManagement.type";
import { InvoiceDownloadButton } from "./InvoiceDownloadButton";

import { renderInvoiceDueIn } from "./renderInvoiceDueIn";
import { stashOrderDetailEntryPoint } from "@/lib/order-detail-entry-point";

function getColumnLabel(col: OrderManagementGridColumnItem): string {
  return col.fields?.GridName?.value?.trim() || col.displayName?.trim() || col.name || "";
}

export function InvoicesMobileCards({
  orderManagement,
}: {
  orderManagement: OrderManagementShell;
}): React.ReactElement {
  const {
    invoicePageSlice,
    appliedSearch,
    locale,
    isOrdersListLoading,
    gridColumns,
    statusDisplay,
    tabFields,
    invoiceDueSoonThresholdDays,
    onInvoiceDownloadStart,
  } = orderManagement;

  const cardsRootRef = useRef<HTMLDivElement>(null);

  const activeLocale = useActiveLocale();
  const q = appliedSearch.trim();

  const visibleColumns = gridColumns
    .map((col, index) => ({ col, index, slot: getInvoiceGridColumnDesignSlot(col) }))
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
  /** Status (slot 3) is shown in the card header next to the invoice #, not as a label/value row. */
  const bodyRowColumns = displayColumns.filter((x) => x !== headerColumn && x.slot !== 3);

  if (!isOrdersListLoading && invoicePageSlice.length === 0) {
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

  if (isOrdersListLoading && invoicePageSlice.length === 0) {
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
      {invoicePageSlice.length > 0 ? (
        <OrderManagementMobileCountRow count={invoicePageSlice.length} />
      ) : null}

      <div className="flex flex-col gap-[12px] lg:hidden" role="list">
        {invoicePageSlice.map((row: InvoiceRecord) => {
          const detailHref = localizeHref(
            `/orders-management/orders/${encodeURIComponent(row.orderHeaderId)}`,
            activeLocale
          );
          const sd = statusDisplay(row.statusKey);
          const statusClass =
            row.statusKey === "invoice_paid"
              ? "min-w-[65px] max-w-full bg-[#ecfdf3] text-[#047857]"
              : row.statusKey === "invoice_invoiced"
                ? "min-w-[65px] max-w-full bg-[#fff4e8] text-[#b45309]"
                : "";

          const dueNode = renderInvoiceDueIn(row, invoiceDueSoonThresholdDays, tabFields);
          const hasDownloadUrl = Boolean(row.downloadUrl?.trim());

          const statusBadgeNode = (
            <span
              className={`${"inline-flex max-w-full min-w-0 shrink-0 items-center justify-self-end gap-[6px] overflow-hidden rounded-[4px] border py-[4px] px-[10px] text-[12px] font-medium"} ${statusClass}`.trim()}
            >
              {sd.iconField?.value?.src ? (
                <SitecoreImage
                  field={sd.iconField}
                  className={"shrink-0 object-contain"}
                  width={14}
                  height={14}
                  sizes="14px"
                />
              ) : null}
              {sd.labelField ? <SitecoreText field={sd.labelField} tag="span" /> : sd.label}
            </span>
          );

          const invoiceCell = (slot: number): React.ReactNode => {
            switch (slot) {
              case 0:
                return q ? (
                  <OrderManagementHighlightedText text={row.invoiceNumber} query={q} />
                ) : (
                  row.invoiceNumber
                );
              case 1:
                return (
                  <Link
                    href={detailHref}
                    className={
                      "min-w-0 flex-1 break-words text-right text-[14px] font-medium leading-tight text-[var(--color-menu-hover-color)] underline-offset-2 hover:underline [overflow-wrap:anywhere] line-clamp-2 overflow-hidden"
                    }
                    onClick={() => stashOrderDetailEntryPoint("Invoices_Listing")}
                  >
                    {q ? (
                      <OrderManagementHighlightedText text={row.poNumber} query={q} />
                    ) : (
                      row.poNumber
                    )}
                  </Link>
                );
              case 2:
                return (
                  <Link
                    href={detailHref}
                    className={
                      "min-w-0 flex-1 break-words text-right text-[14px] font-medium leading-tight text-[var(--color-menu-hover-color)] underline-offset-2 hover:underline [overflow-wrap:anywhere] line-clamp-2 overflow-hidden"
                    }
                    onClick={() => stashOrderDetailEntryPoint("Invoices_Listing")}
                  >
                    {q ? (
                      <OrderManagementHighlightedText text={row.orderNumber} query={q} />
                    ) : (
                      row.orderNumber
                    )}
                  </Link>
                );
              case 3:
                return statusBadgeNode;
              case 4:
                return formatOrderDateDisplay(row.invoiceDate, locale);
              case 5:
                return dueNode;
              case 6:
                return formatCurrencyAmount(row.amount, row.currency, locale);
              default:
                return "—";
            }
          };

          return (
            <article
              key={row.invoiceId}
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
                    <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-[7px]">
                      <span className="min-h-0 min-w-0 flex-1 break-words text-[18px] font-bold leading-[1.5] text-[var(--color-text-heading-color)] [overflow-wrap:anywhere] line-clamp-2 overflow-hidden">
                        {invoiceCell(headerColumn.slot)}
                      </span>
                      {statusBadgeNode}
                    </div>
                  </div>
                </header>
              ) : null}

              {bodyRowColumns.map((meta) => (
                <div
                  key={`inv-mobile-${meta.col.id}`}
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
                    {invoiceCell(meta.slot)}
                  </span>
                </div>
              ))}

              <div
                className={`${"flex h-[25px] shrink-0 items-start justify-end self-stretch pt-0"} flex justify-end`}
              >
                {tabFields && hasDownloadUrl ? (
                  <InvoiceDownloadButton
                    row={row}
                    tabFields={tabFields}
                    showLabelAfterIcon
                    onDownloadStart={onInvoiceDownloadStart}
                  />
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
