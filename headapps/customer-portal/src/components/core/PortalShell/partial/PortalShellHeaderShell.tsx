import type { ReactElement, ReactNode } from "react";
import { cn } from "@/lib/utils";

type PortalShellHeaderShellProps = {
  sideNavOpen: boolean;
  mobileNavToggle: ReactNode;
  topNav: ReactNode;
};

export default function PortalShellHeaderShell({
  sideNavOpen,
  mobileNavToggle,
  topNav,
}: PortalShellHeaderShellProps): ReactElement {
  return (
    <header
      className={cn(
        "flex shrink-0 items-stretch w-full overflow-visible h-[60px] min-h-[60px] lg:h-[72px] lg:min-h-[72px] lg:sticky lg:top-0 lg:z-20",
        "bg-[var(--color-bg-basic-color)] border-b border-b-[var(--color-border-default)] shadow-[var(--color-portal-header-shadow)]",
        "max-md:absolute max-md:left-0 max-md:top-0 max-md:w-full max-md:h-[60px] max-md:min-h-[60px] max-md:bg-white max-md:shadow-[0px_0px_8px_rgba(0,0,0,0.28)] max-md:rounded-none max-md:border-b-0 max-md:z-[45]",
        sideNavOpen && "max-lg:z-20"
      )}
    >
      {mobileNavToggle}
      <div
        className={cn(
          "flex flex-row items-center flex-1 min-w-0 max-md:justify-between max-md:pe-2",
          "[&>*:nth-child(2)]:flex-1 [&>*:nth-child(2)]:min-w-0"
        )}
      >
        {topNav}
      </div>
    </header>
  );
}
