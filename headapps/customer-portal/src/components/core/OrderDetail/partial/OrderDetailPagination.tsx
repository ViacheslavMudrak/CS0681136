"use client";

import type { Field } from "@sitecore-content-sdk/nextjs";
import { faChevronDown, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import React from "react";

import Button from "@/components/ui/Button";
import { scrollListingPanelIntoView } from "@/hooks/use-scroll-extent-sync";
import {
  buildPageList,
  resolveOrderManagementResultSummaryPattern,
} from "@/lib/orderManagementUtils";

/**
 * Line-item table footer: summary pattern, page size, and page controls.
 */
export function OrderDetailPagination({
  totalResults,
  safePage,
  pageSize,
  setPageSize,
  setCurrentPage,
  totalPages,
  pageSizeOptions,
  cmsDefaultPageSize,
  resultSummaryPattern,
}: {
  totalResults: number;
  safePage: number;
  pageSize: number;
  setPageSize: (n: number) => void;
  setCurrentPage: (n: number | ((p: number) => number)) => void;
  totalPages: number;
  pageSizeOptions: readonly number[];
  cmsDefaultPageSize: number;
  resultSummaryPattern?: Field<string>;
}): React.ReactElement | null {
  if (totalResults <= cmsDefaultPageSize) {
    return null;
  }

  const pages = buildPageList(safePage, totalPages);
  const start = totalResults === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = totalResults === 0 ? 0 : Math.min(safePage * pageSize, totalResults);

  return (
    <div className="flex flex-col gap-[12px] sm:flex-row sm:items-center sm:justify-between w-full border-t border-[var(--color-border-gray)] px-[14px] py-[8px] text-[12px] leading-[1.375] text-[var(--color-text-heading-color)]">
      <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[8px] min-w-0">
        <span className="text-[12px] leading-[1.375] text-[var(--color-text-heading-color)] whitespace-nowrap">
          {resolveOrderManagementResultSummaryPattern(
            resultSummaryPattern,
            start,
            end,
            totalResults
          )}
        </span>
        <div className="inline-flex items-center gap-[8px] shrink-0">
          <span className="text-[12px] leading-[1.375] text-[var(--color-text-basic)] whitespace-nowrap">
            Rows
          </span>
          <div className="inline-flex items-center gap-[4px] shrink-0 rounded-[4px] border border-[var(--color-border-gray-300)] bg-[var(--color-bg-basic-color)] px-[6px] py-[6px]">
            <label htmlFor="order-detail-page-size" className="sr-only">
              Rows per page
            </label>
            <select
              id="order-detail-page-size"
              className="min-w-[28px] max-w-[48px] border-0 bg-transparent p-0 text-[12px] leading-[1.25] text-[var(--color-text-heading-color)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--color-border-basic-color)] appearance-none text-center"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
                requestAnimationFrame(() => {
                  scrollListingPanelIntoView();
                });
              }}
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="pointer-events-none text-[10px] text-[var(--color-text-basic)] shrink-0 leading-none" aria-hidden>
              <Icon icon={faChevronDown} width={12} height={12} />
            </span>
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-[4px] shrink-0" aria-label="Pagination">
        <Button
          type="button"
          variant="ghost"
          btnVariant="iconBtn"
          className="inline-flex items-center justify-center rounded-[6px] px-[2px] py-[8px] min-w-[32px] h-[32px] text-[var(--color-text-heading-color)] hover:bg-[var(--color-bg-lighter-gray)] focus:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          isDisabled={safePage <= 1}
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
                className="inline-flex items-center justify-center px-[6px] py-[8px] text-[var(--color-text-basic)] select-none"
                aria-hidden
              >
                …
              </span>
            ) : p === safePage ? (
              <span
                key={p}
                className="inline-flex items-center justify-center min-w-[32px] h-[32px] px-[8px] py-[8px] rounded-[4px] bg-[var(--color-bg-pagination-active)] text-[12px] font-medium text-[var(--color-text-heading-color)]"
                aria-current="page"
              >
                {p}
              </span>
            ) : (
              <Button
                key={p}
                type="button"
                variant="transparent"
                className="inline-flex items-center justify-center min-w-[32px] h-[32px] px-[8px] py-[8px] rounded-[4px] bg-[var(--color-bg-basic-color)] text-[12px] font-medium text-[var(--color-text-basic)] hover:bg-[var(--color-bg-lighter-gray)] focus:outline-none focus-visible:ring-2"
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
          className="inline-flex items-center justify-center rounded-[6px] px-[2px] py-[8px] min-w-[32px] h-[32px] text-[var(--color-text-heading-color)] hover:bg-[var(--color-bg-lighter-gray)] focus:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          isDisabled={safePage >= totalPages}
          onPress={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
          aria-label="Next page"
        >
          <Icon icon={faChevronRight} width={16} height={16} aria-hidden />
        </Button>
      </nav>
    </div>
  );
}
