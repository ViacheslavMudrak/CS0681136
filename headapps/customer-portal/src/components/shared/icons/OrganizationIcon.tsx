"use client";

import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface OrganizationIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * OrganizationIcon component that displays an organization icon.
 */
export default function OrganizationIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: OrganizationIconProps) {
  return (
    <Icon
      icon={faBuilding}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
