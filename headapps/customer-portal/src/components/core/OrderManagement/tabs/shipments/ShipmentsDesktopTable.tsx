"use client";

import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import Link from "next/link";
import React, { useMemo, useRef } from "react";

import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";
import Table from "@/components/ui/table/Table";
import { cn } from "@/lib/utils";

import { useActiveLocale } from "@/hooks/use-active-locale";
import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";
import { localizeHref } from "@/lib/locale-path";
import {
  getShipmentGridColumnDesignSlot,
  isGridColumnSortable,
  type ShipmentGridRow,
} from "@/lib/orderManagementUtils";

import type { OrderManagementGridColumnItem } from "../../OrderManagement.type";

import { OrderManagementEmptyState } from "../../partial/OrderManagementEmptyState";
import { OrderManagementHighlightedText } from "../../partial/OrderManagementHighlightedText";
import {
  OrderManagementSortTh,
  OrderManagementTableLoadingRows,
} from "../../partial/OrderManagementTableShared";
import { ShipmentsPackingSlipButton } from "./ShipmentsPackingSlipButton";
import { formatShippingTabDateDisplay } from "@/lib/shipping-tab-date-display";

import { stashOrderDetailEntryPoint } from "@/lib/order-detail-entry-point";
import { TableColumn } from "@/components/ui/table/Table.types";
import { ShipmentsExternalLinkIcon } from "./ShipmentsExternalLinkIcon";

const headerCell =
  "!normal-case !text-[var(--color-text-heading-color)] !border-b !border-[var(--color-border-gray)]";

const bodyCell =
  "!text-[var(--color-text-heading-color)] !align-middle !border-b !border-[var(--color-border-gray)]";

