"use client";

import { faTicket } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface SupportCaseIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * SupportCaseIcon component that displays a support case icon.
 */
export default function SupportCaseIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: SupportCaseIconProps) {
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
