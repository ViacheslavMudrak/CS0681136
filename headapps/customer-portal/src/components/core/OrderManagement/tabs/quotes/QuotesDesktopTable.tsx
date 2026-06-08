"use client";

import { Image as SitecoreImage, Text as SitecoreText } from "@sitecore-content-sdk/nextjs";
import Link from "next/link";
import React, { useMemo, useRef } from "react";
import ChevronRightIcon from "src/components/shared/icons/ChevronRightIcon";

import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";
import Table from "@/components/ui/table/Table";
import { useActiveLocale } from "@/hooks/use-active-locale";
import { localizeHref } from "@/lib/locale-path";
import { stashQuoteDetailListingEntryPoint } from "@/lib/quote-detail-entry-point";
import { cn } from "@/lib/utils";

import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";
import {
  formatCurrencyAmount,
  formatOrderDateDisplay,
  getQuoteGridColumnDesignSlot,
  isGridColumnSortable,
  type QuoteRecord,
} from "@/lib/orderManagementUtils";

import { OrderManagementEmptyState } from "../../partial/OrderManagementEmptyState";
import { OrderManagementHighlightedText } from "../../partial/OrderManagementHighlightedText";

import {
  OrderManagementSortTh,
  OrderManagementTableLoadingRows,
} from "../../partial/OrderManagementTableShared";
import { renderQuoteExpiresIn } from "./renderQuoteExpiresIn";
import { TableColumn } from "@/components/ui/table/Table.types";
import { StatusBadge } from "@/components/ui/StatusBadge";

const headerCell =
  "!text-[var(--color-text-heading-color)] !border-b !border-[var(--color-border-gray)]";

const bodyCell =
  "!text-[var(--color-text-heading-color)] !align-middle !border-b !border-[var(--color-border-gray)]";

