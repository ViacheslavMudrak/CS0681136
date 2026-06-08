"use client";

import { faUserShield } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface CollapsedRolesIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * CollapsedRolesIcon component that displays a collapsed roles icon.
 */
export default function CollapsedRolesIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: CollapsedRolesIconProps) {
  return (
    <Icon
      icon={faUserShield}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
