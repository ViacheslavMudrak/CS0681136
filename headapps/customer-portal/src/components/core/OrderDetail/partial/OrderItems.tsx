"use client";

import { Text } from "@sitecore-content-sdk/nextjs";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import { DoubleChevronIcon } from "@/components/shared/icons/DoubleChevronIcon";
import { useCompactPhoneViewport } from "@/hooks/use-compact-phone-viewport";
import useDeviceType from "@/hooks/use-device-type";
import { useOrderItems } from "@/hooks/useOrderItems";
import {
  trackOrderDetailCollapseAllItems,
  trackOrderDetailExpandAllItems,
  trackOrderDetailDocRequestInitiated,
  trackOrderDetailLineItemDescriptionExpand,
  trackOrderDetailQuoteRequestInitiated,
} from "@/lib/orderDetailAnalytics";

import type {
  IOrderDetailFields,
  OrderDetailActiveColumnItem,
  OrderDetailLineItem,
  OrderDetailOrderHeader,
} from "../OrderDetail.type";
import {
  buildLineItemRowKey,
  buildOrderDetailLineMenuItemTemplates,
  mapOrderDetailToQuoteOrderAndLine,
  normalizeColumnValueKey,
  orderDetailColumnTextAlignClass,
  parseOrderDetailPageSizeOptionList,
  resolveSectionTitlePattern,
} from "@/lib/orderDetailUtils";
import { makeLineItemQueueKey } from "@/lib/quote-request/quote-request-utils";
import type { UseQuoteRequestReturn } from "@/hooks/useQuoteRequest";

import { OrderDetailPagination } from "./OrderDetailPagination";
import { OrderItemMobileCard } from "./OrderItemMobileCard";
import { OrderItemRow } from "./OrderItemRow";

import { cn } from "@/lib/utils";

export interface OrderItemsProps {
  fields: IOrderDetailFields;
  lineItems: OrderDetailLineItem[];
  orderNumber: string;
  orderHeader: OrderDetailOrderHeader;
  canRequestDocumentation: boolean;
  canInitiateRfq: boolean;
  onRequestDocumentLine?: (globalLineIndex: number) => void;
  quoteRequest: UseQuoteRequestReturn | null;
}

/**
 * Order line items: stacked cards on mobile (under 768px), data table on larger viewports; CMS columns, expand/collapse, pagination.
 */
