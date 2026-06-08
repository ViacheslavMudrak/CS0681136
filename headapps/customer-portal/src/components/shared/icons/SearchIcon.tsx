"use client";

import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface SearchIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * SearchIcon component that displays a search/magnifying glass icon.
 */
export default function SearchIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: SearchIconProps) {
  return (
    <Icon
      icon={faMagnifyingGlass}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
