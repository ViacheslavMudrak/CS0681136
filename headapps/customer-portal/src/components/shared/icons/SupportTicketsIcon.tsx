"use client";

import { faTicket } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface SupportTicketsIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * SupportTicketsIcon component that displays a support tickets icon.
 */
export default function SupportTicketsIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: SupportTicketsIconProps) {
  return (
    <Icon
      icon={faTicket}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