export function OrderItems({
  fields,
  lineItems,
  orderNumber,
  orderHeader,
  canRequestDocumentation,
  canInitiateRfq,
  onRequestDocumentLine,
  quoteRequest,
}: OrderItemsProps): React.ReactElement {
  const { isMobile } = useDeviceType();
  const isCompactPhoneViewport = useCompactPhoneViewport();
  const useMobileItemLayout = isMobile || isCompactPhoneViewport;
  const lineMenuTemplates = useMemo(
    () => buildOrderDetailLineMenuItemTemplates(fields, canRequestDocumentation, canInitiateRfq),
    [fields, canRequestDocumentation, canInitiateRfq]
  );
  const showLineItemActions = lineMenuTemplates.length > 0;
  const pageSizeOptions = useMemo(
    () => parseOrderDetailPageSizeOptionList(fields.PageSizeOptionList),
    [fields.PageSizeOptionList]
  );

  const cmsDefaultPageSize = useMemo(
    () => parseInt(String(fields.DefaultPageSize?.value ?? "").trim(), 10),
    [fields.DefaultPageSize]
  );

  /** Row keys whose clamped description overflows (reported by line components). Drives Expand All visibility and targeting. */
  const expandableKeysRef = useRef(new Set<string>());
  const [expandableRowKeys, setExpandableRowKeys] = useState<string[]>([]);
  const [descriptionOverflowMeasureKey, setDescriptionOverflowMeasureKey] = useState(0);

  const lineItemsSignature = useMemo(
    () =>
      lineItems
        .map((item, index) =>
          `${buildLineItemRowKey(item, index)}:${item.partDescription?.value ?? ""}`
        )
        .join("|"),
    [lineItems]
  );

  const syncExpandableRowKeys = useCallback(() => {
    const keys = Array.from(expandableKeysRef.current);
    setExpandableRowKeys((prev) => {
      if (prev.length === keys.length && prev.every((key, index) => key === keys[index])) {
        return prev;
      }
      return keys;
    });
  }, []);

  /** Only register keys that overflow; never remove on false (avoids collapse after Expand All). */
  const handleRowExpandableChange = useCallback(
    (rowKey: string, canExpand: boolean) => {
      if (!canExpand || expandableKeysRef.current.has(rowKey)) return;
      expandableKeysRef.current.add(rowKey);
      syncExpandableRowKeys();
    },
    [syncExpandableRowKeys]
  );

  useEffect(() => {
    expandableKeysRef.current.clear();
    setExpandableRowKeys([]);
    setDescriptionOverflowMeasureKey((key) => key + 1);
  }, [lineItemsSignature]);

  const orderItems = useOrderItems(lineItems, cmsDefaultPageSize, expandableRowKeys);

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    pageSlice,
    pageOffset,
    visibleExpandableRowKeys,
    isRowExpanded,
    toggleRow,
    expandAll,
    collapseAll,
    expandAllMode,
  } = orderItems;

  const sectionRef = useRef<HTMLElement>(null);

  const activeColumns: OrderDetailActiveColumnItem[] = useMemo(
    () => fields.ActiveColumnsSelection?.filter((c) => c?.fields) ?? [],
    [fields.ActiveColumnsSelection]
  );

  const sectionTitle = resolveSectionTitlePattern(fields.SectionTitlePattern, lineItems.length);

  const locale =
    typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";

  const showExpandToggle =
    Boolean(fields.ExpandAllLabel && fields.CollapseAllLabel) &&
    visibleExpandableRowKeys.length > 0;

  const handleExpandInteraction = useCallback(
    (rowKey: string, source: "chevron" | "row") => {
      if (orderNumber.trim() && !isRowExpanded(rowKey)) {
        trackOrderDetailLineItemDescriptionExpand({
          orderNumber: orderNumber.trim(),
          interactionType: source === "chevron" ? "Chevron_Click" : "Row_Click",
        });
      }
      toggleRow(rowKey);
    },
    [orderNumber, isRowExpanded, toggleRow]
  );

  const handleExpandAllPress = useCallback(() => {
    if (orderNumber.trim()) {
      trackOrderDetailExpandAllItems({ orderNumber: orderNumber.trim() });
    }
    expandAll();
  }, [orderNumber, expandAll]);

  const handleCollapseAllPress = useCallback(() => {
    if (orderNumber.trim()) {
      trackOrderDetailCollapseAllItems({ orderNumber: orderNumber.trim() });
    }
    collapseAll();
  }, [orderNumber, collapseAll]);

  const getLineActionItems = useCallback(
    (item: OrderDetailLineItem, rowKey: string, globalIndex: number) => {
      const { order, line } = mapOrderDetailToQuoteOrderAndLine(
        orderHeader,
        orderNumber,
        item,
        rowKey
      );
      const oh = String(orderHeader.orderHeaderId);
      const listLineKey = makeLineItemQueueKey(oh, rowKey);
      const lineInDraft = quoteRequest?.lineKeyInQueue(listLineKey) ?? false;
      const showQuoteAsModify = lineInDraft;
      const modifyQuoteLineLabel =
        quoteRequest?.quoteCms?.ModifyQuoteForOrderLine?.value != null
          ? String(quoteRequest.quoteCms.ModifyQuoteForOrderLine.value).trim()
          : "Modify Quote";

      return lineMenuTemplates.map((t) => {
        if (t.kind === "quote") {
          const quoteLabel = showQuoteAsModify ? modifyQuoteLineLabel || t.label : t.label;
          return {
            key: `${t.id}-${rowKey}`,
            label: quoteLabel,
            onPress: () => {
              if (orderNumber.trim()) {
                trackOrderDetailQuoteRequestInitiated({
                  orderNumber: orderNumber.trim(),
                  initiationPoint: "Line_Item",
                });
              }
              if (quoteRequest) {
                quoteRequest.openFromLineItem(order, line);
              }
            },
          };
        }
        return {
          key: `${t.id}-${rowKey}`,
          label: t.label,
          onPress: () => {
            if (t.kind !== "document") return;
            if (orderNumber.trim()) {
              trackOrderDetailDocRequestInitiated({
                orderNumber: orderNumber.trim(),
                initiationPoint: "Line_Item",
              });
            }
            onRequestDocumentLine?.(globalIndex);
          },
        };
      });
    },
    [lineMenuTemplates, onRequestDocumentLine, orderHeader, orderNumber, quoteRequest]
  );

  const pagination = useMemo(() => {
    return (
      <OrderDetailPagination
        totalResults={total}
        safePage={currentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        pageSizeOptions={pageSizeOptions}
        cmsDefaultPageSize={cmsDefaultPageSize}
        resultSummaryPattern={fields.ResultSummaryPattern}
      />
    );
  }, [
    total,
    currentPage,
    pageSize,
    pageSizeOptions,
    cmsDefaultPageSize,
    fields.ResultSummaryPattern,
  ]);

  return (
    <section
      ref={sectionRef}
      data-listing-scroll-anchor
      className={cn(
        "flex flex-col w-full min-w-0 border border-neutral-200 rounded-md",
        useMobileItemLayout &&
          "box-border rounded-lg pt-[15px] pr-[15px] pb-[21px] pl-[15px] bg-[var(--color-bg-basic-color)]"
      )}
      aria-labelledby="order-detail-items-heading"
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-md",
          useMobileItemLayout && "bg-transparent pl-[0px]"
        )}
      >
        <h3
          id="order-detail-items-heading"
          className={cn(
            "text-[16px] font-[500] leading-[1.38] text-neutral-900 m-0",
            useMobileItemLayout && "text-[14px] text-[var(--color-bg-black)] m-0"
          )}
        >
          {sectionTitle}
        </h3>
        {showExpandToggle ? (
          expandAllMode === "all" ? (
            fields.CollapseAllLabel ? (
              <Button
                type="button"
                variant="transparent"
                className="inline-flex flex-row !border border-neutral-100 rounded-sm items-center leading-[138%] gap-1.5 text-[12px] font-[500] text-[var(--color-action-primary)] bg-transparent border-0 cursor-pointer py-[5.25px] px-1.5 underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                onPress={handleCollapseAllPress}
              >
                <DoubleChevronIcon direction="up" />
                <Text field={fields.CollapseAllLabel} tag="span" />
              </Button>
            ) : null
          ) : fields.ExpandAllLabel ? (
            <Button
              type="button"
              variant="transparent"
              className="inline-flex flex-row !border border-neutral-100 rounded-sm items-center leading-[138%] gap-1.5 text-[12px] font-[500] text-[var(--color-action-primary)] bg-transparent border-0 cursor-pointer py-[5.25px] px-1.5 underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              onPress={handleExpandAllPress}
            >
              <DoubleChevronIcon direction="down" />
              <Text field={fields.ExpandAllLabel} tag="span" />
            </Button>
          ) : null
        ) : null}
      </div>

      {useMobileItemLayout ? (
        <div className="flex flex-col gap-[15px] w-full min-w-0 pb-3 box-border" role="list">
          {pageSlice.map((item, i) => {
            const globalIndex = pageOffset + i;
            const rowKey = buildLineItemRowKey(item, globalIndex);
            return (
              <div key={rowKey} role="listitem">
                <OrderItemMobileCard
                  fields={fields}
                  item={item}
                  rowKey={rowKey}
                  isExpanded={isRowExpanded(rowKey)}
                  onExpandInteraction={(source) => handleExpandInteraction(rowKey, source)}
                  orderNumber={orderNumber}
                  activeColumns={activeColumns}
                  locale={locale}
                  canRequestDocumentation={canRequestDocumentation}
                  canInitiateRfq={canInitiateRfq}
                  lineActionItems={getLineActionItems(item, rowKey, globalIndex)}
                  onDescriptionExpandableChange={(canExpand) =>
                    handleRowExpandableChange(rowKey, canExpand)
                  }
                  descriptionOverflowMeasureKey={descriptionOverflowMeasureKey}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th
                  className="bg-slate-50 text-[10px] text-neutral-500 py-2 px-[16px] border-b border-t border-neutral-200 uppercase"
                  scope="col"
                >
                  {fields.ColumnHeader && <Text field={fields.ColumnHeader} tag="span" />}
                </th>
                {activeColumns.map((col) => {
                  const keyNorm = normalizeColumnValueKey(
                    col.fields?.Value?.value ?? col.displayName
                  );
                  return (
                    <th
                      key={col.id}
                      className={cn(
                        "bg-slate-50 text-[10px] text-neutral-500 py-3 px-[16px] border-b border-t border-neutral-200 uppercase",
                        orderDetailColumnTextAlignClass(keyNorm)
                      )}
                      scope="col"
                    >
                      {col.fields?.Value ? (
                        <Text field={col.fields.Value} tag="span" />
                      ) : col.fields?.ColumnHeader ? (
                        <Text field={col.fields.ColumnHeader} tag="span" />
                      ) : (
                        (col.displayName ?? "")
                      )}
                    </th>
                  );
                })}
                {showLineItemActions ? (
                  <th
                    className="bg-slate-50 text-[10px] text-neutral-500 py-2 px-4 border-b border-t border-neutral-200 uppercase w-12 text-right"
                    scope="col"
                  >
                    <span className="sr-only">Actions</span>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {pageSlice.map((item, i) => {
                const globalIndex = pageOffset + i;
                const rowKey = buildLineItemRowKey(item, globalIndex);
                return (
                  <OrderItemRow
                    key={rowKey}
                    fields={fields}
                    item={item}
                    rowKey={rowKey}
                    isExpanded={isRowExpanded(rowKey)}
                    onExpandInteraction={(source) => handleExpandInteraction(rowKey, source)}
                    orderNumber={orderNumber}
                    activeColumns={activeColumns}
                    locale={locale}
                    canRequestDocumentation={canRequestDocumentation}
                    canInitiateRfq={canInitiateRfq}
                    lineActionItems={getLineActionItems(item, rowKey, globalIndex)}
                    onDescriptionExpandableChange={(canExpand) =>
                      handleRowExpandableChange(rowKey, canExpand)
                    }
                    descriptionOverflowMeasureKey={descriptionOverflowMeasureKey}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination && <div>{pagination}</div>}
    </section>
  );
}
