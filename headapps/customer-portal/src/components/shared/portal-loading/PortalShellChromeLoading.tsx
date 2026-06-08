"use client";

import type { ReactElement } from "react";
import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";
import { cn } from "@/lib/utils";

type PortalShellChromeLoadingProps = {
  dir?: "ltr" | "rtl";
  "data-testid"?: string;
};

export function PortalShellMainSkeleton(): ReactElement {
  return (
    <>
      <LoadingSkeleton variant="card" size="large" />
      <div className="mt-4">
        <LoadingSkeleton variant="skeleton" size="large" />
      </div>
    </>
  );
}

export default function PortalShellChromeLoading({
  dir = "ltr",
  "data-testid": dataTestId = "portal-shell-route-loading",
}: PortalShellChromeLoadingProps): ReactElement {
  const isRtl = dir === "rtl";

  return (
    <div
      className="flex flex-col min-h-screen w-full bg-[var(--color-portal-bg)]"
      dir={dir}
      data-testid={dataTestId}
      aria-busy="true"
    >
      <header
        className={cn(
          "flex shrink-0 items-stretch w-full overflow-visible h-[60px] min-h-[60px] lg:h-[72px] lg:min-h-[72px] lg:sticky lg:top-0 lg:z-20",
          "bg-[var(--color-bg-basic-color)] border-b border-b-[var(--color-border-default)] shadow-[var(--color-portal-header-shadow)]",
          "max-md:absolute max-md:left-0 max-md:top-0 max-md:w-full max-md:h-[60px] max-md:min-h-[60px] max-md:bg-white max-md:shadow-[0px_0px_8px_rgba(0,0,0,0.28)] max-md:rounded-none max-md:border-b-0 max-md:z-[45]"
        )}
      >
        <div
          className={cn(
            "box-border flex flex-none shrink-0 overflow-hidden w-[60px] min-w-[60px] max-w-[60px] h-[60px] min-h-[60px] max-h-[60px] items-stretch p-0 invisible",
            "md:w-[72px] lg:min-w-[72px] lg:max-w-[72px] lg:min-h-[72px] lg:max-h-[72px] lg:h-[72px] lg:hidden"
          )}
          aria-hidden
        />
        <div
          className={cn(
            "flex flex-row items-center flex-1 min-w-0 gap-3 px-3 md:px-4 max-md:justify-between max-md:pe-2"
          )}
        >
          <div
            className="h-8 w-[120px] max-w-[40%] rounded bg-bg-light-gray animate-pulse shrink-0"
            aria-hidden
          />
          <div
            className="h-8 flex-1 min-w-0 max-w-xl rounded bg-bg-light-gray animate-pulse"
            aria-hidden
          />
          <div
            className="h-8 w-16 rounded-full bg-bg-light-gray animate-pulse shrink-0"
            aria-hidden
          />
        </div>
      </header>

      <div
        className={cn(
          "grid w-full grid-rows-[1fr] flex-1 grid-cols-1 lg:grid-cols-[275px_1fr] [direction:ltr] min-h-0 max-lg:min-h-0 lg:min-h-[calc(100vh-72px)] max-md:pt-[60px]",
          isRtl && "lg:grid-cols-[1fr_275px]"
        )}
      >
        <aside
          className={cn(
            "flex flex-col min-h-0 overflow-hidden w-[275px] lg:self-start lg:h-[calc(100vh-72px)] lg:max-h-[calc(100vh-72px)]",
            "bg-[linear-gradient(162.51deg,var(--color-portal-sidebar-start,#151e2c)_0%,var(--color-portal-sidebar-end,#1d2b42)_100%)]",
            "lg:sticky lg:top-[72px] lg:z-10 max-lg:hidden",
            isRtl && "lg:col-start-2 lg:row-start-1"
          )}
          aria-hidden
        >
          <div className="flex flex-col gap-3 p-4" aria-hidden>
            {(["w-[72%]", "w-[88%]", "w-[80%]", "w-[72%]", "w-[80%]", "w-[88%]"] as const).map(
              (w, i) => (
                <div key={i} className={`h-3 rounded bg-white/10 ${w}`} />
              )
            )}
          </div>
        </aside>
        <main
          className={cn(
            "min-h-0 max-lg:min-h-0 lg:min-h-full py-[16px] px-[16px] md:p-[18px] !pt-[16px] lg:py-[28px] lg:px-[24px] bg-[var(--color-portal-bg)]",
            isRtl && "lg:col-start-1 lg:row-start-1"
          )}
          aria-busy="true"
        >
          <PortalShellMainSkeleton />
        </main>
      </div>
    </div>
  );
}
