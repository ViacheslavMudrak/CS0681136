"use client";

import React from "react";
import type { LinkProps as LibraryLinkProps } from "@laitram-l-l-c/intralox-ui-components";
import { Link as LibraryLink } from "@laitram-l-l-c/intralox-ui-components";

import { cn } from "lib/utils";

import {
  ctaButtonClasses,
  type CtaButtonTheme,
  type CtaButtonType,
} from "components/ui/ctaVariants";

type LinkClassNameState = {
  isPressed?: boolean;
  isHovered?: boolean;
  isFocused?: boolean;
  isFocusVisible?: boolean;
  isDisabled?: boolean;
};

type DesignSystemButtonVariant = NonNullable<LibraryLinkProps["buttonVariant"]>;

export interface LinkProps extends Omit<
  LibraryLinkProps,
  "className" | "buttonVariant"
> {
  children: React.ReactNode;
  buttonVariant?: DesignSystemButtonVariant;
  /** Sitecore CTA style — pill, more, link, or rect. When set, overrides default link chrome. */
  buttonType?: CtaButtonType;
  buttonTheme?: CtaButtonTheme;
  contrast?: boolean;
  className?: string | ((props: LinkClassNameState) => string);
}

export default function Link({
  children,
  buttonVariant,
  buttonType,
  buttonTheme,
  contrast,
  className,
  ...props
}: LinkProps) {
  return (
    props.href && (
      <LibraryLink
        buttonVariant={buttonVariant}
        className={
          typeof className === "function"
            ? (state: LinkClassNameState) =>
                cn(
                  buttonType !== undefined
                    ? ctaButtonClasses({ buttonType, buttonTheme, contrast })
                    : undefined,
                  className(state),
                )
            : cn(
                buttonType !== undefined
                  ? ctaButtonClasses({ buttonType, buttonTheme, contrast })
                  : undefined,
                className,
              )
        }
        {...props}
      >
        {children}
      </LibraryLink>
    )
  );
}
