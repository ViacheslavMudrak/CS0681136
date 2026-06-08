"use client";

import { faUser } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface ProfileIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * ProfileIcon component that displays a profile icon.
 */
export default function ProfileIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: ProfileIconProps) {
  return (
    <Icon
      icon={faUser}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
