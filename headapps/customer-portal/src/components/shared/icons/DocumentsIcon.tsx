"use client";

import { faFile } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface DocumentsIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * DocumentsIcon component that displays a documents icon.
 */
export default function DocumentsIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: DocumentsIconProps) {
  return (
    <Icon
      icon={faFile}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
