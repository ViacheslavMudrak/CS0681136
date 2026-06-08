import type { ReactElement } from "react";
import { cn } from "@/lib/utils";
import HeaderClient from "./partial/HeaderClient";

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export default function Header({
  onToggleSidebar,
  isSidebarCollapsed = false,
}: HeaderProps): ReactElement {
  return (
    <header
      className={cn(
        "top-0 end-0 bg-white border-b border-gray-200 border-solid",
        "shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)]",
        "flex justify-between items-center gap-4 px-5 py-2 w-full z-30",
        "transition-all duration-300 ease-in-out",
        "start-0 max-lg:start-0 max-md:px-3",
        "lg:start-[233px]",
        isSidebarCollapsed && "lg:start-[56px]"
      )}
    >
      <HeaderClient onToggleSidebar={onToggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
    </header>
  );
}
