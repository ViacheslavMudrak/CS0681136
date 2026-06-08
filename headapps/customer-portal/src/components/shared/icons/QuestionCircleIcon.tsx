"use client";

import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface QuestionCircleIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * QuestionCircleIcon component that displays a question mark in a circle icon.
 */
export default function QuestionCircleIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: QuestionCircleIconProps) {
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
