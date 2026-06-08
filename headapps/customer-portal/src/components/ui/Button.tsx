"use client";

import React from "react";
import type { ButtonProps as LibraryButtonProps } from "@laitram-l-l-c/intralox-ui-components";
import { Button as DXPButton, Link } from "@laitram-l-l-c/intralox-ui-components";

import { buttonClasses } from "@/components/ui/buttonVariants";

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

function resolveButtonClassName(
  variant: PortalVisualVariant,
  size: "default" | "icon",
  className: ButtonProps["className"]
): LibraryButtonProps["className"] {
  if (typeof className === "function") {
    return (state: ButtonClassNameState) =>
      buttonClasses({
        variant,
        size,
        className: className(state),
      });
  }

  return buttonClasses({ variant, size, className });
}

interface ButtonProps extends Omit<LibraryButtonProps, "className" | "variant"> {
  btnVariant?: "link" | "iconBtn";
  variant?: PortalVisualVariant;
  border?: boolean;
  role?: React.AriaRole;
  type?: "button" | "submit" | "reset";
  className?: string | ((props: ButtonClassNameState) => string);
  children: React.ReactNode;
  href?: string;
}

export default function Button({
  variant = "primary",
  border,
  children,
  btnVariant,
  href,
  className,
  ...props
}: ButtonProps) {
  if (btnVariant === "link") {
    return <Link href={href || "#"}>{children}</Link>;
  }

  const dsVariant = toDesignSystemVariant(variant);
  const size = toPortalButtonSize(btnVariant);

  return (
    <DXPButton
      {...props}
      variant={dsVariant}
      border={border}
      className={resolveButtonClassName(variant, size, className)}
    >
      {children}
    </DXPButton>
  );
}
