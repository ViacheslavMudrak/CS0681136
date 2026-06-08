"use client";

import { faTruck } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface ShipmentIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * ShipmentIcon component that displays a shipment icon.
 */
export default function ShipmentIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: ShipmentIconProps) {
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
