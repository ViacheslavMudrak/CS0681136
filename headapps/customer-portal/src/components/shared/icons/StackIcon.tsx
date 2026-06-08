"use client";

import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface StackIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * StackIcon component that displays a stack/layers icon.
 */
export default function StackIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: StackIconProps) {
  return (
    <Icon
      icon={faLayerGroup}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
