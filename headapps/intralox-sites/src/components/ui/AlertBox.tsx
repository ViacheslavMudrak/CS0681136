"use client";

import type { ReactNode } from "react";
import type { AlertBoxProps as LibraryAlertBoxProps } from "@laitram-l-l-c/intralox-ui-components";
import { AlertBox as LibraryAlertBox, alertBoxClasses } from "@laitram-l-l-c/intralox-ui-components";

import { cn } from "lib/utils";

import { layoutAlertStripClasses } from "components/ui/alertBoxVariants";

export interface AlertBoxProps extends Omit<LibraryAlertBoxProps, "className"> {
  children: ReactNode;
  className?: string;
  /** Full-width layout alert strip — applies warning variant + strip overrides. */
  layoutStrip?: boolean;
  /** Suppress the design-system icon slot (layout strip has no icon). */
  hideIcon?: boolean;
}

/**
 * Thin portal wrapper around the design-system AlertBox.
 * Compose DS base classes with portal overrides via `layoutStrip` or `className`.
 */
export default function AlertBox({
  layoutStrip,
  hideIcon,
  className,
  variant = "warning",
  icon,
  children,
  ...props
}: AlertBoxProps) {
  const resolvedClassName = layoutStrip
    ? layoutAlertStripClasses(className)
    : cn(alertBoxClasses({ variant, className }));

  const resolvedIcon =
    hideIcon ? <span className="hidden" aria-hidden="true" /> : icon;

  return (
    <LibraryAlertBox
      variant={variant}
      icon={resolvedIcon}
      className={resolvedClassName}
      {...props}
    >
      {children}
    </LibraryAlertBox>
  );
}
