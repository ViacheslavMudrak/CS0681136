"use client";

import { faXmark } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import { cn } from "@/lib/utils";

export interface CloseIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
  /** When true (default), wraps the icon in a gray rounded circle. Set false for plain icon only. */
  withBackground?: boolean;
  /** Optional class for the wrapper when withBackground is true (e.g. size overrides). */
  wrapperClassName?: string;
}

const defaultWrapperClasses =
  "flex items-center justify-center rounded-full bg-gray-100 shrink-0 w-8 h-8";

/**
 * CloseIcon component that displays a close (X) icon.
 * By default renders with a gray rounded background and centered icon.
 * Uses Font Awesome faXmark via intralox Icon (no dedicated close icon in lib).
 */
export default function CloseIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  withBackground = true,
  wrapperClassName,
  "aria-label": ariaLabel,
  ...props
}: CloseIconProps) {
  const icon = (
    <Icon
      icon={faXmark as IconProps["icon"]}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );

  if (withBackground) {
    return (
      <span
        className={cn(defaultWrapperClasses, wrapperClassName)}
        aria-hidden={decorative}
      >
        {icon}
      </span>
    );
  }

  return icon;
}
