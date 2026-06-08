"use client";

import type { ReactElement, ReactNode, RefObject } from "react";
import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";
import { cn } from "@/lib/utils";

const mobileCardsRootClass =
  "relative overflow-x-clip overscroll-x-none pt-[15px] pr-[15px] pb-[21px] pl-[15px] gap-[15px] md:hidden";

type OrderManagementMobileCardShellProps = {
  cardsRootRef: RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  hasRows: boolean;
  emptyState: ReactNode;
  loadingLabel: string;
  children: ReactNode;
  refetchOverlay?: ReactNode;
};

export default function OrderManagementMobileCardShell({
  cardsRootRef,
  isLoading,
  hasRows,
  emptyState,
  loadingLabel,
  children,
  refetchOverlay,
}: OrderManagementMobileCardShellProps): ReactElement {
  if (!isLoading && !hasRows) {
    return (
      <div ref={cardsRootRef} className={mobileCardsRootClass}>
        <div className="flex flex-col gap-[12px] lg:hidden" role="status">
          {emptyState}
        </div>
      </div>
    );
  }

  if (isLoading && !hasRows) {
    return (
      <div ref={cardsRootRef} className={mobileCardsRootClass}>
        <div
          className="flex flex-col gap-[12px] md:hidden"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="sr-only">{loadingLabel}</span>
          <div className="flex w-full max-w-lg flex-col items-center justify-center gap-5 py-16 px-4 mx-auto">
            <LoadingSkeleton variant="skeleton" size="medium" className="!p-0 w-full" />
            <LoadingSkeleton variant="skeleton" size="medium" className="!p-0 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={cardsRootRef} className={mobileCardsRootClass}>
      {refetchOverlay}
      <div className={cn("flex flex-col gap-[12px] lg:hidden")}>{children}</div>
    </div>
  );
}
