"use client";

import type { ReactElement } from "react";
import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";
export default function PortalRouteLoadingFallback(): ReactElement {
  return (
    <div
      className="min-h-[100vh] w-full mx-auto space-y-4 p-6 bg-[var(--color-portal-bg)]"
      aria-busy="true"
    >
      <LoadingSkeleton variant="skeleton" size="large" />
      <LoadingSkeleton variant="card" size="large" />
    </div>
  );
}
