"use client";

import { faGear } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface PartsIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * PartsIcon component that displays a parts icon.
 */
export default function PartsIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: PartsIconProps) {
  return (
    <Icon
      icon={faGear}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
