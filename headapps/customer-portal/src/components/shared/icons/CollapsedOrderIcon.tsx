"use client";

import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface CollapsedOrderIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * CollapsedOrderIcon component that displays a collapsed order icon.
 */
export default function CollapsedOrderIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: CollapsedOrderIconProps) {
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
