"use client";

import type { ReactElement } from "react";
import Button from "@/components/ui/Button";
import CloseIcon from "@/components/shared/icons/CloseIcon";
import HamburgerMenuIcon from "@/components/shared/icons/HamburgerMenuIcon";
import { cn } from "@/lib/utils";

type MobileNavToggleProps = {
  sideNavOpen: boolean;
  onToggle: () => void;
};

export default function MobileNavToggle({
  sideNavOpen,
  onToggle,
}: MobileNavToggleProps): ReactElement {
  return (
    <div
      className={cn(
        "box-border flex flex-none shrink-0 overflow-hidden w-[60px] min-w-[60px] max-w-[60px] h-[60px] min-h-[60px] max-h-[60px] items-stretch p-0",
        "md:w-[72px] lg:min-w-[72px] lg:max-w-[72px] lg:min-h-[72px] lg:max-h-[72px] lg:h-[72px] lg:hidden"
      )}
    >
      <Button
        type="button"
        variant="primary"
        className={cn(
          "box-border flex lg:hidden shrink-0 items-center justify-center border-0 cursor-pointer",
          "w-[60px] h-[60px] min-w-0 min-h-0 max-w-[60px] max-h-[60px] lg:w-[72px] lg:h-[72px] lg:max-w-[72px] lg:max-h-[72px]",
          "!bg-[#161f2e] text-white !p-0 !px-0 !py-0 !m-0 !min-w-0",
          "transition-colors duration-150 hover:!bg-[#1e293b] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white",
          "relative z-10 touch-manipulation rounded-none",
          sideNavOpen && "max-lg:fixed max-lg:z-[60] max-lg:top-0 max-lg:inset-inline-start-0"
        )}
        onPress={onToggle}
        aria-label={sideNavOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={sideNavOpen}
      >
        {sideNavOpen ? (
          <CloseIcon
            withBackground={false}
            width={24}
            height={24}
            className="text-white h-[24px] w-[24px]"
          />
        ) : (
          <HamburgerMenuIcon
            width={24}
            height={24}
            className="text-white h-[24px] w-[24px]"
            decorative={false}
            aria-hidden
          />
        )}
      </Button>
    </div>
  );
}
