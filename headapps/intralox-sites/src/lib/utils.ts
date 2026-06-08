import { type ClassValue, clsx } from "clsx";
import { BackgroundColor } from "src/utils/enum";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Custom font-size tokens defined in variables.scss / theme.css.
 * Listed here so tailwind-merge classifies them as font-size (not text-color),
 * preventing accidental removal when a text-color class follows in the same cn() call.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-font-small",
        "text-font-normal",
        "text-font-medium",
        "text-font-large",
        "text-font-big",
        "text-font-extrabig",
        "text-font-media-tile-eyebrow",
        "text-font-media-tile-headline",
        "text-navigation-font-basic",
        "text-navigation-font-basic-submenu",
        "text-utility-strip-icon",
        "text-callout-label-xs",
        "text-callout-card-column-base-affix",
        "text-callout-card-column-base-value",
        "text-callout-card-column-sm-value",
        "text-callout-card-column-xs-value",
      ],
    },
  },
});

/**
 * Merges Tailwind class names for server and client components.
 * Uses clsx for conditional classes and tailwind-merge for conflict resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type { ClassValue };
