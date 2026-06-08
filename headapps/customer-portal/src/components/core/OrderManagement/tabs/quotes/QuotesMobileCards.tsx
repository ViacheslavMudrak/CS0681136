"use client";

import { Image as SitecoreImage, Text as SitecoreText } from "@sitecore-content-sdk/nextjs";
import Link from "next/link";
import React, { useRef } from "react";
import ChevronRightIcon from "src/components/shared/icons/ChevronRightIcon";
import OrderManagementMobileCardShell from "@/components/shared/order-management/OrderManagementMobileCardShell";

import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";
import { useActiveLocale } from "@/hooks/use-active-locale";
import { localizeHref } from "@/lib/locale-path";
import { stashQuoteDetailListingEntryPoint } from "@/lib/quote-detail-entry-point";
import {
  formatCurrencyAmount,
  formatOrderDateDisplay,
  getQuoteGridColumnDesignSlot,
  type QuoteRecord,
} from "@/lib/orderManagementUtils";

import { OrderManagementEmptyState } from "../../partial/OrderManagementEmptyState";
import { OrderManagementHighlightedText } from "../../partial/OrderManagementHighlightedText";
import { OrderManagementMobileCountRow } from "../../partial/OrderManagementTableShared";

import type { OrderManagementGridColumnItem } from "../../OrderManagement.type";
import { renderQuoteExpiresIn } from "./renderQuoteExpiresIn";

function getColumnLabel(col: OrderManagementGridColumnItem): string {
  return col.fields?.GridName?.value?.trim() || col.displayName?.trim() || col.name || "";
}

export function QuotesMobileCards({
  orderManagement,
}: {
  orderManagement: OrderManagementShell;
}): React.ReactElement {
  const {
    quotePageSlice,
    appliedSearch,
    locale,
    isOrdersListLoading,
    gridColumns,
    statusDisplay,
    tabFields,
    quoteExpirySoonThresholdDays,
    quoteDetailHref,
  } = orderManagement;

  const cardsRootRef = useRef<HTMLDivElement>(null);

  const activeLocale = useActiveLocale();
  const q = appliedSearch.trim();

  const visibleColumns = gridColumns
    .map((col, index) => ({ col, index, slot: getQuoteGridColumnDesignSlot(col) }))
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
  /** Status (slot 3) is shown in the card header next to the quote #, not as a label/value row. */
  const bodyRowColumns = displayColumns.filter((x) => x !== headerColumn && x.slot !== 3);

  return (
    <OrderManagementMobileCardShell
      cardsRootRef={cardsRootRef}
      isLoading={isOrdersListLoading}
      hasRows={quotePageSlice.length > 0}
      loadingLabel="Loading quotes"
      emptyState={<OrderManagementEmptyState orderManagement={orderManagement} />}
      refetchOverlay={
        <>
          {quotePageSlice.length > 0 ? (
            <OrderManagementMobileCountRow count={quotePageSlice.length} />
          ) : null}
        </>
      }
    >
      <div role="list" aria-label="Quotes">
        {quotePageSlice.map((row: QuoteRecord) => {
          const sd = statusDisplay(row.statusKey);
          const statusClass =
            row.statusKey === "order_ready"
              ? "bg-[#D1E9D6] text-[#1F7437]"
              : row.statusKey === "order_expired"
                ? "bg-[#FBDADB] text-[#970000]"
                : "";

          const expiresNode = renderQuoteExpiresIn(row, quoteExpirySoonThresholdDays, tabFields);

          const statusBadgeNode = (
            <span
              className={`${"inline-flex max-w-full shrink-0 items-center gap-[6px] overflow-hidden rounded-[4px] border py-[5px] px-[8px] text-[12px] font-medium"} ${statusClass}`.trim()}
            >
              {sd.iconField?.value?.src ? (
                <SitecoreImage
                  field={sd.iconField}
                  className={"shrink-0 object-contain"}
                  width={12}
                  height={12}
                  sizes="12px"
                />
              ) : null}
              {sd.labelField ? <SitecoreText field={sd.labelField} tag="span" /> : sd.label}
            </span>
          );

          const quoteCell = (slot: number): React.ReactNode => {
            switch (slot) {
              case 0:
                return q ? (
                  <OrderManagementHighlightedText text={row.quoteNumber} query={q} />
                ) : (
                  row.quoteNumber
                );
              case 1:
                return q ? (
                  <OrderManagementHighlightedText text={row.contactPerson} query={q} />
                ) : (
                  row.contactPerson
                );
              case 2:
                return row.itemCount === null || row.itemCount === undefined ? "—" : row.itemCount;
              case 3:
                return statusBadgeNode;
              case 4:
                return formatOrderDateDisplay(row.quoteDateIso, locale);
              case 5:
                return expiresNode;
              case 6:
                return formatCurrencyAmount(row.totalAmount, row.currency, locale);
              default:
                return "—";
            }
          };

          return (
            <article
              key={row.quoteId}
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
                    <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-[7px]">
                      <Link
                        href={localizeHref(quoteDetailHref(row), activeLocale)}
                        className="min-h-0 min-w-0 truncate text-[20px] font-bold leading-normal text-[var(--color-menu-hover-color)] underline-offset-2 hover:underline"
                        onClick={stashQuoteDetailListingEntryPoint}
                      >
                        {quoteCell(headerColumn.slot)}
                      </Link>
                      {statusBadgeNode}
                    </div>
                  </div>
                </header>
              ) : null}

              {bodyRowColumns.map((meta) => (
                <div
                  key={`quote-mobile-${meta.col.id}`}
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
                    {quoteCell(meta.slot)}
                  </span>
                </div>
              ))}

              <div
                className={`${"flex h-[25px] shrink-0 items-start justify-end self-stretch pt-0"} !h-auto flex-wrap gap-2 justify-end`}
              >
                <Link
                  href={localizeHref(quoteDetailHref(row), activeLocale)}
                  className={
                    "inline-flex items-center justify-center px-[6px] py-[5.25px] w-[26px] h-[25px] rounded-[2px] border border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] text-[var(--color-text-heading-color)] no-underline hover:bg-[var(--color-bg-lighter-gray)] focus:outline-none focus-visible:ring-2"
                  }
                  aria-label={`Quote details ${row.quoteNumber}`}
                  onClick={stashQuoteDetailListingEntryPoint}
                >
                  <ChevronRightIcon width={14} decorative fill="#00287B" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </OrderManagementMobileCardShell>
  );
}
