"use client";

import { faBell } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface NotificationIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * NotificationIcon component that displays a notification icon.
 */
export default function NotificationIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: NotificationIconProps) {
  return (
    <Icon
      icon={faBell}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
