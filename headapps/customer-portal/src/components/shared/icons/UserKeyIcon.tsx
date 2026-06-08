"use client";

import { faUserLock } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface UserKeyIconProps extends Omit<IconProps, "icon"> {
  /**
   * Width of the icon
   * @default 16
   */
  width?: number | string;
  /**
   * Height of the icon
   * @default 17
   */
  height?: number | string;
  decorative?: boolean;
}

/**
 * UserKeyIcon component that displays a user/profile icon with a key symbol.
 */
export default function UserKeyIcon({
  width = 16,
  height = 17,
  className = "",
  decorative = false,
  "aria-label": ariaLabel = "User Key",
  ...props
}: UserKeyIconProps) {
  return (
    <Icon
      icon={faUserLock}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
