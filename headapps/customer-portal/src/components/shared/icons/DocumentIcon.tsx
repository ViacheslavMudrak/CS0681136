"use client";

import { faFile } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface DocumentIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * DocumentIcon component that displays a document icon.
 */
export default function DocumentIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: DocumentIconProps) {
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
