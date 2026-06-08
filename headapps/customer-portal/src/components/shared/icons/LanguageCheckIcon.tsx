"use client";

import { faLanguage } from "@fortawesome/free-solid-svg-icons";
import type { IconProps } from "@laitram-l-l-c/intralox-ui-components";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export interface LanguageCheckIconProps extends Omit<IconProps, "icon"> {
  decorative?: boolean;
}

/**
 * LanguageCheckIcon component that displays a language check icon.
 */
export default function LanguageCheckIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: LanguageCheckIconProps) {
  return (
    <Icon
      icon={faLanguage}
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
