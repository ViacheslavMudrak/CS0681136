"use client";

import { faBook } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface CollapsedResourcesIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * CollapsedResourcesIcon component that displays a collapsed resources icon.
 */
export default function CollapsedResourcesIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: CollapsedResourcesIconProps) {
  return (
    <Icon
      icon={faBook}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
