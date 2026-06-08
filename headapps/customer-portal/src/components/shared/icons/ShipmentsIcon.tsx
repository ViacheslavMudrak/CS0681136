"use client";

import { faTruck } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface ShipmentsIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * ShipmentsIcon component that displays a shipments icon.
 */
export default function ShipmentsIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: ShipmentsIconProps) {
  return (
    <Icon
      icon={faTruck}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
