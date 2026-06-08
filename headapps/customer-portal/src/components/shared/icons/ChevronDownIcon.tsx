"use client";

import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

export interface IIconProps extends Omit<IconProps, "icon" | "decorative"> {
  decorative?: boolean;
}

/**
 * ChevronDownIcon component that displays a down-pointing chevron arrow.
 */
export default function ChevronDownIcon({
  width = 12,
  height = 12,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: IIconProps) {
  return (
    <Icon
      icon={faChevronDown}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
