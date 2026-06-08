"use client";

import { useEffect, useRef, type ReactElement } from "react";

import ContextualPanel from "@/components/shared/contextual-panel/ContextualPanel";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

import type { AuditLogEntry } from "./auditLogTypes";

export interface RolePermissionsAuditLogProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  isLoading?: boolean;
  /** True while the next page of audit rows is loading (infinite scroll). */
  isLoadingMore?: boolean;
  /** When true, scrolling to the bottom loads more rows via `onLoadMore`. */
  hasMore?: boolean;
  entries?: AuditLogEntry[];
  onLoadMore?: () => void;
}

/**
 * Slide-out audit log panel with optional infinite scroll for additional pages.
 */
export function RolePermissionsAuditLog({
  isOpen,
  title,
  onClose,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  entries = [],
  onLoadMore,
}: RolePermissionsAuditLogProps): ReactElement {
  const rows = entries;
  const bodyRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!isOpen || !hasMore || isLoading || isLoadingMore || rows.length === 0) {
      return;
    }
    const sentinel = sentinelRef.current;
    const root = bodyRef.current?.parentElement;
    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (observerEntries[0]?.isIntersecting) {
          onLoadMoreRef.current?.();
        }
      },
      { root, rootMargin: "120px", threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isOpen, hasMore, isLoading, isLoadingMore, rows.length]);

  const formatTimestamp = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <ContextualPanel
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="w-full sm:w-[480px]"
      headerClassName="border-b border-[var(--color-border-default)] px-5 pb-[17px] pt-4"
      titleClassName="font-medium leading-[1.375] text-[var(--color-text-black)]"
      closeButtonClassName="h-6 w-6 rounded-xl bg-[var(--color-border-default)] text-[var(--color-text-placeholder)] hover:bg-[var(--color-role-permissions-modal-close-hover)] hover:text-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-gray)] focus:ring-offset-2"
      contentClassName="px-[21px] pb-4 pt-[21px]"
    >
      <div ref={bodyRef} className="flex flex-col gap-4">
        {isLoading ? (
          <div className="py-8 text-center text-[var(--color-text-basic)]">
            Loading audit log...
          </div>
        ) : rows.length === 0 ? (
          <div className="py-8 text-center text-[var(--color-text-basic)]">
            No audit log entries found
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {rows.map((entry) => (
              <div
                key={entry.id}
                className="flex w-full flex-col rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-basic-color)] py-[16px] pl-[14px] pr-px hover:bg-[var(--color-bg-basic-color)]"
              >
                <div className="flex w-full items-start gap-3">
                  <Icon
                    icon={faClock}
                    width={15}
                    height={15}
                    className="mt-px h-[15px] w-[15px] shrink-0 text-[var(--color-icon-cyan)]"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1 gap-[10px]">
                    <p className="m-0 pe-3.5 text-[14px] font-[500] leading-[1.25] text-[var(--color-text-black)]">
                      <span className="font-medium">{entry.permission}</span>
                      <span className="font-normal"> changed from </span>
                      <span className="font-medium">{entry.oldValue}</span>
                      <span className="font-normal"> to </span>
                      <span className="font-medium">{entry.newValue}</span>
                      <span className="font-normal"> for </span>
                      <span className="font-medium">{entry.roleCategory}</span>
                    </p>
                    <p className="m-0 pe-3.5 text-[12px] font-[400] leading-[1.25] text-[#646467]">
                      <span>Updated by </span>
                      <span className="font-medium">{entry.user}</span>
                      <span> on {formatTimestamp(entry.timestamp)}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoadingMore ? (
              <div
                className="py-4 text-center text-sm text-[var(--color-text-basic)]"
                role="status"
                aria-live="polite"
              >
                Loading more…
              </div>
            ) : null}
            {hasMore ? (
              <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />
            ) : null}
          </div>
        )}
      </div>
    </ContextualPanel>
  );
}