export function QuotesDesktopTable({
  orderManagement,
}: {
  orderManagement: OrderManagementShell;
}): React.ReactElement {
  const {
    gridColumns,
    quotePageSlice,
    pageSize,
    appliedSearch,
    locale,
    isOrdersListLoading,
    sortColumn,
    sortDir,
    sortableQuoteColumnId,
    onSortQuoteBySortColumnId,
    statusDisplay,
    tabFields,
    quoteExpirySoonThresholdDays,
    quoteDetailHref,
  } = orderManagement;

  const activeLocale = useActiveLocale();
  const q = appliedSearch.trim();

  const tableWrapRef = useRef<HTMLDivElement>(null);
  const showEmptyBelowHeaders = !isOrdersListLoading && quotePageSlice.length === 0;
  const showRefetchOverlay = isOrdersListLoading && quotePageSlice.length > 0;
  const showInitialTableLoading = isOrdersListLoading && quotePageSlice.length === 0;
  const loadingSkeletonRowCount = Math.min(Math.max(pageSize, 1), 6);

  const alignProps: Record<string, "left" | "center" | "right"> = {
    QUOTE: "left",
    "CONTACT PERSON": "left",
    ITEMS: "center",
    STATUS: "left",
    "QUOTE DATE": "left",
    "EXPIRES IN": "left",
  };

  const columns: TableColumn<QuoteRecord>[] = useMemo(() => {
    if (!tabFields) return [];
    const cols: TableColumn<QuoteRecord>[] = [];

    for (let colIndex = 0; colIndex < gridColumns.length; colIndex++) {
      const col = gridColumns[colIndex];
      const slot = getQuoteGridColumnDesignSlot(col);
      const title =
        col.fields?.GridName?.value?.trim() || col.displayName?.trim() || col.name || "";
      const sortId = sortableQuoteColumnId(col);
      const sortable = isGridColumnSortable(col) && Boolean(sortId);

      cols.push({
        id: `quote-col-${colIndex}-${col.id}`,
        label: title,
        align: alignProps[col.name ?? ""],
        headerClassName: headerCell,
        cellClassName: cn(bodyCell, slot === 3 && "!min-w-0"),
        renderHeader: () =>
          sortable && sortId ? (
            <OrderManagementSortTh
              title={title}
              active={
                sortColumn === sortId || (sortColumn === "orderDate" && sortId === "quoteDate")
              }
              sortDir={sortDir}
              onPress={() => onSortQuoteBySortColumnId(sortId)}
            />
          ) : (
            <span className="font-semibold uppercase tracking-wide text-[11px]">{title}</span>
          ),
        render: (row: QuoteRecord) => {
          switch (slot) {
            case 0: {
              const num = q ? (
                <OrderManagementHighlightedText text={row.quoteNumber} query={q} />
              ) : (
                row.quoteNumber
              );
              return (
                <Link
                  href={localizeHref(quoteDetailHref(row), activeLocale)}
                  className={
                    "text-[var(--color-menu-hover-color)] text-[14px] font-[500] leading-[1.38] underline-offset-2 hover:underline min-w-0"
                  }
                  onClick={stashQuoteDetailListingEntryPoint}
                >
                  <span className="font-semibold">{num}</span>
                </Link>
              );
            }
            case 1:
              return q ? (
                <OrderManagementHighlightedText text={row.contactPerson} query={q} />
              ) : (
                row.contactPerson
              );
            case 2:
              return (
                <div className="truncate text-center md:max-w-[70px] lg:max-w-[none]">
                  {row.itemCount === null || row.itemCount === undefined ? "—" : row.itemCount}
                </div>
              );
            case 3: {
              const sd = statusDisplay(row.statusKey);

              return (
                <StatusBadge
                  type={
                    row.statusKey === "order_ready"
                      ? "Ready"
                      : row.statusKey === "order_expired"
                        ? "Expired"
                        : null
                  }
                  statusIcon={
                    sd.iconField?.value?.src ? (
                      <SitecoreImage
                        field={sd.iconField}
                        className={"shrink-0 object-contain"}
                        width={12}
                        height={12}
                        sizes="12px"
                      />
                    ) : undefined
                  }
                  statusLabel={sd.label}
                />
              );
            }
            case 4:
              return formatOrderDateDisplay(row.quoteDateIso, locale);
            case 5:
              return renderQuoteExpiresIn(row, quoteExpirySoonThresholdDays, tabFields);
            case 6:
              return formatCurrencyAmount(row.totalAmount, row.currency, locale);
            default:
              return "—";
          }
        },
      });
    }

    cols.push({
      id: "quote-detail",
      label: "",
      width: "w-[52px]",
      headerClassName: `${headerCell} !text-right !w-[52px]`,
      cellClassName: `${bodyCell} !text-right !w-[52px]`,
      renderHeader: () => <span className="sr-only">Quote details</span>,
      render: (row: QuoteRecord) => (
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
      ),
    });

    return cols;
  }, [
    activeLocale,
    gridColumns,
    locale,
    onSortQuoteBySortColumnId,
    q,
    quoteDetailHref,
    quoteExpirySoonThresholdDays,
    sortColumn,
    sortDir,
    sortableQuoteColumnId,
    statusDisplay,
    tabFields,
  ]);

  const zebraRowBg = useMemo(
    () => (index: number) =>
      index % 2 === 0 ? "bg-[var(--color-bg-basic-color)]" : "bg-[var(--color-bg-table-stripe)]",
    []
  );

  return (
    <div
      ref={tableWrapRef}
      className={cn(
        "hidden md:block relative w-full min-h-0 overflow-x-auto bg-[var(--color-bg-basic-color)] ",
        showInitialTableLoading && "min-h-[288px]"
      )}
    >
      {showRefetchOverlay ? (
        <div
          className={
            "absolute left-0 right-0 top-0 z-20 flex h-[52px] items-center justify-center gap-2 border-b border-[var(--color-border-gray)] backdrop-blur-[1px] bg-[color-mix(in_srgb,_var(--color-bg-basic-color)_88%,_transparent)] pointer-events-none"
          }
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="sr-only">Loading quotes</span>
          <LoadingSkeleton variant="spinner" size="medium" />
        </div>
      ) : null}
      <Table<QuoteRecord>
        data={quotePageSlice}
        columns={columns}
        getRowKey={(row) => row.quoteId}
        isLoading={isOrdersListLoading}
        loadingWithHeader
        loadingComponent={<OrderManagementTableLoadingRows rowCount={loadingSkeletonRowCount} />}
        loadingReplacesRows={false}
        emptyWithHeader={showEmptyBelowHeaders}
        emptyComponent={<OrderManagementEmptyState orderManagement={orderManagement} />}
        striped={false}
        hoverable
        showBorders={false}
        borderStyle="none"
        sortable={false}
        rowBgColor={zebraRowBg}
        hoverColor="hover:bg-[var(--color-bg-lighter-gray)]"
        size="md"
        density="compact"
        ariaLabel="Quotes list"
        className={cn(
          "[&_table]:w-full [&_table]:border-collapse [&_table]:text-[13px] rounded-none border-0 shadow-none [&_table]:border-0",
          showRefetchOverlay && "pointer-events-none"
        )}
      />
    </div>
  );
}
