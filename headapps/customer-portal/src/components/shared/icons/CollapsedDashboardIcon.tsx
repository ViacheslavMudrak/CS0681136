"use client";

import { faGauge } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface IIconProps extends Omit<IconProps, "icon" | "decorative"> {
  decorative?: boolean;
}

/**
 * CollapsedDashboardIcon component that displays a collapsed dashboard icon.
 */
export default function CollapsedDashboardIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: IIconProps) {
  return (
    <Icon
      icon={faGauge}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
