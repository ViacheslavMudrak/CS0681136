"use client";

import { faHeadset } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface CollapsedSupportIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * CollapsedSupportIcon component that displays a collapsed support icon.
 */
export default function CollapsedSupportIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: CollapsedSupportIconProps) {
  return (
    <Icon
      icon={faHeadset}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
