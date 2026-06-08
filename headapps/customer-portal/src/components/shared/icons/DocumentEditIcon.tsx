"use client";

import { faFilePen } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface DocumentEditIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
  /**
   * Width of the icon
   * @default 13
   */
  width?: number | string;
  /**
   * Height of the icon
   * @default 15
   */
  height?: number | string;
}

/**
 * DocumentEditIcon component that displays a document with edit symbol.
 */
export default function DocumentEditIcon({
  width = 13,
  height = 15,
  className = "",
  decorative = false,
  "aria-label": ariaLabel = "Document Edit",
  ...props
}: DocumentEditIconProps) {
  return (
    <Icon
      icon={faFilePen}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
