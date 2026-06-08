"use client";

import { faFileInvoice } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface InvoicesIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * InvoicesIcon component that displays an invoices icon.
 */
export default function InvoicesIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: InvoicesIconProps) {
  return (
    <Icon
      icon={faFileInvoice}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
