"use client";

import { Image as SitecoreImage, Text as SitecoreText } from "@sitecore-content-sdk/nextjs";
import Link from "next/link";
import React, { useMemo, useRef } from "react";

import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";
import Table from "@/components/ui/table/Table";
import { cn } from "@/lib/utils";

import { useActiveLocale } from "@/hooks/use-active-locale";
import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";
import { localizeHref } from "@/lib/locale-path";
import {
  formatCurrencyAmount,
  formatOrderDateDisplay,
  getInvoiceGridColumnDesignSlot,
  isGridColumnSortable,
  type InvoiceRecord,
} from "@/lib/orderManagementUtils";

import { OrderManagementEmptyState } from "../../partial/OrderManagementEmptyState";
import { OrderManagementHighlightedText } from "../../partial/OrderManagementHighlightedText";

import {
  OrderManagementSortTh,
  OrderManagementTableLoadingRows,
} from "../../partial/OrderManagementTableShared";
import { InvoiceDownloadButton } from "./InvoiceDownloadButton";
import { renderInvoiceDueIn } from "./renderInvoiceDueIn";
import { stashOrderDetailEntryPoint } from "@/lib/order-detail-entry-point";
import { TableColumn } from "@/components/ui/table/Table.types";

const headerCell =
  "!text-[var(--color-text-heading-color)] !border-b !border-[var(--color-border-gray)]";

const bodyCell =
  "!text-[var(--color-text-heading-color)] !align-middle !border-b !border-[var(--color-border-gray)]";

/** Stable unique keys for React Aria Table rows (duplicate/missing invoiceId breaks the collection). */
function invoiceTableRowKey(row: InvoiceRecord, index: number): string {
  const id = String(row.invoiceId ?? "").trim();
  if (id) return `${id}-${index}`;
  const num = String(row.invoiceNumber ?? "").trim();
  return num ? `inv-${num}-${index}` : `invoice-row-${index}`;
}

