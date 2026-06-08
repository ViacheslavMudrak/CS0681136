"use client";

import { cva, cx } from "@laitram-l-l-c/intralox-ui-components";

const ctaPillBase = [
  "inline-flex min-w-28 cursor-pointer items-center justify-center",
  "rounded-[9999px] border-0 p-3 text-center text-sm font-normal leading-tight",
  "no-underline transition-colors duration-150 ease-in-out",
  "focus:outline-none focus-visible:outline focus-visible:outline-[3px]",
  "focus-visible:outline-accent-nav focus-visible:outline-offset-2",
  "disabled:cursor-not-allowed disabled:pointer-events-none",
  "disabled:bg-pagination-bg-disabled disabled:text-pagination-text-disabled",
];

export const ctaPillClasses = cva({
  base: ctaPillBase,
  variants: {
    theme: {
      contrast:
        "bg-surface text-action hover:bg-surface-selected hover:text-action-link visited:text-action hover:visited:text-action-link",
      default:
        "bg-action !text-ink-inverse hover:bg-action-link hover:text-ink-inverse",
      alert:
        "border border-warning-dark bg-warning text-text-heading-color hover:bg-warning-dark",
      muted:
        "bg-neutral-200 text-ink-primary hover:text-ink-primary visited:text-ink-primary hover:bg-stroke-default",
    },
  },
  defaultVariants: { theme: "default" },
});

export const ctaMoreLinkClasses = cva({
  base: [
    "min-w-[112px] rounded-[9999px] border border-action p-3",
    "text-sm font-normal no-underline transition-colors",
    "hover:underline focus:outline-none focus:ring",
  ],
  variants: {
    contrast: {
      true: "text-ink-inverse hover:text-chrome-chevron",
      false: "text-action-link hover:text-action",
    },
  },
  defaultVariants: { contrast: false },
});

export const ctaRectClasses = cva({
  base: [
    "inline-block min-w-0 rounded p-2 text-center leading-normal",
    "no-underline transition-colors",
    "bg-brand-red text-ink-inverse hover:bg-surface-inverse",
  ],
});

export type CtaButtonType = "pill" | "more" | "link" | "rect";
export type CtaButtonTheme = "alert" | "contrast" | "default" | "muted";

export function resolveCtaPillTheme(
  contrast: boolean | undefined,
  buttonTheme: CtaButtonTheme | undefined,
): "contrast" | "default" | "alert" | "muted" {
  if (contrast) {
    return "contrast";
  }
  return buttonTheme ?? "default";
}

/**
 * Resolves Tailwind classes for Sitecore CTA button types (pill, more, link, rect).
 * Mirrors legacy `link-renderer.scss` using design-system tokens.
 */
export function ctaButtonClasses(options: {
  buttonType: CtaButtonType;
  contrast?: boolean;
  buttonTheme?: CtaButtonTheme;
  className?: string;
}): string {
  const { buttonType, contrast, buttonTheme, className } = options;

  if (buttonType === "pill") {
    return ctaPillClasses({
      theme: resolveCtaPillTheme(contrast, buttonTheme),
      className,
    });
  }

  if (buttonType === "more" || buttonType === "link") {
    return ctaMoreLinkClasses({ contrast: !!contrast, className });
  }

  return ctaRectClasses({ className });
}

export { cx };
