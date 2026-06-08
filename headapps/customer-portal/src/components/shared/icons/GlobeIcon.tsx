"use client";

import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface GlobeIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * GlobeIcon component that displays a globe/world icon.
 */
export default function GlobeIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: GlobeIconProps) {
  return (
    <Icon
      icon={faGlobe}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