export function InvoicesDesktopTable({
  orderManagement,
}: {
  orderManagement: OrderManagementShell;
}): React.ReactElement {
  const {
    gridColumns,
    invoicePageSlice,
    pageSize,
    appliedSearch,
    locale,
    isOrdersListLoading,
    sortColumn,
    sortDir,
    sortableInvoiceColumnId,
    onSortInvoiceBySortColumnId,
    statusDisplay,
    tabFields,
    invoiceDueSoonThresholdDays,
    onInvoiceDownloadStart,
  } = orderManagement;

  const activeLocale = useActiveLocale();
  const q = appliedSearch.trim();

  const tableWrapRef = useRef<HTMLDivElement>(null);
  const showEmptyBelowHeaders = !isOrdersListLoading && invoicePageSlice.length === 0;
  const showRefetchOverlay = isOrdersListLoading && invoicePageSlice.length > 0;
  const showInitialTableLoading = isOrdersListLoading && invoicePageSlice.length === 0;
  const loadingSkeletonRowCount = Math.min(Math.max(pageSize, 1), 6);

  const alignProps: Record<string, "left" | "center" | "right"> = {
    "INVOICE DATE": "left",
    ORDER: "left",
    PO: "left",
    STATUS: "left",
    "DUE IN": "left",
    "EXPIRES IN": "left",
  };

  const columns: TableColumn<InvoiceRecord>[] = useMemo(() => {
    if (!tabFields) return [];
    const cols: TableColumn<InvoiceRecord>[] = [];

    for (let colIndex = 0; colIndex < gridColumns.length; colIndex++) {
      const col = gridColumns[colIndex];
      const slot = getInvoiceGridColumnDesignSlot(col);
      const title =
        col.fields?.GridName?.value?.trim() || col.displayName?.trim() || col.name || "";
      const sortId = sortableInvoiceColumnId(col);
      const sortable = isGridColumnSortable(col) && Boolean(sortId);

      cols.push({
        id: `inv-col-${colIndex}-${col.id}`,
        label: title,
        align: alignProps[col.name ?? ""],
        headerClassName: headerCell,
        cellClassName: cn(bodyCell, slot === 3 && "!min-w-0"),
        renderHeader: () =>
          sortable && sortId ? (
            <OrderManagementSortTh
              title={title}
              active={sortColumn === sortId}
              sortDir={sortDir}
              onPress={() => onSortInvoiceBySortColumnId(sortId)}
            />
          ) : (
            <span className="font-semibold uppercase tracking-wide text-[11px]">{title}</span>
          ),
        render: (row: InvoiceRecord) => {
          const orderDetailHref = localizeHref(
            `/orders-management/orders/${encodeURIComponent(row.orderHeaderId)}`,
            activeLocale
          );

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
                  href={orderDetailHref}
                  className={
                    "text-[var(--color-menu-hover-color)] text-[14px] font-[500] leading-[1.38] underline-offset-2 hover:underline min-w-0"
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
                  href={orderDetailHref}
                  className={
                    "text-[var(--color-menu-hover-color)] text-[14px] font-[500] leading-[1.38] underline-offset-2 hover:underline min-w-0"
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
            case 3: {
              const sd = statusDisplay(row.statusKey);
              const statusClass =
                row.statusKey === "invoice_paid"
                  ? "min-w-[65px] max-w-full bg-[#ecfdf3] text-[#047857]"
                  : row.statusKey === "invoice_invoiced"
                    ? "min-w-[65px] max-w-full bg-[#fff4e8] text-[#b45309]"
                    : "";
              return (
                <span
                  className={cn(
                    "inline-flex items-center justify-self-end gap-[4px] py-[5px] px-[6px] rounded-[4px] border border-solid text-[12px] font-[500] leading-[100%] overflow-hidden border",
                    statusClass
                  )}
                >
                  {sd.iconField?.value?.src ? (
                    <SitecoreImage
                      field={sd.iconField}
                      className={"shrink-0 object-contain"}
                      width={16}
                      height={16}
                      sizes="16px"
                    />
                  ) : null}
                  {sd.labelField ? (
                    <SitecoreText
                      field={sd.labelField}
                      tag="span"
                      className={
                        "block min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-start"
                      }
                    />
                  ) : (
                    <span
                      className={
                        "block min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-start"
                      }
                    >
                      {sd.label}
                    </span>
                  )}
                </span>
              );
            }
            case 4:
              return formatOrderDateDisplay(row.invoiceDate, locale);
            case 5:
              return renderInvoiceDueIn(row, invoiceDueSoonThresholdDays, tabFields);
            case 6:
              return formatCurrencyAmount(row.amount, row.currency, locale);
            default:
              return "—";
          }
        },
      });
    }

    cols.push({
      id: "invoice-download",
      label: "",
      headerClassName: `${headerCell} !text-right`,
      cellClassName: `${bodyCell} !text-right !py-[10px]`,
      renderHeader: () => <span className="sr-only">Actions</span>,
      render: (row: InvoiceRecord) => {
        const hasDownloadUrl = Boolean(row.downloadUrl?.trim());
        if (!hasDownloadUrl) return null;
        return (
          <InvoiceDownloadButton
            row={row}
            tabFields={tabFields}
            onDownloadStart={onInvoiceDownloadStart}
          />
        );
      },
    });

    return cols;
  }, [
    activeLocale,
    gridColumns,
    invoiceDueSoonThresholdDays,
    locale,
    onSortInvoiceBySortColumnId,
    q,
    sortColumn,
    sortDir,
    sortableInvoiceColumnId,
    statusDisplay,
    tabFields,
    onInvoiceDownloadStart,
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
        "hidden md:block relative w-full min-h-0 overflow-x-auto bg-[var(--color-bg-basic-color)]",
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
          <span className="sr-only">Loading invoices</span>
          <LoadingSkeleton variant="spinner" size="medium" />
        </div>
      ) : null}
      <Table<InvoiceRecord>
        data={invoicePageSlice}
        columns={columns}
        getRowKey={invoiceTableRowKey}
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
        ariaLabel="Invoices list"
        className={cn(
          "[&_table]:w-full [&_table]:border-collapse [&_table]:text-[13px] rounded-none border-0 shadow-none [&_table]:border-0",
          showRefetchOverlay && "pointer-events-none"
        )}
      />
    </div>
  );
}
