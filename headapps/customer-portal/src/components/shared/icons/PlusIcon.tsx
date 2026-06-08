"use client";

import { faPlus } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface PlusIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * PlusIcon component that displays a plus icon.
 */
export default function PlusIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: PlusIconProps) {
  return (
    <Icon
      icon={faPlus}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
