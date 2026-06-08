"use client";

import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface OrderIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * OrderIcon component that displays an order icon.
 */
export default function OrderIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: OrderIconProps) {
  return (
    <Icon
      icon={faCartShopping}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
