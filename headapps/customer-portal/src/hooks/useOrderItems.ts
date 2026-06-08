"use client";

import type { OrderDetailLineItem } from "@/components/core/OrderDetail/OrderDetail.type";
import { buildLineItemRowKey } from "@/lib/orderDetailUtils";
import { useCallback, useMemo, useReducer, useState } from "react";

export type ExpandAllMode = "all" | "none" | null;

type ExpandState = {
  ids: Set<string>;
};

type ExpandAction =
  | { type: "TOGGLE_ROW"; rowKey: string }
  | { type: "EXPAND_ALL"; expandableRowKeys: string[] }
  | { type: "COLLAPSE_ALL" };

function expandReducer(state: ExpandState, action: ExpandAction): ExpandState {
  switch (action.type) {
    case "TOGGLE_ROW": {
      const next = new Set(state.ids);
      if (next.has(action.rowKey)) next.delete(action.rowKey);
      else next.add(action.rowKey);
      return { ids: next };
    }
    case "EXPAND_ALL":
      return { ids: new Set(action.expandableRowKeys) };
    case "COLLAPSE_ALL":
      return { ids: new Set() };
    default:
      return state;
  }
}

export function useOrderItems(
  lineItems: OrderDetailLineItem[],
  defaultPageSize: number,
  expandableRowKeys: string[]
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [expand, dispatchExpand] = useReducer(expandReducer, undefined, () => ({
    ids: new Set<string>(),
  }));

  const total = lineItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(currentPage, totalPages);
  const pageOffset = (safePage - 1) * pageSize;

  const pageSlice = useMemo(() => {
    const start = pageOffset;
    return lineItems.slice(start, start + pageSize);
  }, [lineItems, pageOffset, pageSize]);

  const pageVisibleRowKeys = useMemo(
    () =>
      new Set(
        pageSlice.map((item, index) => buildLineItemRowKey(item, pageOffset + index))
      ),
    [pageSlice, pageOffset]
  );

  /** Expand/collapse parent actions only apply to expandable rows on the current page. */
  const visibleExpandableRowKeys = useMemo(
    () => expandableRowKeys.filter((key) => pageVisibleRowKeys.has(key)),
    [expandableRowKeys, pageVisibleRowKeys]
  );

  const expandableKeySet = useMemo(() => {
    const next = new Set(visibleExpandableRowKeys);
    for (const rowKey of expand.ids) {
      if (pageVisibleRowKeys.has(rowKey)) {
        next.add(rowKey);
      }
    }
    return next;
  }, [visibleExpandableRowKeys, expand.ids, pageVisibleRowKeys]);

  const expandedIds = expand.ids;

  const expandAllMode = useMemo((): ExpandAllMode => {
    if (visibleExpandableRowKeys.length === 0) return null;
    const expandedCount = visibleExpandableRowKeys.filter((key) => expandedIds.has(key)).length;
    if (expandedCount === visibleExpandableRowKeys.length) return "all";
    if (expandedCount === 0) return "none";
    return null;
  }, [visibleExpandableRowKeys, expandedIds]);

  const isRowExpanded = useCallback(
    (rowKey: string) => {
      if (!expandableKeySet.has(rowKey)) return false;
      return expandedIds.has(rowKey);
    },
    [expandableKeySet, expandedIds]
  );

  const toggleRow = useCallback(
    (rowKey: string) => {
      if (!expandableKeySet.has(rowKey)) return;
      dispatchExpand({ type: "TOGGLE_ROW", rowKey });
    },
    [expandableKeySet]
  );

  const expandAll = useCallback(() => {
    dispatchExpand({ type: "EXPAND_ALL", expandableRowKeys: visibleExpandableRowKeys });
  }, [visibleExpandableRowKeys]);

  const collapseAll = useCallback(() => {
    dispatchExpand({ type: "COLLAPSE_ALL" });
  }, []);

  const setPageSizeAndReset = useCallback((n: number) => {
    setPageSize(n);
    setCurrentPage(1);
  }, []);

  return {
    currentPage: safePage,
    setCurrentPage,
    pageSize,
    setPageSize: setPageSizeAndReset,
    total,
    totalPages,
    pageSlice,
    pageOffset,
    visibleExpandableRowKeys,
    expandAllMode,
    expandedRowCount: expandedIds.size,
    isRowExpanded,
    toggleRow,
    expandAll,
    collapseAll,
    buildRowKey: buildLineItemRowKey,
  };
}

export type OrderItemsViewModel = ReturnType<typeof useOrderItems>;