export function ShipmentsDesktopTable({
  orderManagement,
}: {
  orderManagement: OrderManagementShell;
}): React.ReactElement {
  const {
    gridColumns,
    shipmentPageSlice,
    pageSize,
    appliedSearch,
    locale,
    isOrdersListLoading,
    sortColumn,
    sortDir,
    sortableShipmentColumnId,
    onSortShipmentBySortColumnId,
    onPackingSlipDownloadStart,
    tabFields,
  } = orderManagement;

  const activeLocale = useActiveLocale();
  const q = appliedSearch.trim();

  const tableWrapRef = useRef<HTMLDivElement>(null);
  const showEmptyBelowHeaders = !isOrdersListLoading && shipmentPageSlice.length === 0;
  const showRefetchOverlay = isOrdersListLoading && shipmentPageSlice.length > 0;
  const showInitialTableLoading = isOrdersListLoading && shipmentPageSlice.length === 0;
  const loadingSkeletonRowCount = Math.min(Math.max(pageSize, 1), 6);

  const alignProps: Record<string, "left" | "center" | "right"> = {
    TRACKING: "left",
    CARRIER: "left",
    PO: "left",
    ORDER: "left",
    ITEMS: "center",
    "SHIP DATE": "left",
  };

  const columns: TableColumn<ShipmentGridRow>[] = useMemo(() => {
    const cols: TableColumn<ShipmentGridRow>[] = [];
    for (let colIndex = 0; colIndex < gridColumns.length; colIndex++) {
      const col = gridColumns[colIndex];
      const slot = getShipmentGridColumnDesignSlot(col);
      const title =
        col.fields?.GridName?.value?.trim() || col.displayName?.trim() || col.name || "";
      const sortId = sortableShipmentColumnId(col);
      const sortable = isGridColumnSortable(col) && sortId !== null;
      const isItemsColumn = slot === 4;

      cols.push({
        id: `ship-col-${colIndex}-${col.id}`,
        label: title,
        align: alignProps[col.name ?? ""],
        headerClassName: cn(headerCell, isItemsColumn && "!text-center"),
        cellClassName: cn(bodyCell, isItemsColumn && "!text-center"),
        renderHeader: () =>
          sortable && sortId ? (
            <OrderManagementSortTh
              title={title}
              active={sortColumn === sortId}
              sortDir={sortDir}
              onPress={() => onSortShipmentBySortColumnId(sortId)}
            />
          ) : (
            <span className="uppercase tracking-wide">{title}</span>
          ),
        render: (row: ShipmentGridRow) => {
          const orderDetailHref = localizeHref(
            `/orders-management/orders/${encodeURIComponent(row.orderHeaderId)}`,
            activeLocale
          );

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
                    className={`${"inline-flex min-w-0 items-start gap-[5px] no-underline"} ${"text-[var(--color-menu-hover-color)] text-[14px] font-[500] leading-[1.38] underline-offset-2 hover:underline min-w-0"}`}
                    aria-label={`Open tracking for ${row.trackingNumber} in a new tab`}
                  >
                    <span
                      className={
                        "text-[var(--color-menu-hover-color)] text-[14px] font-[500] leading-[1.38] underline-offset-2 hover:underline min-w-0"
                      }
                    >
                      {trackingLabel}
                    </span>
                    <span className="mt-[-3px]">
                      <ShipmentsExternalLinkIcon size={13} />
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
              return (
                <div className="truncate md:max-w-[70px] lg:max-w-[none]">
                  {q ? (
                    <OrderManagementHighlightedText text={row.carrier} query={q} />
                  ) : (
                    row.carrier
                  )}
                </div>
              );
            case 2:
              return (
                <Link
                  href={orderDetailHref}
                  className={
                    "text-[var(--color-menu-hover-color)] text-[14px] font-[500] leading-[1.38] underline-offset-2 hover:underline min-w-0"
                  }
                  onClick={() => stashOrderDetailEntryPoint("Shipments_Listing")}
                >
                  <div className="truncate md:max-w-[70px] lg:max-w-[none]">
                    {q ? (
                      <OrderManagementHighlightedText text={row.poNumber} query={q} />
                    ) : (
                      row.poNumber
                    )}
                  </div>
                </Link>
              );
            case 3:
              return (
                <Link
                  href={orderDetailHref}
                  className={
                    "text-[var(--color-menu-hover-color)] text-[14px] font-[500] leading-[1.38] underline-offset-2 hover:underline min-w-0"
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
              return (
                <div className="truncate text-center md:max-w-[70px] lg:max-w-[none]">
                  {row.itemCount}
                </div>
              );

            case 5:
              return (
                <div className="truncate md:max-w-[70px] lg:max-w-[none]">
                  {formatShippingTabDateDisplay(row.shipDateIso, locale)}
                </div>
              );
            default:
              return "—";
          }
        },
      });
    }

    cols.push({
      id: "packing-slip",
      label: "",
      headerClassName: `${headerCell} !text-right`,
      cellClassName: `${bodyCell} !text-right`,
      renderHeader: () => (
        <span className="sr-only">
          {tabFields?.PackingSlipLabel?.value?.trim() || "Packing slip"}
        </span>
      ),
      render: (row: ShipmentGridRow) => (
        <div className="flex justify-end">
          <ShipmentsPackingSlipButton
            rowId={row.rowId}
            documentUrl={row.documentUrl}
            tabFields={tabFields}
            onDownloadStart={onPackingSlipDownloadStart}
          />
        </div>
      ),
    });

    return cols;
  }, [
    activeLocale,
    gridColumns,
    q,
    locale,
    sortColumn,
    sortDir,
    sortableShipmentColumnId,
    onSortShipmentBySortColumnId,
    onPackingSlipDownloadStart,
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
          <span className="sr-only">Loading shipments</span>
          <LoadingSkeleton variant="spinner" size="medium" />
        </div>
      ) : null}
      <Table<ShipmentGridRow>
        data={shipmentPageSlice}
        columns={columns}
        getRowKey={(row) => row.rowId}
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
        ariaLabel="Shipments list"
        className={cn(
          "[&_table]:w-full [&_table]:border-collapse rounded-none border-0 shadow-none [&_table]:border-0",
          showRefetchOverlay && "pointer-events-none"
        )}
      />
    </div>
  );
}
