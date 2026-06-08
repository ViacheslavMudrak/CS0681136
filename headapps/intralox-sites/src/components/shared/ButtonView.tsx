"use client";

import type { ReactNode } from "react";

import Button from "components/ui/Button";
import type { CtaButtonTheme, CtaButtonType } from "components/ui/ctaVariants";

export type LinkViewButtonTheme = CtaButtonTheme;
export type LinkViewButtonType = "more" | "pill" | "link" | undefined;

export interface IButtonViewProps {
  className?: string;
  children?: ReactNode;
  buttonType?: LinkViewButtonType;
  contrast?: boolean;
  buttonTheme?: LinkViewButtonTheme;
  onClick?: () => void;
}

function resolveCtaButtonType(
  buttonType: LinkViewButtonType,
): CtaButtonType | undefined {
  if (buttonType === "pill" || buttonType === "more" || buttonType === "link") {
    return buttonType;
  }
  if (buttonType === undefined) {
    return "rect";
  }
  return "rect";
}

const ButtonView = ({
  onClick,
  className,
  children,
  buttonType,
  buttonTheme,
  contrast,
}: IButtonViewProps) => {
  return (
    <Button
      type="button"
      variant="primary"
      buttonType={resolveCtaButtonType(buttonType)}
      buttonTheme={buttonTheme}
      contrast={contrast}
      className={className}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default ButtonView;
