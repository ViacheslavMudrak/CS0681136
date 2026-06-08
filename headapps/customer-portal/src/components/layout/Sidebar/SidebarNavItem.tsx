"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface SidebarNavItemProps {
  href?: string;
  icon?: React.ReactNode;
  label: string;
  isActive?: boolean;
  hasDropdown?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  isNested?: boolean;
}

export default function SidebarNavItem({
  href,
  icon,
  label,
  isActive = false,
  hasDropdown = false,
  children,
  onClick,
  isNested = false,
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(hasDropdown && label === "Order Management");
  const isCurrentActive = isActive || (href && pathname === href);

  const handleClick = () => {
    if (hasDropdown) {
      setIsExpanded(!isExpanded);
    }
    onClick?.();
  };

  const className = cn(
    "flex items-center gap-[10.5px] h-[35px] px-[10.5px] rounded-[7px] text-[#99a1af] text-[12.25px] font-normal transition-colors duration-150 w-full relative hover:bg-[rgba(51,65,85,0.5)]",
    isNested &&
      "h-[28px] px-[10.5px] py-[7px] text-[10.5px] bg-transparent hover:bg-[rgba(51,65,85,0.3)]",
    isCurrentActive && "bg-[rgba(51,65,85,0.5)] text-white"
  );

  const content = (
    <>
      {icon && (
        <div className="flex items-center justify-center w-[17.5px] h-[17.5px] shrink-0 [&_img]:block [&_img]:max-w-none [&_img]:w-full [&_img]:h-full">
          {icon}
        </div>
      )}
      <span className="flex-1 text-start">{label}</span>
      {hasDropdown && (
        <div
          className={cn(
            "w-[14px] h-[14px] shrink-0 transition-transform duration-150 text-[#99a1af]",
            isExpanded && "rotate-180",
            isCurrentActive && "text-white"
          )}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.5 5.25L7 8.75L10.5 5.25"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </>
  );

  if (href && !hasDropdown) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  if (hasDropdown) {
    return (
      <div>
        <button className={className} onClick={handleClick} aria-expanded={isExpanded}>
          {content}
        </button>
        {isExpanded && children && (
          <div className="mt-[3px] border-[rgba(74,85,101,0.5)] flex flex-col gap-0 ms-[21px] ps-4 border-s-2 border-solid pt-[3px] pb-[3px]">
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <button className={className} onClick={handleClick}>
      {content}
    </button>
  );
}
