"use client";

import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

export interface IIconProps extends Omit<IconProps, "icon" | "decorative"> {
  decorative?: boolean;
}

/**
 * ChevronLeftIcon component that displays a left-pointing chevron arrow.
 */
export default function ChevronLeftIcon({
  width = 8,
  height = 12,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: IIconProps) {
  return (
    <Icon
      icon={faChevronLeft}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
