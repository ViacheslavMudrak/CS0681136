"use client";

import { faChevronDown, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import React, { useCallback, useRef } from "react";

function openNativeSelectPicker(select: HTMLSelectElement | null): void {
  if (!select || select.disabled) {
    return;
  }

  select.focus({ preventScroll: true });

  try {
    if (typeof select.showPicker === "function") {
      select.showPicker();
      return;
    }
  } catch {
    /* showPicker may throw when not allowed; fall back to click */
  }

  select.click();
}

import Button from "@/components/ui/Button";
import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";
import { scrollListingPanelIntoView } from "@/hooks/use-scroll-extent-sync";
import {
  buildPageList,
  clampOrderManagementPageIndex,
  computeOrderManagementTotalPages,
  normalizeOrderManagementPageSize,
  resolveOrderManagementResultSummaryPattern,
} from "@/lib/orderManagementUtils";
import { cn } from "@/lib/utils";

export function OrderManagementPagination({
  orderManagement,
}: {
  orderManagement: OrderManagementShell;
}): React.ReactElement {
  const {
    resultSummaryPatternField,
    totalResults,
    safePage,
    pageSize,
    onPageSizeChange,
    setCurrentPage,
    pageSizeOptions,
    isOrdersListLoading,
  } = orderManagement;

  const safeTotalPages = computeOrderManagementTotalPages(totalResults, pageSize);
  const safePageIndex = clampOrderManagementPageIndex(safePage, safeTotalPages);
  const safePageSize = normalizeOrderManagementPageSize(pageSize);
  const pages = buildPageList(safePageIndex, safeTotalPages);

  const start = totalResults === 0 ? 0 : (safePageIndex - 1) * safePageSize + 1;
  const end = totalResults === 0 ? 0 : Math.min(safePageIndex * safePageSize, totalResults);

  const pageSizeSelectRef = useRef<HTMLSelectElement>(null);
  const openPageSizePicker = useCallback(() => {
    openNativeSelectPicker(pageSizeSelectRef.current);
  }, []);

  const handlePageSizeControlPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (target.closest("select")) {
        return;
      }
      event.preventDefault();
      openPageSizePicker();
    },
    [openPageSizePicker]
  );

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-[12px] border-t border-border-gray px-[14px] py-[8px]",
        "text-[12px] leading-[1.375] text-text-heading sm:flex-row sm:items-center sm:justify-between"
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-[16px] gap-y-[8px]">
        <span className="whitespace-nowrap text-[12px] leading-[1.375] text-text-heading">
          {resolveOrderManagementResultSummaryPattern(
            resultSummaryPatternField,
            start,
            end,
            totalResults
          )}
        </span>
        <div className="inline-flex shrink-0 items-center gap-[8px]">
          <span className="whitespace-nowrap text-[12px] leading-[1.375] text-text-basic">Rows</span>
          <div
            role="group"
            aria-label="Rows per page"
            className={cn(
              "inline-flex shrink-0 items-center gap-[4px] rounded-[4px] border border-border-default bg-bg-basic px-[6px] py-[6px]",
              isOrdersListLoading ? "cursor-not-allowed opacity-40" : "cursor-pointer"
            )}
            onPointerDown={handlePageSizeControlPointerDown}
          >
            <select
              ref={pageSizeSelectRef}
              id="order-mgmt-page-size"
              className={cn(
                "max-w-[48px] min-w-[28px] cursor-pointer appearance-none border-0 bg-transparent p-0 text-center",
                "text-[12px] leading-[1.25] text-text-heading",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-border-basic-color"
              )}
              value={pageSize}
              disabled={isOrdersListLoading}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                requestAnimationFrame(() => {
                  scrollListingPanelIntoView();
                });
              }}
              aria-label="Rows per page"
              aria-busy={isOrdersListLoading || undefined}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="inline-flex shrink-0 items-center text-[10px] leading-none text-text-basic" aria-hidden>
              <Icon icon={faChevronDown} width={12} height={12} />
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-[4px]" role="navigation" aria-label="Pagination">
        <Button
          type="button"
          variant="ghost"
          btnVariant="iconBtn"
          className={cn(
            "inline-flex h-[32px] min-w-[32px] items-center justify-center rounded-[6px] px-[2px] py-[8px] text-text-heading",
            "hover:bg-bg-lighter-gray focus:outline-none focus-visible:ring-2",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          )}
          isDisabled={safePageIndex <= 1 || isOrdersListLoading}
          onPress={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
          aria-label="Previous page"
        >
          <Icon icon={faChevronLeft} width={16} height={16} aria-hidden />
        </Button>

        <div className="flex items-center gap-[4px]">
          {pages.map((p: number | "ellipsis", idx: number) =>
            p === "ellipsis" ? (
              <span
                key={`e-${idx}`}
                className="inline-flex select-none items-center justify-center px-[6px] py-[8px] text-text-basic"
                aria-hidden
              >
                …
              </span>
            ) : p === safePageIndex ? (
              <span
                key={p}
                className="inline-flex h-[32px] min-w-[32px] items-center justify-center rounded-[4px] bg-bg-pagination-active px-[8px] py-[8px] text-[12px] font-medium text-text-heading"
                aria-current="page"
              >
                {p}
              </span>
            ) : (
              <Button
                key={p}
                type="button"
                variant="transparent"
                className={cn(
                  "inline-flex h-[32px] min-w-[32px] items-center justify-center rounded-[4px] bg-bg-basic px-[8px] py-[8px]",
                  "text-[12px] font-medium text-text-basic hover:bg-bg-lighter-gray focus:outline-none focus-visible:ring-2"
                )}
                isDisabled={isOrdersListLoading}
                onPress={() => setCurrentPage(p as number)}
                aria-label={`Page ${p}`}
              >
                {p}
              </Button>
            )
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          btnVariant="iconBtn"
          className={cn(
            "inline-flex h-[32px] min-w-[32px] items-center justify-center rounded-[6px] px-[2px] py-[8px] text-text-heading",
            "hover:bg-bg-lighter-gray focus:outline-none focus-visible:ring-2",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          )}
          isDisabled={safePageIndex >= safeTotalPages || isOrdersListLoading}
          onPress={() => setCurrentPage((p: number) => Math.min(safeTotalPages, p + 1))}
          aria-label="Next page"
        >
          <Icon icon={faChevronRight} width={16} height={16} aria-hidden />
        </Button>
      </div>
    </div>
  );
}
