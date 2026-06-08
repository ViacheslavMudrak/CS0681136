"use client";

import { cn } from "@/lib/utils";
import type { PopoverProps as LibraryPopoverProps } from "@laitram-l-l-c/intralox-ui-components";
import { Popover as LibraryPopover } from "@laitram-l-l-c/intralox-ui-components";
import React from "react";

interface PopoverProps extends Omit<LibraryPopoverProps, "className"> {
  children: React.ReactNode;
  includeArrow?: boolean;
  className?: string | ((props: { isOpen?: boolean; placement?: string }) => string);
}

export default function Popover({ children, includeArrow, className, ...props }: PopoverProps) {
  return (
    <LibraryPopover
      includeArrow={includeArrow}
      className={typeof className === "function" ? className : cn(className)}
      {...props}
    >
      {children}
    </LibraryPopover>
  );
}
