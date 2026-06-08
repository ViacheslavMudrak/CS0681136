"use client";

import { faCheck } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

/** Figma Profile Menu: check icon 14px, action blue #00287b */
export const CHECK_ICON_ACTION_COLOR = "#00287b";

export interface CheckIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
  /** Icon color (e.g. #00287b for Figma action blue) */
  color?: string;
}

/**
 * CheckIcon component that displays a check icon.
 * Default size 16px; pass width/height 14 and color for Figma profile menu.
 */
export default function CheckIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  color,
  "aria-label": ariaLabel,
  ...props
}: CheckIconProps) {
  return (
    <Icon
      icon={faCheck as IconProps["icon"]}
      width={width}
      height={height}
      className={className}
      {...(color ? { style: { color } } : {})}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
