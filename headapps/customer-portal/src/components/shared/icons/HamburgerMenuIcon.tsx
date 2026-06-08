"use client";

import { faBars } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface HamburgerMenuIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * HamburgerMenuIcon component that displays a hamburger menu icon.
 */
export default function HamburgerMenuIcon({
  width = 24,
  height = 24,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: HamburgerMenuIconProps) {
  return (
    <Icon
      icon={faBars}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
