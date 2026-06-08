"use client";

import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface HelpCenterIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * HelpCenterIcon component that displays a help center icon.
 */
export default function HelpCenterIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: HelpCenterIconProps) {
  return (
    <Icon
      icon={faCircleQuestion}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
