"use client";

import type { ReactElement } from "react";
import PortalRouteLoadingFallback from "@/components/shared/portal-loading/PortalRouteLoadingFallback";

export default function LocaleError(): ReactElement {
  return (
    <div className="min-h-screen w-full bg-[var(--color-portal-bg)]" role="alert">
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-[20px] font-semibold text-[var(--color-text-heading-color)] m-0 mb-3">
          Something went wrong
        </h1>
        <p className="text-[14px] text-[var(--color-text-basic)] m-0 mb-8">
          We could not load this page. Please try again.
        </p>
        <PortalRouteLoadingFallback />
      </div>
    </div>
  );
}
