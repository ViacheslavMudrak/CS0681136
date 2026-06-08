"use client";

import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface EmailIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * EmailIcon component that displays an email icon.
 */
export default function EmailIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: EmailIconProps) {
  return (
    <Icon
      icon={faEnvelope}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
