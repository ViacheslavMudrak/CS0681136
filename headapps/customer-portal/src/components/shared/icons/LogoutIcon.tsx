"use client";

import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface LogoutIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * LogoutIcon component that displays a logout icon.
 */
export default function LogoutIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: LogoutIconProps) {
  return (
    <Icon
      icon={faRightFromBracket}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
