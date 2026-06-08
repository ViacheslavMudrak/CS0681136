"use client";

import { Image as SitecoreImage, Text as SitecoreText } from "@sitecore-content-sdk/nextjs";
import {
  faArrowUpRightFromSquare,
  faChevronDown,
  faChevronUp,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import Link from "next/link";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChevronRightIcon from "src/components/shared/icons/ChevronRightIcon";
import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";
import { I18N } from "@/lib/dictionary-keys";

import Button from "@/components/ui/Button";
import Table from "@/components/ui/table/Table";

import { getOrderShipments, OrderLineItem, type OrderShipment } from "@/lib/apis/orders-api";

import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";
import { cn } from "@/lib/utils";
import type { QuoteRequestController } from "@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestDrawer";
import { useActiveLocale } from "@/hooks/use-active-locale";
import { makeLineItemQueueKey } from "@/lib/quote-request/quote-request-utils";
import { stashOrderDetailEntryPoint } from "@/lib/order-detail-entry-point";
import { localizeHref } from "@/lib/locale-path";
import {
  type OrderDetailHeaderStatusVariant,
  resolveOrderDetailHeaderStatusVariant,
} from "@/lib/orderDetailUtils";
import {
  formatCurrencyAmount,
  formatOrderDateDisplay,
  getOrderRowKey,
  getShipmentDetailItemLabel,
  isGridColumnSortable,
  hasExpandedMatchingLineItems,
  hasExpandedShipmentLineItems,
  lineItemsForExpandedMatchingSection,
  lineItemsForExpandedShipmentSection,
  orderHasLineLevelTextSearchMatch,
  matchesOrdersTabPoGridColumn,
  normalizeGridNameKey,
  ordersGridColumnLegacyNormalizedKey,
  resolveTrackingUrl,
  resolveShipmentDetailFieldSlot,
  type OrderRecord,
  type ShipmentDetailFieldSlot,
} from "@/lib/orderManagementUtils";
import type { OrderManagementCarrierSelectionItem } from "../OrderManagement.type";
import { OrderManagementEmptyState } from "./OrderManagementEmptyState";
import { OrderManagementExpandedMatchingLine } from "./OrderManagementExpandedMatchingLine";
import { OrderManagementHighlightedText } from "./OrderManagementHighlightedText";

import {
  OM_TYPE,
  OrderManagementSortTh,
  OrderManagementTableLoadingRows,
} from "./OrderManagementTableShared";
import { TableColumn } from "@/components/ui/table/Table.types";
const ORDER_LIST_STATUS_BADGE_CLASS: Record<OrderDetailHeaderStatusVariant, string> = {
  placed:
    "border-[var(--color-border-gray)] bg-[var(--color-bg-submenu)] text-[var(--color-text-heading-color)]",
  shipped:
    "border-[var(--color-cyan-dark)] bg-[var(--color-cyan-light)] text-[var(--color-cyan-dark)]",
  cancelled:
    "border-[var(--color-red-dark)] bg-[var(--color-red-light)] text-[var(--color-red-dark)]",
  default:
    "border-[var(--color-border-gray)] bg-[var(--color-bg-submenu)] text-[var(--color-text-heading-color)]",
};

function orderRowSupportsShipmentExpand(order: OrderRecord): boolean {
  return resolveOrderDetailHeaderStatusVariant(order.statusKey) === "shipped";
}

function ShipmentFieldValueForSlot({
  sh,
  slot,
  locale,
  carrierSelection,
}: {
  sh: OrderShipment;
  slot: ShipmentDetailFieldSlot;
  locale: string;
  carrierSelection?: OrderManagementCarrierSelectionItem[];
}): React.ReactNode {
  switch (slot) {
    case "tracking": {
      const trackingHref = resolveTrackingUrl(
        sh.carrier,
        sh.trackingNumber,
        carrierSelection,
        sh.trackingUrl
      );
      return trackingHref ? (
        <a
          href={trackingHref}
          target="_blank"
          rel="noopener noreferrer"
          className={"inline-flex min-w-0 items-start gap-[5px] no-underline"}
          aria-label={`Open tracking for ${sh.trackingNumber} in a new tab`}
        >
          <span
            className={
              "text-[var(--color-text-black)] min-w-0 break-words text-[12px] font-[500] leading-[1.38] [overflow-wrap:anywhere]"
            }
          >
            {sh.trackingNumber}
          </span>
          <Icon
            icon={faArrowUpRightFromSquare}
            width={10}
            className={"shrink-0 text-[10px] text-[var(--color-menu-hover-color)] mt-[1px]"}
            aria-hidden
          />
        </a>
      ) : (
        <span
          className={
            "text-[var(--color-text-black)] min-w-0 break-words font-medium leading-[1.375] [overflow-wrap:anywhere]"
          }
        >
          {sh.trackingNumber || "—"}
        </span>
      );
    }
    case "carrier":
      return (
        <span
          className={"leading-[1.38] text-[12px] font-[400] text-[var(--color-text-black)]"}
        >
          {sh.carrier || "—"}
        </span>
      );
    case "items":
      return (
        <div
          className={
            "leading-[1.38] text-[12px] font-[400] text-[var(--color-text-black)]"
          }
        >
          {sh.itemCount}
        </div>
      );
    case "status":
      return (
        <span className="inline-flex items-center justify-self-end gap-[4px] rounded-[4px] text-[12px] font-[500] leading-[100%] overflow-hidden">
          {sh.statusLabel && (
            <Icon
              icon={faCircleCheck}
              width={10}
              className={"text-[10px] text-[var(--color-text-verified)]"}
              aria-hidden
            />
          )}
          <span
            className={
              "leading-[1.38] text-[12px] font-[500] text-[var(--color-text-black)]"
            }
          >
            {sh.statusLabel || "—"}
          </span>
        </span>
      );
    case "shippedDate":
      return (
        <span
          className={"leading-[1.38] text-[12px] font-[400] text-[var(--color-text-black)]"}
        >
          {sh.shippedDate?.trim() ? formatOrderDateDisplay(sh.shippedDate, locale) : "—"}
        </span>
      );
  }
}

export function OrderManagementDesktopTable({
  orderManagement,
  quoteRequest,
}: {
  orderManagement: OrderManagementShell;
  quoteRequest?: QuoteRequestController | null;
}): React.ReactElement {
  const {
    fields,
    tabFields,
    trackingCarrierSelection,
    gridColumns,
    showExpandColumn,
    pageSlice,
    pageSize,
    expandedIds,
    toggleExpand,
    appliedSearch,
    currentPage,
    beltApplied,
    canRequestQuote,
    canRequestDocumentation,
    orderDetailHref,
    statusDisplay,
    locale,
    sortColumn,
    sortDir,
    sortableColumnId,
    onSortHeader,
    isListingCompactViewport,
    isOrdersListLoading,
    accountId,
    onLineItemQuoteRequestStart,
    openDocumentRequestFromOrdersList,
  } = orderManagement;

  const activeLocale = useActiveLocale();
  const t = useTranslations();

  const tableWrapRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const prevOrdersListLoadingRef = useRef(isOrdersListLoading);

  const loadingSkeletonRowCount = Math.min(Math.max(pageSize, 1), 6);
  const showInitialTableLoading = isOrdersListLoading && pageSlice.length === 0;

  const resetTableHorizontalScroll = useCallback(() => {
    if (tableWrapRef.current) tableWrapRef.current.scrollLeft = 0;
    if (tableScrollRef.current) tableScrollRef.current.scrollLeft = 0;
  }, []);

  useEffect(() => {
    resetTableHorizontalScroll();
  }, [appliedSearch, currentPage, accountId, resetTableHorizontalScroll]);

  useEffect(() => {
    if (prevOrdersListLoadingRef.current && !isOrdersListLoading) {
      resetTableHorizontalScroll();
    }
    prevOrdersListLoadingRef.current = isOrdersListLoading;
  }, [isOrdersListLoading, resetTableHorizontalScroll]);

  const expandedShipmentFieldRows = useMemo(() => {
    const sel = tabFields?.ShipmentDetailsItemSelection;
    if (!sel || sel.length === 0) return [];
    return sel.map((item) => ({
      id: item.id,
      label: getShipmentDetailItemLabel(item) || "—",
      slot: resolveShipmentDetailFieldSlot(item),
    }));
  }, [tabFields?.ShipmentDetailsItemSelection]);
  /** Cached shipments by `orderHeaderId` (empty array after successful load with no rows). */
  const [shipmentsByHeaderId, setShipmentsByHeaderId] = useState<Record<string, OrderShipment[]>>(
    {}
  );
  /** Cached line items from lazy GET /orders/shipments (keyed by `orderHeaderId`). */
  const [linesByHeaderId, setLinesByHeaderId] = useState<Record<string, OrderLineItem[]>>({});
  const inFlightShipmentsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setShipmentsByHeaderId({});
    setLinesByHeaderId({});
    inFlightShipmentsRef.current.clear();
  }, [accountId]);

  useEffect(() => {
    setShipmentsByHeaderId({});
    setLinesByHeaderId({});
    inFlightShipmentsRef.current.clear();
  }, [appliedSearch]);

  useEffect(() => {
    if (!accountId) return;
    if (!tabFields?.ShipmentDetailsItemSelection?.length) return;

    for (const order of pageSlice) {
      const rowKey = String(order.orderId ?? order.orderNumber);
      if (![...expandedIds].some((e) => String(e) === rowKey)) continue;
      if (!orderRowSupportsShipmentExpand(order)) continue;

      const hid = String(order.orderHeaderId);
      const cachedShipments = shipmentsByHeaderId[hid] ?? [];
      const cachedLines = linesByHeaderId[hid] ?? [];
      const listHasLinkedShipmentLines =
        order.shipments.length > 0 &&
        order.lineItems.length > 0 &&
        order.lineItems.some((li) => Boolean(li.shipmentId));
      const cacheHasLinkedShipmentLines =
        hid in shipmentsByHeaderId &&
        cachedShipments.length > 0 &&
        cachedLines.length > 0 &&
        cachedLines.some((li) => Boolean(li.shipmentId));
      if (listHasLinkedShipmentLines || cacheHasLinkedShipmentLines) continue;
      if (inFlightShipmentsRef.current.has(hid)) continue;

      inFlightShipmentsRef.current.add(hid);
      void getOrderShipments({ orderHeaderId: hid, accountId })
        .then((result) => {
          setShipmentsByHeaderId((prev) => ({ ...prev, [hid]: result.shipments }));
          setLinesByHeaderId((prev) => ({ ...prev, [hid]: result.lineItems }));
        })
        .finally(() => {
          inFlightShipmentsRef.current.delete(hid);
        });
    }
  }, [
    accountId,
    expandedIds,
    pageSlice,
    shipmentsByHeaderId,
    linesByHeaderId,
    tabFields?.ShipmentDetailsItemSelection,
  ]);

  const showTableLoadingPlaceholder = isOrdersListLoading && pageSlice.length === 0;
  const showTableRefetchOverlay =
    isOrdersListLoading && pageSlice.length > 0 && !isListingCompactViewport;
  const showEmptyBelowHeaders = !isOrdersListLoading && pageSlice.length === 0;

  const q = appliedSearch.trim();

  const hasPoColumn = useMemo(() => gridColumns.some(matchesOrdersTabPoGridColumn), [gridColumns]);
  const expandInPoColumn = showExpandColumn && hasPoColumn;
  const showStandaloneExpandColumn = showExpandColumn && !hasPoColumn;

  const columns: TableColumn<OrderRecord>[] = useMemo(() => {
    const cols: TableColumn<OrderRecord>[] = [];

    if (showStandaloneExpandColumn) {
      cols.push({
        id: "expand",
        label: "",
        width: "w-[52px]",
        headerClassName: `!font-semibold !uppercase !tracking-wide !text-[var(--color-text-heading-color)] !border-b !border-[var(--color-border-gray)] !w-[52px] ${"sticky left-0 z-[12] shadow-[4px_0_6px_-3px_rgb(0_40_80_/_0.1)]"}`,
        cellClassName: `!text-[var(--color-text-heading-color)] !align-middle !border-b !border-[var(--color-border-gray)] !w-[52px] ${"sticky left-0 z-[2] shadow-[4px_0_6px_-3px_rgb(0_40_80_/_0.08)] bg-inherit"}`,
        renderHeader: () => <span className="sr-only">Expand</span>,
        render: (order: OrderRecord) => {
          const expanded = expandedIds.has(order.orderId ?? order.orderNumber);
          if (!orderRowSupportsShipmentExpand(order)) {
            return <span className="inline-block w-[16px] shrink-0" aria-hidden />;
          }
          return (
            <Button
              type="button"
              variant="ghost"
              btnVariant="iconBtn"
              className={
                "inline-flex shrink-0 items-center justify-center w-[16px] h-[16px] rounded-[6px] border-0 bg-transparent cursor-pointer text-[var(--color-text-heading-color)] hover:bg-[var(--color-bg-lighter-gray)] focus:outline-none focus-visible:ring-2"
              }
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse row" : "Expand row"}
              onPress={() => toggleExpand(order.orderId ?? order.orderNumber)}
            >
              <Icon icon={expanded ? faChevronUp : faChevronDown} width={14} aria-hidden />
            </Button>
          );
        },
      });
    }

    const alignProps: Record<string, "left" | "center" | "right"> = {
      PO: "left",
      ORDER: "left",
      ITEMS: "center",
      STATUS: "left",
      "TOTAL AMOUNT": "left",
    };

    for (let colIndex = 0; colIndex < gridColumns.length; colIndex++) {
      const col = gridColumns[colIndex];
      const title = col.fields?.GridName?.value ?? col.displayName ?? "";
      const sortId = sortableColumnId(col);
      const sortable = isGridColumnSortable(col) && sortId !== null;
      const gridCol = col;
      const gridKey = normalizeGridNameKey(col.name ?? col.displayName);

      cols.push({
        id: `grid-col-${colIndex}-${col.id}`,
        label: title,
        align: alignProps[col.name ?? ""],
        headerClassName:
          "!font-semibold !uppercase !tracking-wide !text-[var(--color-text-heading-color)] !border-b !border-[var(--color-border-gray)]",
        cellClassName: `!text-[var(--color-text-heading-color)] !align-middle !border-b !border-[var(--color-border-gray)] ${gridKey === "STATUS" ? "!min-w-0" : ""}`,
        renderHeader: () =>
          sortable && sortId ? (
            <OrderManagementSortTh
              title={title}
              active={sortColumn === sortId}
              sortDir={sortDir}
              onPress={() => onSortHeader(gridCol)}
            />
          ) : (
            <span className={cn(OM_TYPE.label, "text-inherit")}>{title}</span>
          ),
        render: (order: OrderRecord) => {
          const k = ordersGridColumnLegacyNormalizedKey(col);
          const expanded = expandedIds.has(order.orderId ?? order.orderNumber);
          if (matchesOrdersTabPoGridColumn(col)) {
            return (
              <div className={"flex min-w-0 flex-row items-center gap-[6px]"}>
                {expandInPoColumn && orderRowSupportsShipmentExpand(order) ? (
                  <Button
                    type="button"
                    variant="ghost"
                    btnVariant="iconBtn"
                    className={
                      "inline-flex shrink-0 items-center justify-center w-[16px] h-[16px] rounded-[6px] border-0 bg-transparent cursor-pointer text-[var(--color-text-heading-color)] hover:bg-[var(--color-bg-lighter-gray)] focus:outline-none focus-visible:ring-2"
                    }
                    aria-expanded={expanded}
                    aria-label={expanded ? "Collapse row" : "Expand row"}
                    onPress={() => toggleExpand(order.orderId ?? order.orderNumber)}
                  >
                    <Icon icon={expanded ? faChevronUp : faChevronDown} width={14} aria-hidden />
                  </Button>
                ) : expandInPoColumn ? (
                  <span className="inline-block w-[16px] shrink-0" aria-hidden />
                ) : null}
                <Link
                  href={localizeHref(orderDetailHref(order), activeLocale)}
                  className={`${expanded ? "" : "text-[var(--color-menu-hover-color)]"}  font-[500] leading-[1.38] underline-offset-2 hover:underline min-w-0`}
                  onClick={() => stashOrderDetailEntryPoint("Orders_Listing")}
                >
                  {q ? (
                    <OrderManagementHighlightedText text={order.poNumber} query={q} />
                  ) : (
                    order.poNumber
                  )}
                </Link>
              </div>
            );
          }
          if (k === "ORDER") {
            return (
              <Link
                href={localizeHref(orderDetailHref(order), activeLocale)}
                className={`${expanded ? "" : "text-[var(--color-menu-hover-color)]"} font-[500] leading-[1.38] underline-offset-2 hover:underline min-w-0`}
                onClick={() => stashOrderDetailEntryPoint("Orders_Listing")}
              >
                {q ? (
                  <OrderManagementHighlightedText text={order.orderNumber} query={q} />
                ) : (
                  order.orderNumber
                )}
              </Link>
            );
          }
          if (k === "ITEMS" || k === "# ITEMS") {
            return (
              <div className="truncate text-center md:max-w-[70px] lg:max-w-[none]">
                {order.itemCount}
              </div>
            );
          }
          if (k === "STATUS") {
            const sd = statusDisplay(order.statusKey);
            const variant = resolveOrderDetailHeaderStatusVariant(order.statusKey);
            return (
              <span
                className={`${"inline-flex max-w-full min-w-0 items-center gap-[6px] overflow-hidden rounded-[4px] border py-[4px] px-[10px] text-[12px] font-medium"} ${ORDER_LIST_STATUS_BADGE_CLASS[variant]}`}
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
          if (k === "ORDER DATE") {
            return formatOrderDateDisplay(order.orderDate, locale);
          }
          if (k === "TOTAL AMOUNT") {
            return formatCurrencyAmount(order.totalAmount, order.currency, locale);
          }
          return "—";
        },
      });
    }

    cols.push({
      id: "detail",
      label: "",
      width: "w-[52px]",
      headerClassName: `!font-semibold !uppercase !tracking-wide !text-[var(--color-text-heading-color)] !border-b !border-[var(--color-border-gray)] !w-[52px]`,
      cellClassName: `!text-[var(--color-text-heading-color)] !align-middle !border-b !border-[var(--color-border-gray)] !w-[52px]`,
      renderHeader: () => <span className="sr-only">Order detail</span>,
      render: (order: OrderRecord) => (
        <Link
          href={localizeHref(orderDetailHref(order), activeLocale)}
          className={
            "inline-flex items-center justify-center px-[6px] py-[5.25px] w-[26px] h-[25px] rounded-[2px] border border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] text-[var(--color-text-heading-color)] no-underline hover:bg-[var(--color-bg-lighter-gray)] focus:outline-none focus-visible:ring-2"
          }
          aria-label={`${t(I18N.FilterDetail)} ${order.orderNumber}`}
          onClick={() => stashOrderDetailEntryPoint("Orders_Listing")}
        >
          <ChevronRightIcon width={14} decorative fill="#00287B" />
        </Link>
      ),
    });

    return cols;
  }, [
    gridColumns,
    showStandaloneExpandColumn,
    expandInPoColumn,
    q,
    locale,
    sortColumn,
    sortDir,
    sortableColumnId,
    onSortHeader,
    statusDisplay,
    orderDetailHref,
    activeLocale,
    expandedIds,
    toggleExpand,
    t,
  ]);

  const zebraRowBg = useMemo(
    () => (index: number) =>
      index % 2 === 0 ? "bg-[var(--color-bg-basic-color)]" : "bg-[var(--color-bg-table-stripe)]",
    []
  );

  const renderExpandedRow = useMemo(
    () => (order: OrderRecord) => {
      const expanded = expandedIds.has(order.orderId ?? order.orderNumber);
      if (!expanded || isListingCompactViewport || !orderRowSupportsShipmentExpand(order)) {
        return null;
      }

      const headerId = String(order.orderHeaderId);
      const cachedShipments = shipmentsByHeaderId[headerId] ?? [];
      const cachedLines = linesByHeaderId[headerId] ?? [];
      const shipmentsLoaded = headerId in shipmentsByHeaderId;
      const shipmentsToRender: OrderShipment[] =
        cachedShipments.length > 0 ? cachedShipments : order.shipments;
      const lineItemsForOrder: OrderLineItem[] =
        cachedLines.length > 0 ? cachedLines : order.lineItems;
      const orderForMatching: OrderRecord = { ...order, lineItems: lineItemsForOrder };
      const hasShipmentCmsConfig = expandedShipmentFieldRows.length > 0;
      const showShipmentsLoading =
        hasShipmentCmsConfig &&
        Boolean(accountId) &&
        !shipmentsLoaded &&
        order.shipments.length === 0;
      const hasShipmentBlockRows = hasShipmentCmsConfig && shipmentsToRender.length > 0;

      const beltFilterActive =
        beltApplied.series.size +
        beltApplied.style.size +
        beltApplied.material.size +
        beltApplied.color.size >
        0;
      const lineItemsForMatching = lineItemsForExpandedMatchingSection(
        orderForMatching,
        q,
        beltApplied
      );
      const lineLevelTextSearchMatch = orderHasLineLevelTextSearchMatch(lineItemsForOrder, q);
      const showMatchingSection =
        lineLevelTextSearchMatch &&
        hasExpandedMatchingLineItems(orderForMatching, q, beltApplied) &&
        (Boolean(q.trim()) || beltFilterActive);
      const hasAnyShipmentLines = hasExpandedShipmentLineItems(
        lineItemsForOrder,
        shipmentsToRender,
        q,
        beltApplied
      );

      const showExpandedContent =
        showShipmentsLoading || hasShipmentBlockRows || showMatchingSection || hasAnyShipmentLines;

      if (!showExpandedContent) return null;

      const renderMatchingCard = (
        items: OrderLineItem[],
        keyPrefix: string,
        showMatchingHeader: boolean
      ) => {
        if (items.length === 0) return null;

        return (
          <div
            className={
              "flex w-full flex-col overflow-hidden rounded-[6px] border border-[var(--color-border-gray)] bg-[var(--color-bg-basic-color)] shadow-[0_0_0_1px_rgba(14,_63,_126,_0.04)]"
            }
          >
            <div>
              <div className="flex w-full flex-nowrap gap-0 min-h-[30px] border-b first:border-b! border-[var(--color-portal-bg)] bg-[var(--color-bg-basic-color)] last:border-b-0 max-md:flex-wrap">
                <div className="flex min-w-[200px] flex-1 flex-col gap-0 border-b border-[var(--color-bg-lighter-gray)] px-[12px] !py-0">
                  <div className="flex min-h-[36px] min-w-[200px] flex-1 items-center py-[8px] text-[10px] font-[700] uppercase tracking-[0.5px] text-[color:var(--color-text-placeholder)]">
                    {t(I18N.FilterMatching)}
                  </div>
                </div>
                <div className="flex min-w-[80px] items-center justify-start px-[12px] !py-0">
                  <span className="text-[10px] font-[700] uppercase tracking-[0.5px] text-[color:var(--color-text-placeholder)]">
                    {t(I18N.FilterQuantity)}
                  </span>
                </div>
                <div className="flex min-w-[200px] items-center justify-end gap-[10px] px-[12px] !py-0" />
              </div>
            </div>
            {items.map((li: OrderLineItem) => {
              const lineKey = makeLineItemQueueKey(String(order.orderHeaderId), li.id);
              return (
                <OrderManagementExpandedMatchingLine
                  key={`${keyPrefix}-${order.orderNumber}-li-${li.id}`}
                  line={li}
                  query={q}
                  canRequestQuote={canRequestQuote}
                  canRequestDocumentation={canRequestDocumentation}
                  onRequestDocument={(documentLine) =>
                    openDocumentRequestFromOrdersList(order, documentLine)
                  }
                  orderHeaderId={String(order.orderHeaderId)}
                  quoteCms={quoteRequest?.quoteCms ?? {}}
                  lineInQueue={
                    quoteRequest?.lineInQuoteDraftForListLine(
                      String(order.orderHeaderId),
                      lineKey
                    ) ?? false
                  }
                  queueItemCount={quoteRequest?.queueItemCount ?? 0}
                  onRequestQuoteLine={() => {
                    if (quoteRequest) {
                      quoteRequest.openFromLineItem(order, li);
                    }
                  }}
                  requestQuoteButtonIcon={tabFields?.RequestQuoteButtonIcon}
                  requestQuoteButtonLabel={tabFields?.RequestQuoteButtonLabel}
                  modifyQuoteButtonLabel={tabFields?.LineItemModifyQuoteLabel}
                />
              );
            })}
          </div>
        );
      };

      return (
        <div className={"flex w-full flex-col gap-[8px] px-[36px] pt-[14px] pb-[10px]"}>
          {showShipmentsLoading ? (
            <div
              className="flex w-full items-center justify-center py-4 px-1"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <span className="sr-only">Loading shipments</span>
              <LoadingSkeleton variant="skeleton" size="medium" className="!p-0 w-full max-w-md" />
            </div>
          ) : hasShipmentBlockRows ? (
            shipmentsToRender.map((sh: OrderShipment, shipmentIndex: number) => {
              const shipmentLineItems = lineItemsForExpandedShipmentSection(
                lineItemsForOrder,
                sh.id,
                q,
                beltApplied,
                {
                  shipmentIndex,
                  shipmentCount: shipmentsToRender.length,
                }
              );
              return (
                <div key={`shipment-${sh.id}`} className={"flex w-full flex-col gap-[10px]"}>
                  <div
                    className={
                      "flex min-h-[51px] w-full flex-wrap items-start justify-between gap-x-[14px] gap-y-[10px]"
                    }
                  >
                    {expandedShipmentFieldRows.map((row) => (
                      <div
                        key={`${sh.id}-${row.id}`}
                        className={`${"flex shrink-0 flex-col items-start gap-[4px]"} w-[min(200px,100%)]`}
                      >
                        <span className={"text-[11px] font-[400] tracking-[0.5px] leading-[15px] text-[color:var(--color-gray-700)]"}>
                          {row.label}
                        </span>
                        {row.slot ? (
                          <ShipmentFieldValueForSlot
                            sh={sh}
                            slot={row.slot}
                            locale={locale}
                            carrierSelection={trackingCarrierSelection}
                          />
                        ) : (
                          <span
                            className={"leading-[1.375] text-[var(--color-text-heading-color)]"}
                          >
                            —
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {shipmentLineItems.length > 0 ? (
                    <div className={"w-full pl-0"}>
                      {renderMatchingCard(shipmentLineItems, sh.id, showMatchingSection)}
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : null}
          {!hasShipmentBlockRows && showMatchingSection
            ? renderMatchingCard(lineItemsForMatching, "fallback", true)
            : null}
          {!showShipmentsLoading && (showMatchingSection || hasAnyShipmentLines) ? (
            <div className={"flex w-full justify-end px-[12px]"}>
              <Link
                href={localizeHref(orderDetailHref(order), activeLocale)}
                className={
                  "inline-flex items-center gap-[4px] text-[12px] font-medium text-[var(--color-menu-hover-color)] underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2"
                }
                aria-label={`${t(I18N.FilterDetail)} ${order.orderNumber}`}
                onClick={() => stashOrderDetailEntryPoint("Orders_Listing")}
              >
                {t(I18N.FilterDetail)} <ChevronRightIcon width={14} decorative />
              </Link>
            </div>
          ) : null}
        </div>
      );
    },
    [
      accountId,
      activeLocale,
      beltApplied,
      canRequestDocumentation,
      canRequestQuote,
      expandedShipmentFieldRows,
      expandedIds,
      fields,
      tabFields,
      trackingCarrierSelection,
      isListingCompactViewport,
      locale,
      orderDetailHref,
      q,
      shipmentsByHeaderId,
      linesByHeaderId,
      t,
      onLineItemQuoteRequestStart,
      openDocumentRequestFromOrdersList,
      quoteRequest,
    ]
  );

  return (
    <div
      ref={tableWrapRef}
      className={cn(
        "hidden md:block relative w-full min-h-0 overflow-x-auto bg-[var(--color-bg-basic-color)]",
        showInitialTableLoading && "min-h-[288px]"
      )}
    >
      {showTableRefetchOverlay ? (
        <div
          className={
            "absolute left-0 right-0 top-0 z-20 flex h-[52px] items-center justify-center gap-2 border-b border-[var(--color-border-gray)] backdrop-blur-[1px] bg-[color-mix(in_srgb,_var(--color-bg-basic-color)_88%,_transparent)] pointer-events-none"
          }
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="sr-only">Loading orders</span>
          <LoadingSkeleton variant="spinner" size="medium" />
        </div>
      ) : null}
      <Table<OrderRecord>
        data={pageSlice}
        columns={columns}
        getRowKey={(order, index) => getOrderRowKey(order, index)}
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
        ariaLabel="Orders list"
        renderExpandedRow={renderExpandedRow}
        expandedRowClassName={"bg-[var(--color-bg-lighter-gray)] text-[14px]"}
        expandedCellClassName={
          "py-[10px] px-[16px] border-b border-[var(--color-border-gray)] text-[var(--color-text-basic)]"
        }
        scrollContainerRef={tableScrollRef}
        className="[&_table]:w-full [&_table]:border-collapse [&_table]:text-[14px] rounded-none border-0 shadow-none [&_table]:border-0"
      />
    </div>
  );
}
