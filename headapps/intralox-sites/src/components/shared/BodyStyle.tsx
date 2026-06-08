import React from "react";
import { cn } from 'lib/utils';

export type ColorScheme = "light" | "gray" | "dark";
export interface BodyStylesProps {
  className?: string;
  children: React.ReactNode;
  /** High-contrast prose when text sits on a dark background. */
  contrast?: boolean;
  /** Prose color scheme: light, gray, or dark. */
  colorScheme?: ColorScheme;
  /** Optional larger base text size (`xl`). */
  textSize?: "xl";
  /** Prose theme variant (article, compact, landingPage). */
  theme?: "base" | "article" | "compact" | "landingPage";
}

/** Applies design-system prose classes to rich-text HTML. */
const BodyStyles = ({
  className,
  children,
  contrast = false,
  colorScheme,
  textSize,
  theme,
}: BodyStylesProps) => {
  return (
    <div
      className={cn("prose", {
          true: "prose-contrast",
        }[contrast?.toString()] || "", colorScheme ? { light: "prose-light", gray: "prose-gray", dark: "prose-dark" }[colorScheme] : "", textSize ? { xl: "prose-xl" }[textSize] : "", theme ? { base: "prose-base", article: "prose-article", compact: "prose-compact", landingPage: "prose-landing-page" }[theme] : "", className)}
    >
      {children}
    </div>
  );
};

export default BodyStyles;
