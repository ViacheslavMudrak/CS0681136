"use client";

import { faHeadset } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface SupportIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * SupportIcon component that displays a support icon.
 */
export default function SupportIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: SupportIconProps) {
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
