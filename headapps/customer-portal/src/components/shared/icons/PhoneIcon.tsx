"use client";

import { faPhone } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface PhoneIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * PhoneIcon component that displays a phone icon.
 */
export default function PhoneIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: PhoneIconProps) {
  return (
    <Icon
      icon={faPhone}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
