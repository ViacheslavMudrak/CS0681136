"use client";

import { cn } from "@/lib/utils";
import type { LinkProps as LibraryLinkProps } from "@laitram-l-l-c/intralox-ui-components";
import { Link as LibraryLink } from "@laitram-l-l-c/intralox-ui-components";
import React from "react";

interface LinkProps extends Omit<LibraryLinkProps, "className"> {
  children: React.ReactNode;
  buttonVariant?: "primary" | "inverse" | "muted" | "destroyPrimary" | "destroySecondary";
  className?:
    | string
    | ((props: {
        isPressed?: boolean;
        isHovered?: boolean;
        isFocused?: boolean;
        isFocusVisible?: boolean;
        isDisabled?: boolean;
      }) => string);
}

export default function Link({ children, buttonVariant, className, ...props }: LinkProps) {
  return (
    <LibraryLink
      buttonVariant={buttonVariant}
      className={typeof className === "function" ? className : cn(className)}
      {...props}
    >
      {children}
    </LibraryLink>
  );
}
