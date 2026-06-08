"use client";

import { faPen } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface EditIconProps extends Omit<IconProps, "icon"> {
  /**
   * Width of the icon
   * @default 16
   */
  width?: number | string;
  /**
   * Height of the icon
   * @default 16
   */
  height?: number | string;
  decorative?: boolean;
}

/**
 * EditIcon component that displays a pencil/edit symbol.
 */
export default function EditIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = false,
  "aria-label": ariaLabel = "Edit",
  ...props
}: EditIconProps) {
  return (
    <Icon
      icon={faPen}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
