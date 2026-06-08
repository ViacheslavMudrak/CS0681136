"use client";

import React from "react";
import type { ButtonProps as LibraryButtonProps } from "@laitram-l-l-c/intralox-ui-components";
import { Button as DXPButton } from "@laitram-l-l-c/intralox-ui-components";

import { cn } from "lib/utils";

import { buttonClasses } from "components/ui/buttonVariants";
import {
  ctaButtonClasses,
  type CtaButtonTheme,
  type CtaButtonType,
} from "components/ui/ctaVariants";
import Link from "components/ui/Link";

export type { CtaButtonTheme, CtaButtonType };

type PortalVisualVariant =
  | "primary"
  | "inverse"
  | "muted"
  | "ghost"
  | "destroyPrimary"
  | "destroySecondary"
  | "transparent";

type DesignSystemButtonVariant = NonNullable<LibraryButtonProps["variant"]>;

type ButtonClassNameState = {
  isPressed?: boolean;
  isHovered?: boolean;
  isFocused?: boolean;
  isFocusVisible?: boolean;
  isDisabled?: boolean;
};

function toDesignSystemVariant(variant: PortalVisualVariant): DesignSystemButtonVariant {
  if (variant === "ghost" || variant === "transparent") {
    return "muted";
  }
  return variant;
}

function toPortalButtonSize(btnVariant?: "link" | "iconBtn"): "default" | "icon" {
  return btnVariant === "iconBtn" ? "icon" : "default";
}

export interface ButtonProps extends Omit<LibraryButtonProps, "className" | "variant"> {
  btnVariant?: "link" | "iconBtn";
  variant?: PortalVisualVariant;
  border?: boolean;
  role?: React.AriaRole;
  type?: "button" | "submit" | "reset";
  className?: string | ((props: ButtonClassNameState) => string);
  children: React.ReactNode;
  href?: string;
  rel?: string;
  target?: string;
  /** Sitecore CTA style from ButtonView / LinkView — pill, more, link, or rect. */
  buttonType?: CtaButtonType;
  buttonTheme?: CtaButtonTheme;
  contrast?: boolean;
  /** Legacy DOM click handler; forwarded to React Aria `onPress`. */
  onClick?: () => void;
}

export default function Button({
  variant = "primary",
  border,
  children,
  btnVariant,
  href,
  buttonType,
  buttonTheme,
  contrast,
  className,
  onClick,
  onPress,
  rel,
  target,
  ...props
}: ButtonProps) {
  const handlePress = onPress ?? (onClick ? () => onClick() : undefined);

  if (btnVariant === "link") {
    return (
      <Link
        href={href || "#"}
        rel={rel}
        target={target}
        buttonType={buttonType}
        buttonTheme={buttonTheme}
        contrast={contrast}
        className={typeof className === "function" ? undefined : className}
        onPress={handlePress}
      >
        {children}
      </Link>
    );
  }

  const dsVariant = toDesignSystemVariant(variant);
  const size = toPortalButtonSize(btnVariant);

  return (
    <DXPButton
      {...props}
      variant={dsVariant}
      border={border}
      onPress={handlePress}
      className={
        typeof className === 'function'
          ? (state: ButtonClassNameState) =>
              cn(
                buttonType !== undefined ?
                  ctaButtonClasses({ buttonType, buttonTheme, contrast })
                : undefined,
                buttonClasses({
                  variant,
                  size,
                  className: className(state),
                }),
              )
          : cn(
              buttonType !== undefined ?
                ctaButtonClasses({ buttonType, buttonTheme, contrast })
              : undefined,
              buttonClasses({ variant, size, className }),
            )
      }
    >
      {children}
    </DXPButton>
  );
}
