"use client";

import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

export interface IIconProps extends Omit<IconProps, "icon" | "decorative"> {
  decorative?: boolean;
}

/**
 * ChevronRightIcon component that displays a right-pointing chevron arrow.
 */
export default function ChevronRightIcon({
  width = 6,
  height = 10,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: IIconProps) {
  return (
    <Icon
      icon={faChevronRight}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
