"use client";

import { faFolder } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface CollapsedDocumentsIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * CollapsedDocumentsIcon component that displays a collapsed documents icon.
 */
export default function CollapsedDocumentsIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: CollapsedDocumentsIconProps) {
  return (
    <Icon
      icon={faFolder}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
