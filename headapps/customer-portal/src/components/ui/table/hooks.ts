"use client";

import { useCallback, useState } from "react";
import { TableSort } from "./Table.types";

export function useTableSort() {
  const [sort, setSort] = useState<TableSort | undefined>();

  const onSortChange = useCallback((newSort: TableSort) => {
    setSort(newSort);
  }, []);

  return {
    sort,
    setSort,
    onSortChange,
  };
}

export function useTableSelection() {
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());

  const onSelectionChange = useCallback((keys: "all" | Set<string | number>) => {
    if (keys === "all") {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(keys);
    }
  }, []);

  const toggleSelection = useCallback((key: string | number) => {
    setSelectedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  const selectAll = useCallback((keys: (string | number)[]) => {
    setSelectedKeys(new Set(keys));
  }, []);

  return {
    selectedKeys,
    setSelectedKeys,
    onSelectionChange,
    toggleSelection,
    clearSelection,
    selectAll,
  };
}

export function useTablePagination(totalItems: number, pageSize: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalItems / pageSize);
  const offset = (currentPage - 1) * pageSize;

  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentPage,
    pageSize,
    totalPages,
    offset,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    goToPage,
    nextPage,
    prevPage,
    setPageSize: (newSize: number) => {
      setCurrentPage(newSize || 1);
    },
  };
}
