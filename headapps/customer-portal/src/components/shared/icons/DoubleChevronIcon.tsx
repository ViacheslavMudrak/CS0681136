"use client";

import React from "react";

import { cn } from "@/lib/utils";

const DOUBLE_CHEVRON_PATH =
  "M4.10156 8.49609L0.195312 4.58984C0 4.41406 0 4.12109 0.195312 3.92578C0.371094 3.75 0.664062 3.75 0.859375 3.92578L4.43359 7.5L8.00781 3.92578C8.18359 3.75 8.47656 3.75 8.65234 3.92578C8.84766 4.10156 8.84766 4.41406 8.65234 4.58984L4.74609 8.49609C4.57031 8.67188 4.27734 8.67188 4.10156 8.49609ZM0.195312 0.839844C0 0.664062 0 0.371094 0.195312 0.175781C0.371094 0 0.664062 0 0.859375 0.175781L4.43359 3.75L8.00781 0.175781C8.18359 0 8.47656 0 8.65234 0.175781C8.84766 0.351562 8.84766 0.664062 8.65234 0.839844L4.74609 4.74609C4.57031 4.92188 4.27734 4.92188 4.10156 4.74609L0.195312 0.839844Z";

export interface DoubleChevronIconProps {
  direction?: "up" | "down";
  width?: number;
  height?: number;
  className?: string;
}

/** Figma double-chevron for Order Detail expand/collapse-all actions. */
export function DoubleChevronIcon({
  direction = "down",
  width = 10.5,
  height = 10.5,
  className,
}: DoubleChevronIconProps): React.ReactElement {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 9 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "shrink-0 text-[var(--color-action-primary)]",
        direction === "up" && "rotate-180",
        className
      )}
      aria-hidden
    >
      <path d={DOUBLE_CHEVRON_PATH} fill="currentColor" />
    </svg>
  );
}
